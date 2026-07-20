"""Typed state that flows between LangGraph nodes.

Nodes are keyed by `submission_id` / `run_id` and load what they need from the
DB, returning partial state updates the graph merges.
"""

from typing_extensions import TypedDict


class PipelineState(TypedDict, total=False):
    submission_id: str
    run_id: str
    product_id: str
    attributes: dict
    generated_image_ids: list[str]
    listing: dict
    marketing: dict
    error: str
