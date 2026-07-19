from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR.parent / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    app_name: str = "vastra.ai"
    debug: bool = True
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7

    # Database
    database_url: str = f"sqlite:///{BASE_DIR / 'vastra.db'}"

    # Object storage: "local" for dev, "s3" for Cloudflare R2 / S3 in prod
    storage_backend: str = "local"
    storage_local_dir: Path = BASE_DIR / "storage"
    s3_endpoint_url: str = ""
    s3_bucket: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""

    # AI providers
    anthropic_api_key: str = ""
    claude_model: str = "claude-opus-4-8"
    gemini_api_key: str = ""
    gemini_image_model: str = "gemini-2.5-flash-image"

    # Shopify (custom app on the live Impulse store)
    shopify_store_domain: str = ""  # e.g. "your-store.myshopify.com"
    shopify_admin_token: str = ""
    shopify_api_version: str = "2026-01"


@lru_cache
def get_settings() -> Settings:
    return Settings()
