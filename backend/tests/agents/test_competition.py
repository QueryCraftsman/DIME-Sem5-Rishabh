import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.agents.provider import LLMProvider
from backend.agents.models import CompetitionFindings, CompetitionFinding
from backend.agents.competition import CompetitionAgent
from backend.core.retrieval.service import RetrievalService
from backend.core.retrieval.models import RetrievalResult


@pytest.mark.asyncio
async def test_competition_evidence_validation() -> None:
    mock_provider = MagicMock(spec=LLMProvider)
    mock_provider.settings = MagicMock()
    mock_provider.settings.agent_max_competitor_questions = 1
    mock_provider.settings.agent_retrieval_top_k = 5
    
    mock_retrieval = MagicMock(spec=RetrievalService)
    
    mock_retrieval.retrieve = AsyncMock(return_value=[
        RetrievalResult(chunk_id="valid_comp_1", document_id="d1", source="test", source_id="1", title="title", content_hash="hash", dense_score=0.9, text="Comp 1"),
    ])
    
    # Mock LLM returning one valid competitor and one hallucinated competitor
    mock_llm_output = CompetitionFindings(
        competitors=[
            CompetitionFinding(
                competitor="Valid Competitor",
                similarities=["A"],
                differences=["B"],
                evidence_references=["valid_comp_1"],
                uncertainties=""
            ),
            CompetitionFinding(
                competitor="Hallucinated Competitor",
                similarities=["C"],
                differences=["D"],
                evidence_references=["invalid_comp"],
                uncertainties=""
            )
        ],
        gaps=["Gap 1"]
    )
    mock_provider.structured_generate = AsyncMock(return_value=mock_llm_output)
    
    agent = CompetitionAgent(mock_provider, mock_retrieval)
    idea = {"title": "Test Idea"}
    
    result = await agent.analyze_competition(idea, ["Who does this?"])
    
    # Assertions
    comps = result.competitors
    assert len(comps) == 1
    
    assert comps[0].competitor == "Valid Competitor"
    assert comps[0].evidence_references == ["valid_comp_1"]
