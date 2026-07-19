"""Gemini image editing service — cleans up raw smartphone fabric photos.

Wraps the google-genai SDK. The enhancement prompt is tuned for fabric
commerce: fix lighting/background WITHOUT shifting the fabric's true color,
because buyers purchase on color fidelity.
"""

from google import genai
from google.genai import types

from app.config import get_settings

settings = get_settings()

ENHANCE_PROMPT = """Edit this fabric product photo for an e-commerce listing:
- Replace the background with a clean, neutral studio background (soft white/light grey).
- Correct the lighting and white balance so the fabric is evenly lit.
- Remove shadows, clutter, hands, and any objects that are not the fabric.
- CRITICAL: preserve the fabric's exact true color, pattern, weave and texture.
  Do NOT change hue, saturation, or the pattern in any way — buyers purchase
  based on the precise color of the fabric.
- Keep the fabric's natural drape and folds. Output a sharp, professional
  product photograph."""


class GeminiImageService:
    def __init__(self):
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")
        self.client = genai.Client(api_key=settings.gemini_api_key)

    def enhance(self, image_bytes: bytes, content_type: str, extra_instructions: str = "") -> bytes:
        """Return an enhanced version of the image. Raises if no image is returned."""
        prompt = ENHANCE_PROMPT if not extra_instructions else f"{ENHANCE_PROMPT}\n\nAdditional instructions from quality review:\n{extra_instructions}"
        response = self.client.models.generate_content(
            model=settings.gemini_image_model,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=content_type),
                prompt,
            ],
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                return part.inline_data.data
        raise RuntimeError("Gemini returned no image in response")
