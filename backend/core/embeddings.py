"""
DIME Backend — Embedding Provider.

Provides a clean abstraction for generating deterministic document embeddings.
"""

import logging
from typing import Protocol

import sentence_transformers

from backend.core.config import get_settings

logger = logging.getLogger(__name__)


class EmbeddingProvider(Protocol):
    """Protocol for generating embeddings for text."""

    def embed(self, text: str) -> list[float]:
        """Embed a single string."""
        ...

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of strings."""
        ...
        
    @property
    def dimension(self) -> int:
        """Return the vector dimension."""
        ...


class SentenceTransformerProvider:
    """
    EmbeddingProvider implementation using sentence-transformers.
    Suitable for BGE, E5, and other standard SentenceTransformers models.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.model_name = self.settings.embedding_model_name
        self.device = self.settings.embedding_device
        self.batch_size = self.settings.embedding_batch_size

        logger.info(f"Initializing embedding provider: {self.model_name} on {self.device}")
        
        try:
            self.model = sentence_transformers.SentenceTransformer(
                model_name_or_path=self.model_name,
                device=self.device,
            )
        except Exception as e:
            logger.error(f"Failed to initialize embedding model {self.model_name}: {e}")
            raise RuntimeError(f"Embedding initialization failed: {e}") from e

    def embed(self, text: str) -> list[float]:
        """Generate normalized embedding for a single text."""
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text.")
            
        vector = self.model.encode(
            text,
            batch_size=1,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return vector.tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate normalized embeddings for a batch of texts."""
        if not texts:
            return []
            
        vectors = self.model.encode(
            texts,
            batch_size=self.batch_size,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        from typing import cast
        return cast(list[list[float]], vectors.tolist())

    @property
    def dimension(self) -> int:
        return self.model.get_sentence_embedding_dimension() or 768
