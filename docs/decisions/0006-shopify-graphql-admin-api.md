# 0006 — Publish via Shopify Admin GraphQL API to the existing Impulse store

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** Chandan

## Context

Chandan already runs a **live Shopify store on the Impulse theme**. vastra.ai must
publish the processed listings there rather than build a storefront from scratch.
Shopify exposes two admin APIs: the older REST API and the GraphQL Admin API.
Shopify is actively deprecating REST in favor of GraphQL.

## Decision

Publish through the **Shopify Admin GraphQL API** using a **custom-app admin
token** on the existing store (`app/services/shopify.py`). The Publisher agent
uses `productCreate` → `stagedUploadsCreate` + `productCreateMedia` →
`metafieldsSet`, creating products as **DRAFT** and flipping to **ACTIVE** on
reviewer approval. The operation is **idempotent** via the stored product GID.

## Rationale

- Reuses the seller's existing, already-configured storefront and theme — no
  storefront to build or maintain.
- GraphQL is Shopify's forward-looking API; REST is on a deprecation path. Building
  on GraphQL avoids a near-term migration.
- A custom app (created in the store admin) gives a scoped admin token
  (`read_products, write_products, write_files`) without the OAuth/app-review
  overhead of a public app — right for a single-store, first-party integration.
- Fabric-specific data (GSM, width, composition, care) maps naturally to Shopify
  **metafields**, keeping the Impulse product model clean.

## Consequences

- Products land as DRAFT and require human approval before going live — a
  deliberate safety gate, not just a Shopify default.
- Publishing is idempotent: re-running a submission updates the existing product
  (keyed on GID) rather than creating a duplicate.
- If vastra.ai later needs to serve *multiple* stores, the custom-app token model
  would need to become a public OAuth app — a known future migration, out of MVP
  scope.
- Tied to Shopify's API version (`SHOPIFY_API_VERSION`); versions must be bumped
  periodically as Shopify retires old ones.
