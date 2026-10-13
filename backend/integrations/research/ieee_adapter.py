"""Adapter for IEEE Xplore to map to SourceDocument."""
import datetime
from typing import Any

from backend.schemas.source import SourceDocument


class IEEEXploreAdapter:
    """Transforms IEEE Xplore JSON to internal SourceDocument."""

    @staticmethod
    def normalize_article(article: dict[str, Any]) -> SourceDocument:
        """
        Map a single IEEE Xplore article record.
        """
        # IEEE uses article_number as stable ID
        article_id = article.get("article_number") or article.get("doi") or "unknown"
        title = article.get("title", "Untitled")
        abstract = article.get("abstract")

        # Basic metadata
        url = article.get("document_link") or article.get("pdf_url")
        doi = article.get("doi")
        publication_title = article.get("publication_title")
        publication_year = article.get("publication_year")

        authors_info = article.get("authors", {})
        author_list = authors_info.get("authors", []) if isinstance(authors_info, dict) else []
        author_names = [a.get("full_name") for a in author_list if isinstance(a, dict) and a.get("full_name")]

        # Parse published date
        published_at = None
        if publication_year:
            try:
                published_at = datetime.datetime(year=int(publication_year), month=1, day=1, tzinfo=datetime.timezone.utc)
            except ValueError:
                pass

        # Build combined text
        text_parts = [f"Title: {title}"]
        if abstract:
            text_parts.append(f"Abstract: {abstract}")
        if author_names:
            text_parts.append(f"Authors: {', '.join(author_names)}")
        if publication_title:
            text_parts.append(f"Publication: {publication_title}")

        text = "\n\n".join(text_parts)

        metadata = {
            "publication_title": publication_title,
            "publication_year": publication_year,
            "doi": doi,
            "authors": author_names,
            "index_terms": article.get("index_terms", {}),
            "publisher": article.get("publisher")
        }

        return SourceDocument(
            source="ieee_xplore",
            source_id=str(article_id),
            entity_type="paper",
            title=title,
            text=text,
            url=url,
            published_at=published_at,
            metadata=metadata
        )
