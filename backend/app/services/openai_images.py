"""OpenAI image generation/editing for fabric product imagery.

Uses `gpt-image-1`. Two entry points:
- `generate(prompt)`     — create a new product image from a text prompt.
- `edit(image, prompt)`  — clean/relight/restyle an uploaded raw photo.

Cost discipline for dev/testing:
- `quality="low"`, `size="1024x1024"`, `n=1` by default (configurable).
- `DRY_RUN_IMAGES=true` short-circuits to a generated placeholder PNG, so the
  whole agent/UI flow can be exercised without spending on the API.
"""

import base64
import io

from app.config import get_settings

settings = get_settings()

# Baseline instruction shared by clean/generate prompts. Fabric commerce lives
# and dies on color fidelity, so this is non-negotiable.
COLOR_FIDELITY_RULE = (
    "Preserve the fabric's exact true color, hue, saturation, weave and pattern. "
    "Do not stylize or shift the color in any way. Clean, evenly-lit, professional "
    "e-commerce product photography on a neutral studio background."
)


class OpenAIImageService:
    def __init__(self):
        self._client = None  # lazy: dry-run needs no key

    @property
    def client(self):
        if self._client is None:
            from openai import OpenAI

            if not settings.openai_api_key:
                raise RuntimeError("OPENAI_API_KEY not configured")
            self._client = OpenAI(api_key=settings.openai_api_key)
        return self._client

    # -- public API -------------------------------------------------------

    def generate(self, prompt: str) -> bytes:
        """Generate a fresh product image. Returns PNG bytes."""
        full_prompt = f"{prompt}\n\n{COLOR_FIDELITY_RULE}"
        if settings.dry_run_images:
            return _placeholder_png(prompt)
        result = self.client.images.generate(
            model=settings.openai_image_model,
            prompt=full_prompt,
            size=settings.openai_image_size,
            quality=settings.openai_image_quality,
            n=1,
        )
        return base64.b64decode(result.data[0].b64_json)

    def edit(self, image_bytes: bytes, prompt: str, filename: str = "input.png") -> bytes:
        """Clean/relight/restyle an existing photo. Returns PNG bytes."""
        full_prompt = f"{prompt}\n\n{COLOR_FIDELITY_RULE}"
        if settings.dry_run_images:
            return _placeholder_png(prompt)
        buf = io.BytesIO(image_bytes)
        buf.name = filename
        result = self.client.images.edit(
            model=settings.openai_image_model,
            image=buf,
            prompt=full_prompt,
            size=settings.openai_image_size,
            quality=settings.openai_image_quality,
            n=1,
        )
        return base64.b64decode(result.data[0].b64_json)


def _placeholder_png(label: str) -> bytes:
    """A cheap local placeholder image so dev flows never hit the paid API."""
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (1024, 1024), (244, 241, 234))
    draw = ImageDraw.Draw(img)
    draw.rectangle([32, 32, 992, 992], outline=(180, 120, 90), width=6)
    text = f"[dry-run image]\n{label[:80]}"
    draw.multiline_text((64, 480), text, fill=(120, 90, 70), spacing=8)
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()
