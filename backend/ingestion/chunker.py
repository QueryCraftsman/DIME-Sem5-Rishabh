"""
Deterministic document chunking for the Document Intelligence Pipeline.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.core.config import get_settings


class DocumentChunker:
    """
    Chunks normalized text into deterministic segments for downstream embeddings.
    Prefers semantic boundaries (paragraphs -> newlines -> spaces) before hard limits.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        
        # RecursiveCharacterTextSplitter defaults to separators:
        # ["\n\n", "\n", " ", ""]
        # This matches the semantic boundaries requested (paragraphs, lines, words).
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.chunk_size_chars,
            chunk_overlap=self.settings.chunk_overlap_chars,
            length_function=len,
            is_separator_regex=False,
        )

    def chunk_text(self, text: str) -> list[str]:
        """
        Split text into overlapping chunks.
        Returns an empty list if text is empty.
        """
        if not text:
            return []
            
        return self.splitter.split_text(text)
