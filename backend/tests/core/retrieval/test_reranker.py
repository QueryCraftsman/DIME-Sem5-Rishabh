import pytest
from unittest.mock import patch, MagicMock
from backend.core.retrieval.models import RetrievalQuery, RetrievalResult
from backend.core.retrieval.reranker import CrossEncoderReranker

def _make_result(chunk_id: str, text: str) -> RetrievalResult:
    return RetrievalResult(
        chunk_id=chunk_id,
        document_id="doc",
        text=text,
        source="src",
        source_id="sid",
        title="title",
        content_hash="hash"
    )

@patch("backend.core.retrieval.reranker.CrossEncoder")
def test_reranker_reorders_candidates(mock_ce_class: MagicMock) -> None:
    mock_model = MagicMock()
    # Let's say model returns scores 0.1 for first pair, 0.9 for second pair.
    mock_model.predict.return_value = [0.1, 0.9]
    mock_ce_class.return_value = mock_model
    
    reranker = CrossEncoderReranker()
    
    q = RetrievalQuery(query_text="foo")
    candidates = [
        _make_result("c1", "bad match"),
        _make_result("c2", "great match foo"),
    ]
    
    final = reranker.rerank(q, candidates)
    
    assert len(final) == 2
    # c2 should be first because of score 0.9
    assert final[0].chunk_id == "c2"
    assert final[0].rerank_score == 0.9
    assert final[1].chunk_id == "c1"
    assert final[1].rerank_score == 0.1
