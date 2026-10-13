"""Research API Specific Schemas."""

from pydantic import BaseModel, Field

from backend.schemas.source import SourceDocument


class ResearchSearchResult(BaseModel):
    """Structured result of a Research API search process."""

    documents: list[SourceDocument] = Field(
        default_factory=list, description="The resulting mapped documents from research APIs."
    )
    total_found: int = Field(0, description="Total number of results reported by the APIs.")
    returned: int = Field(0, description="Number of results actually retrieved and processed.")
    partial: bool = Field(
        False, description="True if the request stopped early due to rate limits or errors."
    )
    providers_used: list[str] = Field(
        default_factory=list, description="List of providers successfully queried."
    )
