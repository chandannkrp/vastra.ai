"""Shopify Admin GraphQL API client for the live Impulse store.

Uses a custom-app admin token. All product operations go through GraphQL —
productCreate / productUpdate for the product, stagedUploadsCreate +
productCreateMedia for images, metafieldsSet for fabric attributes.
"""

from typing import Any

import httpx

from app.config import get_settings

settings = get_settings()


class ShopifyError(Exception):
    pass


class ShopifyClient:
    def __init__(self):
        if not settings.shopify_store_domain or not settings.shopify_admin_token:
            raise ShopifyError("Shopify credentials not configured (SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_TOKEN)")
        self.url = (
            f"https://{settings.shopify_store_domain}"
            f"/admin/api/{settings.shopify_api_version}/graphql.json"
        )
        self.headers = {
            "X-Shopify-Access-Token": settings.shopify_admin_token,
            "Content-Type": "application/json",
        }

    def execute(self, query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
        resp = httpx.post(
            self.url,
            headers=self.headers,
            json={"query": query, "variables": variables or {}},
            timeout=60,
        )
        resp.raise_for_status()
        payload = resp.json()
        if payload.get("errors"):
            raise ShopifyError(str(payload["errors"]))
        return payload["data"]

    def ping(self) -> dict[str, Any]:
        """Cheap connectivity check — returns shop name and primary domain."""
        data = self.execute("{ shop { name primaryDomain { url } } }")
        return data["shop"]
