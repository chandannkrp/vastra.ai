"""Shopify Admin GraphQL client + publisher for the live store.

Publishing uses the modern `productSet` mutation (synchronous), which creates a
product with title, description, images (by URL), a priced variant, tags and
type in one call. Images are passed as presigned S3 URLs so Shopify fetches
them directly. Metafields (fabric attributes) and collections are set as
follow-up mutations.
"""

import time
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import get_settings

settings = get_settings()


class ShopifyError(Exception):
    pass


@dataclass
class ShopifyCreds:
    """One store's credentials — per-seller (from the DB) or global (from env)."""

    store_domain: str = ""
    admin_token: str = ""
    client_id: str = ""
    client_secret: str = ""

    @property
    def configured(self) -> bool:
        return bool(
            self.store_domain and (self.admin_token or (self.client_id and self.client_secret))
        )


def env_creds() -> ShopifyCreds:
    """Global fallback credentials from environment (dev / single-store setups)."""
    return ShopifyCreds(
        store_domain=settings.shopify_store_domain,
        admin_token=settings.shopify_admin_token,
        client_id=settings.shopify_client_id,
        client_secret=settings.shopify_client_secret,
    )


# In-memory cache of client-credentials tokens: cache-key -> (token, expiry_epoch).
# Tokens live 24h; we refresh a minute early. Fine for a single-process dev/app
# server — swap for a shared cache if you scale to multiple workers.
_token_cache: dict[str, tuple[str, float]] = {}


def _fetch_token_via_client_credentials(domain: str, client_id: str, client_secret: str) -> tuple[str, int]:
    """Server-to-server exchange (no redirect URL needed — works in local dev)."""
    resp = httpx.post(
        f"https://{domain}/admin/oauth/access_token",
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30,
    )
    if resp.status_code != 200:
        raise ShopifyError(
            f"Client-credentials token exchange failed ({resp.status_code}): {resp.text[:200]}. "
            "Check the store domain, that the app is installed on a store you own, and that access "
            "scopes are configured on the app."
        )
    data = resp.json()
    return data["access_token"], int(data.get("expires_in", 86399))


def resolve_admin_token(creds: ShopifyCreds | None = None) -> str | None:
    """The Admin API token for these creds.

    Prefers a static admin token (shpat_…). Otherwise, if a Client ID + Secret
    are present, mints one via the client-credentials grant and caches it until
    it nears expiry.
    """
    creds = creds or env_creds()
    if creds.admin_token:
        return creds.admin_token
    if not (creds.store_domain and creds.client_id and creds.client_secret):
        return None
    key = f"{creds.store_domain}:{creds.client_id}"
    now = time.time()
    cached = _token_cache.get(key)
    if cached and cached[1] - 60 > now:
        return cached[0]
    token, expires_in = _fetch_token_via_client_credentials(
        creds.store_domain, creds.client_id, creds.client_secret
    )
    _token_cache[key] = (token, now + expires_in)
    return token


def shopify_configured(creds: ShopifyCreds | None = None) -> bool:
    """True when we can obtain an Admin API token (static or via client creds)."""
    return (creds or env_creds()).configured


def creds_for_seller(db, seller_id: str) -> ShopifyCreds:
    """A seller's own store credentials, falling back to global env creds.

    Kept import-light (``db`` is a Session) so services stay decoupled from the
    ORM import graph.
    """
    from app.models.tables import ShopifyConnection

    conn = db.query(ShopifyConnection).filter(ShopifyConnection.seller_id == seller_id).first()
    if conn and conn.store_domain:
        return ShopifyCreds(
            store_domain=conn.store_domain,
            admin_token=conn.admin_token or "",
            client_id=conn.client_id or "",
            client_secret=conn.client_secret or "",
        )
    return env_creds()


class ShopifyClient:
    def __init__(self, creds: ShopifyCreds | None = None):
        creds = creds or env_creds()
        token = resolve_admin_token(creds)
        if not creds.store_domain or not token:
            raise ShopifyError(
                "Shopify credentials not configured. Provide a store domain plus either an "
                "Admin API access token (shpat_…) or a Client ID + Client Secret."
            )
        self.domain = creds.store_domain
        self.url = f"https://{self.domain}/admin/api/{settings.shopify_api_version}/graphql.json"
        self.headers = {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json",
        }

    def execute(self, query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
        resp = httpx.post(
            self.url, headers=self.headers, json={"query": query, "variables": variables or {}}, timeout=90
        )
        if resp.status_code == 401:
            raise ShopifyError(
                "Unauthorized (401). The token is not a valid Admin API access token — it must "
                "start with 'shpat_'. Reveal it under your custom app's API credentials."
            )
        resp.raise_for_status()
        payload = resp.json()
        if payload.get("errors"):
            raise ShopifyError(str(payload["errors"]))
        return payload["data"]

    def ping(self) -> dict[str, Any]:
        data = self.execute(
            "{ shop { name primaryDomain { url } currencyCode } }"
        )
        return data["shop"]

    def list_collections(self, limit: int = 100) -> list[dict[str, Any]]:
        data = self.execute(
            """
            query($n: Int!) {
              collections(first: $n) {
                nodes { id title handle productsCount { count } }
              }
            }
            """,
            {"n": limit},
        )
        return data["collections"]["nodes"]

    def admin_product_url(self, gid: str) -> str:
        pid = gid.rsplit("/", 1)[-1]
        return f"https://{self.domain}/admin/products/{pid}"


class ShopifyPublisher:
    """Publishes a processed vastra product to Shopify."""

    def __init__(self, creds: ShopifyCreds | None = None):
        self.client = ShopifyClient(creds)

    def publish(
        self,
        *,
        title: str,
        description_html: str,
        product_type: str | None,
        vendor: str | None,
        tags: list[str],
        status: str,  # "DRAFT" | "ACTIVE"
        price: float | None,
        compare_at_price: float | None,
        image_urls: list[tuple[str, str]],  # (presigned_url, alt)
        metafields: dict[str, str],
        collection_ids: list[str],
        existing_gid: str | None = None,
    ) -> dict[str, Any]:
        files = [
            {
                "originalSource": url,
                "alt": alt or title,
                "filename": f"{title[:40].replace(' ', '_')}_{i}.png",
                "contentType": "IMAGE",
            }
            for i, (url, alt) in enumerate(image_urls)
        ]

        product_input: dict[str, Any] = {
            "title": title,
            "descriptionHtml": description_html or "",
            "status": status,
            "tags": tags,
        }
        if product_type:
            product_input["productType"] = product_type
        if vendor:
            product_input["vendor"] = vendor
        if files:
            product_input["files"] = files
        if price is not None:
            # The productSet mutation requires a variant to reference a product
            # option. For a single default variant we declare the implicit
            # "Title / Default Title" option and point the variant at it.
            variant: dict[str, Any] = {
                "price": float(price),
                "optionValues": [{"optionName": "Title", "name": "Default Title"}],
            }
            if compare_at_price is not None:
                variant["compareAtPrice"] = float(compare_at_price)
            product_input["productOptions"] = [
                {"name": "Title", "position": 1, "values": [{"name": "Default Title"}]}
            ]
            product_input["variants"] = [variant]

        variables: dict[str, Any] = {"synchronous": True, "input": product_input}
        if existing_gid:
            variables["identifier"] = {"id": existing_gid}

        data = self.client.execute(
            """
            mutation vastraPublish($synchronous: Boolean!, $input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
              productSet(synchronous: $synchronous, input: $input, identifier: $identifier) {
                product { id handle onlineStoreUrl status }
                userErrors { field message }
              }
            }
            """,
            variables,
        )
        result = data["productSet"]
        if result["userErrors"]:
            raise ShopifyError(str(result["userErrors"]))
        product = result["product"]
        gid = product["id"]

        if metafields:
            self._set_metafields(gid, metafields)
        if collection_ids:
            self._add_to_collections(gid, collection_ids)

        return {
            "gid": gid,
            "status": product.get("status"),
            "admin_url": self.client.admin_product_url(gid),
            "online_url": product.get("onlineStoreUrl"),
        }

    def _set_metafields(self, gid: str, fields: dict[str, str]) -> None:
        type_map = {
            "gsm": "number_decimal",
            "width": "number_decimal",
            "composition": "single_line_text_field",
            "care": "multi_line_text_field",
            "set_contents": "multi_line_text_field",
        }
        metafields = [
            {
                "ownerId": gid,
                "namespace": "vastra",
                "key": key,
                "type": type_map.get(key, "single_line_text_field"),
                "value": str(value),
            }
            for key, value in fields.items()
            if value not in (None, "")
        ]
        if not metafields:
            return
        self.client.execute(
            """
            mutation($metafields: [MetafieldsSetInput!]!) {
              metafieldsSet(metafields: $metafields) {
                userErrors { field message }
              }
            }
            """,
            {"metafields": metafields},
        )

    def _add_to_collections(self, gid: str, collection_ids: list[str]) -> None:
        for cid in collection_ids:
            self.client.execute(
                """
                mutation($id: ID!, $productIds: [ID!]!) {
                  collectionAddProductsV2(id: $id, productIds: $productIds) {
                    userErrors { field message }
                  }
                }
                """,
                {"id": cid, "productIds": [gid]},
            )
