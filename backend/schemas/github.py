"""
GitHub API Specific Schemas.
"""

from pydantic import BaseModel, Field

from backend.schemas.source import SourceDocument


class GitHubRateLimit(BaseModel):
    limit: int = 0
    remaining: int = 0
    reset_epoch: int = 0
    used: int = 0


class GitHubSearchResult(BaseModel):
    """Structured result of a GitHub search process."""

    documents: list[SourceDocument] = Field(
        default_factory=list, description="The resulting mapped documents."
    )
    total_found: int = Field(0, description="Total number of results reported by the API.")
    returned: int = Field(0, description="Number of results actually retrieved and processed.")
    rate_limit: GitHubRateLimit | None = Field(None, description="Rate limit info at completion.")
    partial: bool = Field(
        False, description="True if the request stopped early due to rate limits or budgets."
    )
