"""Token packs, priced on real production cost + a 30% margin.

Cost model (generous, per product run):
- LLM (gpt-4o-mini vision + copy): ~10k tokens  ≈ $0.005
- Images (gpt-image-1, 3-4 shots)              ≈ $0.05
  → billed as image_token_cost (20k) tokens each so usage reflects real spend.
- Effective consumption per product ≈ ~70k tokens, real cost ≈ $0.055.

So our blended cost ≈ $0.78 / 1M tokens. With a 30% margin we sell at
≈ $1.02 / 1M tokens (~₹85 / 1M at ₹83/$). Pack prices below apply that rate,
rounded to clean numbers. Amounts are in the smallest currency unit (paise).
"""

COST_PER_MILLION_USD = 0.78
MARGIN = 0.30
SELL_PER_MILLION_USD = COST_PER_MILLION_USD * (1 + MARGIN)  # ≈ 1.01

# id, human label, tokens granted, price in paise (INR)
TOKEN_PACKS: list[dict] = [
    {"id": "starter", "label": "Starter", "tokens": 2_000_000, "amount": 24900, "approx_products": 28},
    {"id": "studio", "label": "Studio", "tokens": 10_000_000, "amount": 119900, "approx_products": 140, "popular": True},
    {"id": "scale", "label": "Scale", "tokens": 40_000_000, "amount": 449900, "approx_products": 570},
]


def pack_by_id(pack_id: str) -> dict | None:
    return next((p for p in TOKEN_PACKS if p["id"] == pack_id), None)
