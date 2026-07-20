"""Structured-output schemas the LLM agents must return (validated by LangChain)."""

from pydantic import BaseModel, Field


class ProductAttributes(BaseModel):
    """Extraction agent output — the structured fabric profile."""

    suggested_title: str = Field(description="Concise, sellable product title")
    fabric_type: str = Field(description="e.g. silk, cotton, linen, georgette")
    weave: str | None = Field(default=None, description="e.g. plain, twill, satin, jacquard")
    composition: str | None = Field(default=None, description="e.g. 100% mulberry silk")
    colors: list[str] = Field(default_factory=list, description="Primary colour names")
    pattern: str | None = Field(default=None, description="e.g. solid, floral, striped, block-print")
    category: str = Field(description="Product category, e.g. 'Dress Fabric'")
    tags: list[str] = Field(default_factory=list, description="Search tags")
    low_confidence_fields: list[str] = Field(
        default_factory=list,
        description="Field names the seller should confirm (uncertain guesses)",
    )


class ProductListing(BaseModel):
    """Listing agent output — Shopify-ready listing content."""

    title: str
    seo_title: str
    description_html: str = Field(description="Clean HTML product description")
    product_type: str
    tags: list[str] = Field(default_factory=list)
    care_instructions: str | None = None


class MarketingContent(BaseModel):
    """Marketing/lookbook agent output."""

    lookbook_caption: str = Field(description="Short evocative caption for a lookbook")
    marketing_blurb: str = Field(description="1-2 sentence marketing hook")
    hashtags: list[str] = Field(default_factory=list)
    collection_suggestion: str | None = Field(
        default=None, description="Suggested Shopify collection to place this in"
    )
