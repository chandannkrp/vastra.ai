"""Token top-ups via Stripe Checkout.

If STRIPE_SECRET_KEY is set, /checkout returns a Stripe-hosted checkout URL and
tokens are credited on verified payment (via /verify on redirect, and the
webhook). If Stripe is not configured, /checkout falls back to an instant mock
credit so the flow is testable end-to-end without keys.
"""

import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.config import get_settings
from app.db import get_db
from app.models.tables import Seller, TokenPurchase
from app.services.pricing import TOKEN_PACKS, pack_by_id

logger = logging.getLogger("vastra.billing")
router = APIRouter(prefix="/billing", tags=["billing"])
settings = get_settings()


def _stripe_enabled() -> bool:
    return bool(settings.stripe_secret_key)


def _credit(db: Session, purchase: TokenPurchase) -> None:
    """Idempotently credit a paid purchase to the seller's token limit."""
    if purchase.status == "paid":
        return
    seller = db.get(Seller, purchase.seller_id)
    if seller is not None:
        seller.token_limit += purchase.tokens
    purchase.status = "paid"
    db.commit()


@router.get("/packs")
def list_packs() -> dict:
    return {"packs": TOKEN_PACKS, "currency": settings.currency, "stripe": _stripe_enabled()}


@router.post("/checkout")
def create_checkout(
    body: dict, user: Seller = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    pack = pack_by_id(body.get("pack_id", ""))
    if pack is None:
        raise HTTPException(status_code=400, detail="Unknown pack")

    purchase = TokenPurchase(
        seller_id=user.id,
        pack_id=pack["id"],
        tokens=pack["tokens"],
        amount=pack["amount"],
        currency=settings.currency,
        provider="stripe" if _stripe_enabled() else "mock",
        status="pending",
    )
    db.add(purchase)
    db.flush()

    if not _stripe_enabled():
        # No Stripe configured — credit instantly (dev/demo).
        _credit(db, purchase)
        return {"mock": True, "credited": pack["tokens"]}

    stripe.api_key = settings.stripe_secret_key
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[
            {
                "price_data": {
                    "currency": settings.currency,
                    "product_data": {"name": f"{pack['label']} — {pack['tokens']:,} tokens"},
                    "unit_amount": pack["amount"],
                },
                "quantity": 1,
            }
        ],
        success_url=settings.checkout_success_url + "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url=settings.checkout_cancel_url,
        metadata={"purchase_id": purchase.id, "seller_id": user.id, "pack_id": pack["id"]},
    )
    purchase.stripe_session_id = session.id
    db.commit()
    return {"mock": False, "url": session.url}


@router.post("/verify")
def verify_checkout(
    body: dict, user: Seller = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    session_id = body.get("session_id")
    if not session_id or not _stripe_enabled():
        return {"ok": False}
    stripe.api_key = settings.stripe_secret_key
    session = stripe.checkout.Session.retrieve(session_id)
    purchase = db.scalar(select(TokenPurchase).where(TokenPurchase.stripe_session_id == session_id))
    if purchase is None or purchase.seller_id != user.id:
        raise HTTPException(status_code=404, detail="Purchase not found")
    if session.payment_status == "paid":
        _credit(db, purchase)
        return {"ok": True, "credited": purchase.tokens}
    return {"ok": False, "status": session.payment_status}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    if not settings.stripe_webhook_secret:
        return {"ignored": True}
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        purchase_id = event["data"]["object"]["metadata"].get("purchase_id")
        purchase = db.get(TokenPurchase, purchase_id) if purchase_id else None
        if purchase is not None:
            _credit(db, purchase)
    return {"received": True}
