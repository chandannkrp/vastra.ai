"""The five agent nodes of the vastra pipeline.

Each node loads what it needs from the DB (keyed by submission/run id in the
state), does its work, records progress, and returns a partial state update.
"""

import base64
import logging

from langchain_core.messages import HumanMessage, SystemMessage
from sqlalchemy import select

from app.agents.llm import get_chat_llm
from app.agents.progress import add_usage, finish_stage, start_stage
from app.agents.schemas import MarketingContent, ProductAttributes, ProductListing
from app.agents.state import PipelineState
from app.config import get_settings
from app.db import SessionLocal
from app.models.tables import Image, PipelineRun, Product, Submission
from app.services.openai_images import OpenAIImageService
from app.services.storage import get_storage

logger = logging.getLogger("vastra.agents")
settings = get_settings()
storage = get_storage()

SHOT_PROMPTS = {
    "flatlay": "a clean overhead flat-lay of the fabric neatly laid out",
    "draped": "the fabric elegantly draped to show its fall and sheen",
    "macro": "an extreme close-up showing the weave and texture detail",
    "on_model": "the fabric styled on a model as a simple garment",
}


def _get_run(db, rid: str) -> PipelineRun:
    return db.get(PipelineRun, rid)


def _usage(result: dict) -> tuple[int, int]:
    raw = result.get("raw")
    meta = getattr(raw, "usage_metadata", None) or {}
    return int(meta.get("input_tokens", 0)), int(meta.get("output_tokens", 0))


def _seller_hints(sub: Submission) -> str:
    parts = []
    for label, val in [
        ("title", sub.title),
        ("fabric type", sub.fabric_type),
        ("color", sub.color),
        ("width (in)", sub.width_inches),
        ("GSM", sub.gsm),
        ("notes", sub.notes),
    ]:
        if val:
            parts.append(f"{label}: {val}")
    return "; ".join(parts) or "(no details provided)"


# --------------------------------------------------------------------------- #
# 1. Intake / extraction agent (vision)
# --------------------------------------------------------------------------- #
def intake_node(state: PipelineState) -> PipelineState:
    sid, rid = state["submission_id"], state["run_id"]
    with SessionLocal() as db:
        run = _get_run(db, rid)
        start_stage(db, run, "extracting")
        sub = db.get(Submission, sid)
        raws = [i for i in sub.images if i.kind == "raw"]

        content: list = [
            {
                "type": "text",
                "text": (
                    "Analyze this fabric for an e-commerce listing. "
                    f"Seller-provided details — {_seller_hints(sub)}. "
                    "Return the structured fabric profile. If unsure about a field, "
                    "make your best guess and list it in low_confidence_fields."
                ),
            }
        ]
        for img in raws[:3]:  # cap for cost
            try:
                b64 = base64.b64encode(storage.load(img.storage_key)).decode()
                content.append(
                    {"type": "image_url", "image_url": {"url": f"data:{img.content_type};base64,{b64}"}}
                )
            except Exception as exc:  # noqa: BLE001
                logger.warning("could not load raw image %s: %s", img.id, exc)

        llm = get_chat_llm(0.2).with_structured_output(ProductAttributes, include_raw=True)
        result = llm.invoke(
            [
                SystemMessage(
                    "You are a textile expert who catalogues fabrics for a B2B marketplace. "
                    "Be precise and commercial."
                ),
                HumanMessage(content=content),
            ]
        )
        attrs: ProductAttributes = result["parsed"]
        add_usage(db, run, *_usage(result))

        product = db.scalar(select(Product).where(Product.submission_id == sid))
        if product is None:
            product = Product(submission_id=sid)
            db.add(product)
        product.attributes = attrs.model_dump()
        db.commit()

        finish_stage(
            db, run, "extracting",
            f"{attrs.fabric_type} · {', '.join(attrs.colors[:3]) or 'colour n/a'}",
        )
        return {"attributes": attrs.model_dump(), "product_id": product.id}


# --------------------------------------------------------------------------- #
# 2. Image agent (clean + generate)
# --------------------------------------------------------------------------- #
def image_node(state: PipelineState) -> PipelineState:
    sid, rid = state["submission_id"], state["run_id"]
    with SessionLocal() as db:
        run = _get_run(db, rid)
        start_stage(db, run, "enhancing")
        sub = db.get(Submission, sid)
        attrs = state.get("attributes", {})
        cust = sub.customization or {}
        shots = cust.get("image_shots") or ["flatlay", "draped"]
        shots = shots[: settings.max_images_per_submission]

        service = OpenAIImageService()
        descriptor = (
            f"{attrs.get('color') or ', '.join(attrs.get('colors', []))} "
            f"{attrs.get('pattern') or ''} {attrs.get('fabric_type', 'fabric')}"
        ).strip()

        # Prefer EDITING the seller's real photo so the true fabric colour/texture
        # is preserved; fall back to text-to-image only if no raw photo exists.
        raws = [i for i in sub.images if i.kind == "raw"]
        base_bytes = None
        if raws:
            try:
                import io

                from PIL import Image as PILImage

                im = PILImage.open(io.BytesIO(storage.load(raws[0].storage_key))).convert("RGB")
                buf = io.BytesIO()
                im.save(buf, format="PNG")
                base_bytes = buf.getvalue()
            except Exception as exc:  # noqa: BLE001
                logger.warning("could not load raw for edit: %s", exc)

        image_ids: list[str] = []
        for shot in shots:
            scene = SHOT_PROMPTS.get(shot, SHOT_PROMPTS["flatlay"])
            if base_bytes is not None:
                prompt = (
                    f"Restage this exact {descriptor} as a professional e-commerce "
                    f"product photo: {scene}."
                )
                png = service.edit(base_bytes, prompt)
            else:
                png = service.generate(f"Product photo of {descriptor}: {scene}.")
            key = f"submissions/{sid}/gen_{shot}.png"
            storage.save(key, png, "image/png")
            img = Image(
                submission_id=sid,
                kind="enhanced",
                shot_type=shot,
                storage_key=key,
                content_type="image/png",
            )
            db.add(img)
            db.flush()
            image_ids.append(img.id)
        db.commit()

        mode = "dry-run" if settings.dry_run_images else ("edited" if base_bytes else "generated")
        finish_stage(db, run, "enhancing", f"{len(image_ids)} images ({mode})")
        return {"generated_image_ids": image_ids}


# --------------------------------------------------------------------------- #
# 3. Listing agent
# --------------------------------------------------------------------------- #
def listing_node(state: PipelineState) -> PipelineState:
    sid, rid = state["submission_id"], state["run_id"]
    with SessionLocal() as db:
        run = _get_run(db, rid)
        start_stage(db, run, "drafting")
        sub = db.get(Submission, sid)
        attrs = state.get("attributes", {})
        cust = sub.customization or {}
        tone = cust.get("tone", "editorial")
        audience = cust.get("audience", "designers")
        length = cust.get("length", "standard")

        llm = get_chat_llm(0.5).with_structured_output(ProductListing, include_raw=True)
        result = llm.invoke(
            [
                SystemMessage(
                    "You write Shopify product listings for a premium fabric marketplace. "
                    "Return clean semantic HTML for the description (no <html>/<body> wrapper)."
                ),
                HumanMessage(
                    f"Fabric profile: {attrs}. "
                    f"Write the listing in a {tone} tone for an audience of {audience}. "
                    f"Description length: {length}. Include care guidance if relevant."
                ),
            ]
        )
        listing: ProductListing = result["parsed"]
        add_usage(db, run, *_usage(result))

        product = db.scalar(select(Product).where(Product.submission_id == sid))
        product.listing = listing.model_dump()
        db.commit()

        finish_stage(db, run, "drafting", listing.title)
        return {"listing": listing.model_dump()}


# --------------------------------------------------------------------------- #
# 4. Marketing / lookbook agent
# --------------------------------------------------------------------------- #
def marketing_node(state: PipelineState) -> PipelineState:
    sid, rid = state["submission_id"], state["run_id"]
    with SessionLocal() as db:
        run = _get_run(db, rid)
        start_stage(db, run, "marketing")
        attrs = state.get("attributes", {})
        listing = state.get("listing", {})

        llm = get_chat_llm(0.7).with_structured_output(MarketingContent, include_raw=True)
        result = llm.invoke(
            [
                SystemMessage("You are a fashion marketing copywriter for a fabric brand."),
                HumanMessage(
                    f"Fabric: {attrs}. Listing title: {listing.get('title')}. "
                    "Write a lookbook caption, a short marketing hook, hashtags, and a "
                    "collection suggestion."
                ),
            ]
        )
        marketing: MarketingContent = result["parsed"]
        add_usage(db, run, *_usage(result))

        product = db.scalar(select(Product).where(Product.submission_id == sid))
        product.marketing = marketing.model_dump()
        db.commit()

        finish_stage(db, run, "marketing", marketing.marketing_blurb[:60])
        return {"marketing": marketing.model_dump()}


# --------------------------------------------------------------------------- #
# 5. Publisher agent (Shopify)
# --------------------------------------------------------------------------- #
def publisher_node(state: PipelineState) -> PipelineState:
    sid, rid = state["submission_id"], state["run_id"]
    with SessionLocal() as db:
        run = _get_run(db, rid)
        start_stage(db, run, "publishing")
        sub = db.get(Submission, sid)
        product = db.scalar(select(Product).where(Product.submission_id == sid))

        connected = bool(settings.shopify_store_domain and settings.shopify_admin_token)
        if connected:
            # Real Shopify publishing is wired in the Shopify-integration slice.
            # Until the store handshake is confirmed, stage as DRAFT locally.
            product.shopify_status = "DRAFT"
            detail = "Draft prepared for Shopify."
        else:
            product.shopify_status = "draft_local"
            detail = "Shopify not connected — product staged, ready to publish."

        sub.status = "awaiting_review"
        run.stage = "published"
        db.commit()

        finish_stage(db, run, "published", detail)
        return {}
