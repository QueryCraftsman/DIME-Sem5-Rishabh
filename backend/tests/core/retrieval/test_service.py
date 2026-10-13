import pytest
from unittest.mock import MagicMock, AsyncMock
from backend.core.retrieval.models import RetrievalQuery, RetrievalResult
from backend.core.retrieval.service import RetrievalService

def _make_result(chunk_id: str, text: str = "") -> RetrievalResult:
    return RetrievalResult(
        chunk_id=chunk_id,
        document_id="doc",
        text=text,
        source="src",
        source_id="sid",
        title="title",
        content_hash="hash"
    )

@pytest.mark.asyncio
async def test_retrieval_service_flow() -> None:
    dense_mock = MagicMock()
    dense_mock.retrieve = AsyncMock(return_value=[_make_result("c1"), _make_result("c2")])
    
    sparse_mock = MagicMock()
    sparse_mock.retrieve = AsyncMock(return_value=[_make_result("c2", text="hello")])
    sparse_mock.session = MagicMock()
    
    hybrid_mock = MagicMock()
    # Let's say fuse returns c2 then c1
    hybrid_mock.fuse.return_value = [
        _make_result("c2", text="hello"),
        _make_result("c1", text="hydrated text")
    ]
    
    rerank_mock = MagicMock()
    # Let's say reranker swaps them
    rerank_mock.rerank.return_value = [
        _make_result("c1", text="hydrated text"),
        _make_result("c2", text="hello")
    ]
    
    service = RetrievalService(dense_mock, sparse_mock, hybrid_mock, rerank_mock)
    
    # Mock hydration so it doesn't try to query DB
    service._hydrate_dense_results = AsyncMock()
    
    q = RetrievalQuery(query_text="foo")
    final = await service.retrieve(q)
    
    assert len(final) == 2
    assert final[0].chunk_id == "c1"
    
    # Verify components were called
    dense_mock.retrieve.assert_called_once()
    sparse_mock.retrieve.assert_called_once()
    hybrid_mock.fuse.assert_called_once()
    service._hydrate_dense_results.assert_called_once()
    rerank_mock.rerank.assert_called_once()
