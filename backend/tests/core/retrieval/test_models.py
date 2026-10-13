import pytest
from backend.core.retrieval.models import RetrievalQuery, RetrievalResult

def test_retrieval_query_defaults() -> None:
    q = RetrievalQuery(query_text="test")
    assert q.top_k is None
    assert q.source is None
    assert q.source_type is None
    assert q.published_after is None

def test_retrieval_result_defaults() -> None:
    r = RetrievalResult(
        chunk_id="c1",
        document_id="d1",
        text="text",
        source="src",
        source_id="sid",
        title="title",
        content_hash="hash"
    )
    assert r.final_score == 0.0
    assert r.canonical_url is None
    assert r.metadata == {}
