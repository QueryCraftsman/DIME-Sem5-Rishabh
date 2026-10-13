"""
DIME Source Document Schema.
Provides a source-agnostic representation of an acquired document/entity.
"""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class SourceDocument(BaseModel):
    """Common representation for any ingested data source."""

    source: str = Field(
        ..., description="The integration source (e.g., 'github', 'semantic_scholar')"
    )
    source_id: str = Field(
        ..., description="The unique identity within the source (e.g., repository ID)"
    )
    entity_type: str = Field(..., description="The type of entity (e.g., 'repository', 'paper')")

    title: str = Field(..., description="The title or name of the document")
    text: str | None = Field(None, description="The main content (e.g., description + README)")
    url: str | None = Field(None, description="The URL to the source document")

    published_at: datetime | None = Field(
        None, description="When the document was published/created"
    )
    retrieved_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), description="When DIME retrieved it"
    )

    metadata: dict[str, Any] = Field(default_factory=dict, description="Source-specific metadata")
