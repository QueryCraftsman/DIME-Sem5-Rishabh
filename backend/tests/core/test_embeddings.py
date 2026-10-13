import pytest
from backend.core.embeddings import SentenceTransformerProvider

def test_embedding_provider_initialization() -> None:
    provider = SentenceTransformerProvider()
    assert provider.dimension > 0
    assert provider.model_name == "BAAI/bge-small-en-v1.5"

def test_embedding_provider_embed() -> None:
    provider = SentenceTransformerProvider()
    vec = provider.embed("This is a test document chunk.")
    assert len(vec) == provider.dimension
    assert isinstance(vec[0], float)

def test_embedding_provider_embed_empty() -> None:
    provider = SentenceTransformerProvider()
    with pytest.raises(ValueError, match="Cannot embed empty text."):
        provider.embed("   ")

def test_embedding_provider_embed_batch() -> None:
    provider = SentenceTransformerProvider()
    vecs = provider.embed_batch(["Chunk one.", "Chunk two."])
    assert len(vecs) == 2
    assert len(vecs[0]) == provider.dimension
    assert len(vecs[1]) == provider.dimension

def test_embedding_provider_embed_batch_empty() -> None:
    provider = SentenceTransformerProvider()
    vecs = provider.embed_batch([])
    assert vecs == []
