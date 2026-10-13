import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.agents.provider import LLMProvider
from backend.agents.models import ResearchFindings, ResearchFinding
from backend.agents.research import ResearchAgent
from backend.core.retrieval.service import RetrievalService
from backend.core.retrieval.models import RetrievalResult


@pytest.mark.asyncio
async def test_research_evidence_validation() -> None:
    # Setup mocks
    mock_provider = MagicMock(spec=LLMProvider)
    mock_provider.settings = MagicMock()
    mock_provider.settings.agent_max_research_questions = 1
    mock_provider.settings.agent_retrieval_top_k = 5
    
    mock_retrieval = MagicMock(spec=RetrievalService)
    
    # Mock retrieval returns chunk "valid_1" and "valid_2"
    mock_retrieval.retrieve = AsyncMock(return_value=[
        RetrievalResult(chunk_id="valid_1", document_id="d1", source="test", source_id="1", title="title", content_hash="hash", dense_score=0.9, text="Text 1"),
        RetrievalResult(chunk_id="valid_2", document_id="d2", source="test", source_id="2", title="title", content_hash="hash", dense_score=0.8, text="Text 2")
    ])
    
    # Mock LLM returning one valid finding, one hallucinated finding, and one mixed
    mock_llm_output = ResearchFindings(
        findings=[
            ResearchFinding(
                finding="Finding 1",
                evidence_references=["valid_1"],
                qualification="supported"
            ),
            ResearchFinding(
                finding="Finding 2",
                evidence_references=["hallucinated_id"],
                qualification="supported"
            ),
            ResearchFinding(
                finding="Finding 3",
                evidence_references=["valid_2", "hallucinated_id_2"],
                qualification="inferred"
            )
        ],
        unresolved_questions=[]
    )
    mock_provider.structured_generate = AsyncMock(return_value=mock_llm_output)
    
    agent = ResearchAgent(mock_provider, mock_retrieval)
    
    result = await agent.research(["Test question?"])
    
    # Assertions
    findings = result.findings
    assert len(findings) == 3
    
    # Finding 1 should be untouched
    assert findings[0].qualification == "supported"
    assert findings[0].evidence_references == ["valid_1"]
    
    # Finding 2 should be downgraded and reference removed
    assert findings[1].qualification == "insufficient_evidence"
    assert findings[1].evidence_references == []
    assert "Unsupported claim rejected" in findings[1].finding
    
    # Finding 3 should have invalid reference removed but keep the valid one
    assert findings[2].qualification == "inferred"
    assert findings[2].evidence_references == ["valid_2"]


@pytest.mark.asyncio
async def test_research_no_retrieval_results() -> None:
    mock_provider = MagicMock(spec=LLMProvider)
    mock_provider.settings = MagicMock()
    mock_provider.settings.agent_max_research_questions = 1
    
    mock_retrieval = MagicMock(spec=RetrievalService)
    mock_retrieval.retrieve = AsyncMock(return_value=[])
    
    agent = ResearchAgent(mock_provider, mock_retrieval)
    result = await agent.research(["Test?"])
    
    assert len(result.findings) == 1
    assert result.findings[0].qualification == "insufficient_evidence"
    assert "Test?" in result.unresolved_questions
    # LLM should NOT be called if there's no evidence
    mock_provider.structured_generate.assert_not_called()
