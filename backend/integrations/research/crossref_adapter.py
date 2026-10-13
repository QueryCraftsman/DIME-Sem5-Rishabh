"""Adapter for Crossref to map to SourceDocument."""
import datetime
from typing import Any

from backend.schemas.source import SourceDocument


class CrossrefAdapter:
    """Transforms Crossref JSON to internal SourceDocument."""

    @staticmethod
    def _parse_date(date_parts: list[list[int]]) -> datetime.datetime | None:
        """Parse Crossref date-parts array: [[YYYY, MM, DD]]."""
        if not date_parts or not date_parts[0]:
            return None
        parts = date_parts[0]
        year = parts[0]
        month = parts[1] if len(parts) > 1 else 1
        day = parts[2] if len(parts) > 2 else 1
        try:
            return datetime.datetime(year=year, month=month, day=day, tzinfo=datetime.timezone.utc)
        except ValueError:
            return None

    @staticmethod
    def normalize_work(work: dict[str, Any]) -> SourceDocument:
        """
        Map a single Crossref work record.
        """
        doi = work.get("DOI") or "unknown"
        
        # Title is an array
        title_array = work.get("title", [])
        title = title_array[0] if title_array else "Untitled"
        
        abstract = work.get("abstract")

        # Basic metadata
        url = work.get("URL")
        container_title_array = work.get("container-title", [])
        venue = container_title_array[0] if container_title_array else None
        publisher = work.get("publisher")
        work_type = work.get("type", "unknown")
        
        authors = work.get("author", [])

        # Parse published date
        published_at = None
        for date_field in ["published-print", "published-online", "issued"]:
            if date_field in work and "date-parts" in work[date_field]:
                published_at = CrossrefAdapter._parse_date(work[date_field]["date-parts"])
                if published_at:
                    break

        # Build combined text
        text_parts = [f"Title: {title}"]
        if abstract:
            text_parts.append(f"Abstract: {abstract}")
        author_names = []
        for a in authors:
            name = f"{a.get('given', '')} {a.get('family', '')}".strip()
            if name:
                author_names.append(name)
        if author_names:
            text_parts.append(f"Authors: {', '.join(author_names)}")
        if venue:
            text_parts.append(f"Venue: {venue}")
        if publisher:
            text_parts.append(f"Publisher: {publisher}")

        text = "\n\n".join(text_parts)

        metadata = {
            "venue": venue,
            "publisher": publisher,
            "type": work_type,
            "authors": author_names,
            "subject": work.get("subject", [])
        }

        return SourceDocument(
            source="crossref",
            source_id=doi,
            entity_type="paper",
            title=title,
            text=text,
            url=url,
            published_at=published_at,
            metadata=metadata
        )
