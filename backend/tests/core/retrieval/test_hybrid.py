import pytest
from backend.core.retrieval.models import RetrievalResult
from backend.core.retrieval.hybrid import HybridRetriever

def _make_result(chunk_id: str, dense: float | None = None, sparse: float | None = None, text: str = "") -> RetrievalResult:
    return RetrievalResult(
        chunk_id=chunk_id,
        document_id="doc1",
        text=text,
        source="test",
        source_id="test",
        title="test",
        content_hash="hash",
        dense_score=dense,
        sparse_score=sparse
    )

def test_hybrid_rrf_fusion() -> None:
    dense_results = [
        _make_result("c1", dense=0.9),
        _make_result("c2", dense=0.8),
        _make_result("c3", dense=0.7),
    ]
    sparse_results = [
        _make_result("c2", sparse=5.0, text="hello"),
        _make_result("c4", sparse=4.0, text="world"),
    ]
    
    retriever = HybridRetriever(rrf_k=60)
    fused = retriever.fuse(dense_results, sparse_results, limit=3)
    
    assert len(fused) == 3
    # c2 is at rank 2 in dense and rank 1 in sparse
    # Score for c2 = 1/(60+2) + 1/(60+1) = ~0.0325
    # c1 is rank 1 in dense, rank nothing in sparse = 1/(60+1) = ~0.0163
    # So c2 should be top.
    assert fused[0].chunk_id == "c2"
    assert fused[0].text == "hello"  # Hydrated from sparse
    assert fused[0].dense_score == 0.8
    assert fused[0].sparse_score == 5.0
    
    assert fused[1].chunk_id == "c1"
    assert fused[1].text == ""
