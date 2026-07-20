"""End-to-end pipeline smoke test: create a submission, run the agents, inspect output.

Makes real OpenAI LLM calls (gpt-4o-mini) for intake/listing/marketing.
Images are dry-run (free) unless DRY_RUN_IMAGES=false.
"""

import io

from PIL import Image as PILImage

from app.agents.graph import run_pipeline
from app.agents.progress import build_progress
from app.config import get_settings
from app.db import SessionLocal
from app.models.tables import Image, Product, Seller, Submission
from app.security import hash_password
from app.services.storage import get_storage


def _emerald_png() -> bytes:
    img = PILImage.new("RGB", (512, 512), (18, 122, 92))
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def main() -> None:
    settings = get_settings()
    storage = get_storage()

    with SessionLocal() as db:
        # sync admin password to current env value
        admin = db.query(Seller).filter(Seller.is_admin.is_(True)).first()
        if admin:
            admin.password_hash = hash_password(settings.admin_password)

        seller = db.query(Seller).filter(Seller.email == "pipeline@test.com").first()
        if seller is None:
            seller = Seller(
                email="pipeline@test.com",
                name="Pipeline Tester",
                password_hash=hash_password("password123"),
            )
            db.add(seller)
        db.commit()

        sub = Submission(
            seller_id=seller.id,
            title="Emerald silk test",
            fabric_type="silk",
            color="emerald green",
            customization={
                "image_shots": ["flatlay", "macro"],
                "tone": "editorial",
                "audience": "designers",
                "length": "standard",
            },
            status="pending",
        )
        db.add(sub)
        db.flush()
        key = f"submissions/{sub.id}/raw_0.png"
        storage.save(key, _emerald_png())
        db.add(Image(submission_id=sub.id, kind="raw", storage_key=key, content_type="image/png"))
        db.commit()
        sid = sub.id

    print(f"Running pipeline for submission {sid} …\n")
    run_pipeline(sid)

    with SessionLocal() as db:
        sub = db.get(Submission, sid)
        product = db.query(Product).filter(Product.submission_id == sid).first()
        run = sub.pipeline_runs[-1] if sub.pipeline_runs else None
        progress = build_progress(run)

        print("=== PROGRESS ===")
        print("status:", sub.status, "| stage:", progress["current"], "| percent:", progress["percent"])
        for s in progress["stages"]:
            print(f"  [{s['status']:>7}] {s['label']:<16} {s['detail']}")
        print("tokens used:", progress["tokens"])
        if progress["failed"]:
            print("ERROR:", progress["error"])
            return

        print("\n=== EXTRACTED ATTRIBUTES ===")
        print(product.attributes)
        print("\n=== LISTING ===")
        print("title:", product.listing.get("title"))
        print("desc:", (product.listing.get("description_html") or "")[:160], "…")
        print("\n=== MARKETING ===")
        print(product.marketing.get("marketing_blurb"))
        print("hashtags:", product.marketing.get("hashtags"))

        gen = db.query(Image).filter(Image.submission_id == sid, Image.kind == "enhanced").all()
        print("\ngenerated images:", [i.shot_type for i in gen])
        print("shopify_status:", product.shopify_status)
        print("\nPIPELINE OK")


if __name__ == "__main__":
    main()
