"""Adapter for Semantic Scholar to map to SourceDocument."""
import datetime
from typing import Any

from backend.schemas.source import SourceDocument


class SemanticScholarAdapter:
    """Transforms Semantic Scholar JSON to internal SourceDocument."""

    @staticmethod
    def normalize_paper(paper: dict[str, Any]) -> SourceDocument:
        """
        Map a single Semantic Scholar paper record.
        """
        paper_id = paper.get("paperId") or "unknown"
        title = paper.get("title") or "Untitled"
        abstract = paper.get("abstract")

        # Basic metadata
        year = paper.get("year")
        venue = paper.get("venue")
        url = paper.get("url")
        citation_count = paper.get("citationCount", 0)
        authors = paper.get("authors", [])

        # Parse published date (approximation from year)
        published_at = None
        if year:
            try:
                published_at = datetime.datetime(year=int(year), month=1, day=1, tzinfo=datetime.timezone.utc)
            except ValueError:
                pass

        # Build combined text
        text_parts = [f"Title: {title}"]
        if abstract:
            text_parts.append(f"Abstract: {abstract}")
        author_names = [a.get("name") for a in authors if a.get("name")]
        if author_names:
            text_parts.append(f"Authors: {', '.join(author_names)}")
        if venue:
            text_parts.append(f"Venue: {venue}")

        text = "\n\n".join(text_parts)

        # Retain original payload selectively in metadata
        metadata = {
            "year": year,
            "venue": venue,
            "citation_count": citation_count,
            "externalIds": paper.get("externalIds", {}),
            "authors": author_names,
        }

        return SourceDocument(
            source="semantic_scholar",
            source_id=paper_id,
            entity_type="paper",
            title=title,
            text=text,
            url=url,
            published_at=published_at,
            metadata=metadata
        )
