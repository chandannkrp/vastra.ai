"""Connectors — the Shopify Admin API connection to the live store."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.config import get_settings
from app.models.tables import Seller
from app.schemas.catalog import ConnectorStatus
from app.services.shopify import ShopifyClient, ShopifyError

router = APIRouter(prefix="/connectors", tags=["connectors"])
settings = get_settings()


@router.get("/shopify", response_model=ConnectorStatus)
def shopify_status(_: Seller = Depends(get_current_user)) -> ConnectorStatus:
    configured = bool(settings.shopify_store_domain and settings.shopify_admin_token)
    if not configured:
        return ConnectorStatus(
            connected=False,
            store_domain=settings.shopify_store_domain or None,
            detail="Shopify credentials not set. Add SHOPIFY_STORE_DOMAIN and "
            "SHOPIFY_ADMIN_TOKEN to connect the live store.",
        )
    # Credentials present — verify with a live ping.
    try:
        shop = ShopifyClient().ping()
        return ConnectorStatus(
            connected=True,
            store_domain=settings.shopify_store_domain,
            shop_name=shop.get("name"),
            detail="Connected to the live store.",
        )
    except (ShopifyError, Exception) as exc:  # noqa: BLE001
        return ConnectorStatus(
            connected=False,
            store_domain=settings.shopify_store_domain,
            detail=f"Credentials set but connection failed: {exc}",
        )
