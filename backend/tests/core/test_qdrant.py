import pytest
from unittest.mock import AsyncMock, patch

from qdrant_client.http import models

from backend.core.qdrant import QdrantStore


from typing import Generator
@pytest.fixture
def mock_qdrant_client() -> Generator[AsyncMock, None, None]:
    with patch("backend.core.qdrant.AsyncQdrantClient") as mock_client_cls:
        mock_instance = AsyncMock()
        mock_client_cls.return_value = mock_instance
        yield mock_instance


@pytest.mark.asyncio
async def test_ensure_collection_creates_if_missing(mock_qdrant_client: AsyncMock) -> None:
    mock_qdrant_client.collection_exists.return_value = False
    
    store = QdrantStore(dimension=384)
    await store.ensure_collection()
    
    mock_qdrant_client.collection_exists.assert_called_once_with("dime_chunks")
    mock_qdrant_client.create_collection.assert_called_once()
    
    _, kwargs = mock_qdrant_client.create_collection.call_args
    assert kwargs["collection_name"] == "dime_chunks"
    assert kwargs["vectors_config"].size == 384
    assert kwargs["vectors_config"].distance == models.Distance.COSINE


@pytest.mark.asyncio
async def test_ensure_collection_skips_if_exists(mock_qdrant_client: AsyncMock) -> None:
    mock_qdrant_client.collection_exists.return_value = True
    
    store = QdrantStore(dimension=384)
    await store.ensure_collection()
    
    mock_qdrant_client.collection_exists.assert_called_once_with("dime_chunks")
    mock_qdrant_client.create_collection.assert_not_called()


@pytest.mark.asyncio
async def test_upsert_chunks(mock_qdrant_client: AsyncMock) -> None:
    store = QdrantStore(dimension=384)
    
    point_ids = ["pid1", "pid2"]
    vectors = [[0.1] * 384, [0.2] * 384]
    payloads = [{"doc": "1"}, {"doc": "2"}]
    
    await store.upsert_chunks(point_ids, vectors, payloads)
    
    mock_qdrant_client.upsert.assert_called_once()
    _, kwargs = mock_qdrant_client.upsert.call_args
    assert kwargs["collection_name"] == "dime_chunks"
    assert len(kwargs["points"]) == 2
    assert kwargs["points"][0].id == "pid1"
    assert kwargs["points"][0].payload == {"doc": "1"}


@pytest.mark.asyncio
async def test_upsert_chunks_mismatched_lengths(mock_qdrant_client: AsyncMock) -> None:
    store = QdrantStore(dimension=384)
    
    with pytest.raises(ValueError, match="Lengths of point_ids, vectors, and payloads must match"):
        await store.upsert_chunks(["pid1"], [[0.1] * 384, [0.2] * 384], [{"doc": "1"}])


@pytest.mark.asyncio
async def test_delete_by_document(mock_qdrant_client: AsyncMock) -> None:
    store = QdrantStore(dimension=384)
    
    await store.delete_by_document("test_doc_id")
    
    mock_qdrant_client.delete.assert_called_once()
    _, kwargs = mock_qdrant_client.delete.call_args
    assert kwargs["collection_name"] == "dime_chunks"
    
    selector = kwargs["points_selector"]
    assert isinstance(selector, models.Filter)
    assert selector.must is not None
    assert len(selector.must) == 1 # type: ignore
    cond = selector.must[0] # type: ignore
    assert isinstance(cond, models.FieldCondition)
    assert cond.key == "document_id"
    assert isinstance(cond.match, models.MatchValue)
    assert cond.match.value == "test_doc_id"
