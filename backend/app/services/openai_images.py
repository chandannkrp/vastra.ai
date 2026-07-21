"""Backwards-compatible re-exports.

Image generation moved to `app.services.image_gen`, which supports multiple
providers (Gemini 2.5 Flash Image by default, gpt-image-1 as an alternative).
This module is kept so existing imports keep working.
"""

from app.services.image_gen import (  # noqa: F401
    FABRIC_FIDELITY_RULE,
    GeminiImageService,
    OpenAIImageService,
    get_image_service,
)
