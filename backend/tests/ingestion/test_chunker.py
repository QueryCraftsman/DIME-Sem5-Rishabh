import pytest
from backend.ingestion.chunker import DocumentChunker

def test_chunk_empty_text() -> None:
    chunker = DocumentChunker()
    assert chunker.chunk_text("") == []

def test_chunker_respects_settings(monkeypatch: pytest.MonkeyPatch) -> None:
    class MockSettings:
        chunk_size_chars = 100
        chunk_overlap_chars = 20
        
    monkeypatch.setattr("backend.ingestion.chunker.get_settings", MockSettings)
    chunker = DocumentChunker()
    
    # Text > 100 chars
    text = "A" * 150
    chunks = chunker.chunk_text(text)
    
    # With size 100 and overlap 20, chunk 1 is 100 chars. 
    # Remaining is 50 chars, but it overlaps by 20, so it takes from index 80 to 150 (70 chars).
    assert len(chunks) == 2
    assert len(chunks[0]) == 100
    assert len(chunks[1]) == 70
    assert chunks[0][80:] == chunks[1][:20]

def test_semantic_boundaries(monkeypatch: pytest.MonkeyPatch) -> None:
    class MockSettings:
        chunk_size_chars = 100
        chunk_overlap_chars = 10
        
    monkeypatch.setattr("backend.ingestion.chunker.get_settings", MockSettings)
    chunker = DocumentChunker()
    
    # Two paragraphs, each around 60 chars. Total > 100 chars.
    para1 = "This is the first paragraph. " * 2 # ~ 58 chars
    para2 = "This is the second paragraph. " * 2 # ~ 60 chars
    text = f"{para1}\n\n{para2}"
    
    chunks = chunker.chunk_text(text)
    
    # It should split at the paragraph boundary rather than cutting mid-sentence.
    assert len(chunks) == 2
    assert chunks[0].strip() == para1.strip()
    assert chunks[1].strip() == para2.strip()
