import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.ingestion.pipeline import DocumentPipeline
from backend.models.evidence import SourceChunk, SourceDocument
from backend.schemas.source import SourceDocument as PydanticSourceDocument

@pytest.fixture
def mock_pydantic_doc() -> PydanticSourceDocument:
    return PydanticSourceDocument(
        source="github",
        source_id="repo123",
        entity_type="repository",
        title="Test Repo",
        text="This is a test repository.\n\nIt does things.",
        url="https://github.com/test/repo123"
    )

@pytest.mark.asyncio
async def test_determine_canonical_identity() -> None:
    pipeline = DocumentPipeline()
    
    # 1. DOI test
    doc_doi = PydanticSourceDocument(
        source="semantic_scholar",
        source_id="123",
        entity_type="paper",
        title="Paper",
        metadata={"doi": " 10.1234/test "}
    )
    assert pipeline._determine_canonical_identity(doc_doi) == ("doi", "10.1234/test")
    
    # 2. Web canonical URL test
    doc_web = PydanticSourceDocument(
        source="web",
        source_id="random_id",
        entity_type="web_page",
        title="Page",
        url="https://example.com/page",
        metadata={"canonical_url": "https://example.com/canonical"}
    )
    assert pipeline._determine_canonical_identity(doc_web) == ("web", "https://example.com/canonical")
    
    # 3. Fallback
    doc_github = PydanticSourceDocument(
        source="github",
        source_id="owner/repo",
        entity_type="repository",
        title="Repo"
    )
    assert pipeline._determine_canonical_identity(doc_github) == ("github", "owner/repo")

@pytest.mark.asyncio
async def test_pipeline_upsert_and_chunk(db_session: AsyncSession, mock_pydantic_doc: PydanticSourceDocument) -> None:
    pipeline = DocumentPipeline()
    
    # 1. Process initially
    doc_id = await pipeline.process(db_session, mock_pydantic_doc)
    assert doc_id is not None
    
    # Check DB Document
    db_doc = await db_session.get(SourceDocument, doc_id)
    assert db_doc is not None
    assert db_doc.source == "github"
    assert db_doc.source_id == "repo123"
    assert db_doc.status == "normalized"
    
    # Check chunks generated
    result = await db_session.execute(
        select(SourceChunk).where(SourceChunk.document_id == doc_id)
    )
    chunks = result.scalars().all()
    assert len(chunks) > 0
    assert chunks[0].content_hash == db_doc.content_hash
    
    # 2. Process again (Idempotency)
    doc_id2 = await pipeline.process(db_session, mock_pydantic_doc)
    assert doc_id2 == doc_id  # Returns the same UUID
    
    # Ensure no duplicate documents
    result = await db_session.execute(select(SourceDocument).where(SourceDocument.source_id == "repo123"))
    docs = result.scalars().all()
    assert len(docs) == 1
    
    # Ensure chunk count hasn't doubled
    result = await db_session.execute(
        select(SourceChunk).where(SourceChunk.document_id == doc_id)
    )
    chunks2 = result.scalars().all()
    assert len(chunks2) == len(chunks)

@pytest.mark.asyncio
async def test_pipeline_hash_change_updates_chunks(db_session: AsyncSession, mock_pydantic_doc: PydanticSourceDocument) -> None:
    pipeline = DocumentPipeline()
    doc_id = await pipeline.process(db_session, mock_pydantic_doc)
    
    # Count initial chunks
    result = await db_session.execute(select(SourceChunk).where(SourceChunk.document_id == doc_id))
    initial_chunks = result.scalars().all()
    assert len(initial_chunks) > 0
    
    # Change the document text
    mock_pydantic_doc.text = "This is completely new content that will hash differently."
    doc_id2 = await pipeline.process(db_session, mock_pydantic_doc)
    assert doc_id2 == doc_id
    
    db_doc = await db_session.get(SourceDocument, doc_id)
    assert db_doc is not None
    
    # Ensure new chunks replaced old ones
    result = await db_session.execute(select(SourceChunk).where(SourceChunk.document_id == doc_id))
    new_chunks = result.scalars().all()
    
    assert len(new_chunks) > 0
    assert new_chunks[0].content_hash == db_doc.content_hash
    assert new_chunks[0].content_hash != initial_chunks[0].content_hash
