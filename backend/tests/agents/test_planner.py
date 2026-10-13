import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.agents.provider import LLMProvider
from backend.agents.models import AnalysisPlan
from backend.agents.planner import PlannerAgent


@pytest.mark.asyncio
async def test_planner_generates_bounded_plan() -> None:
    # Setup mock provider
    mock_provider = MagicMock(spec=LLMProvider)
    mock_provider.settings = MagicMock()
    mock_provider.settings.agent_max_research_questions = 3
    mock_provider.settings.agent_max_competitor_questions = 2
    
    mock_plan = AnalysisPlan(
        objectives=["Analyze target market"],
        research_questions=["What is X?"],
        competitor_questions=["Who does Y?"],
        evidence_requirements=["Market data"]
    )
    mock_provider.structured_generate = AsyncMock(return_value=mock_plan)
    
    agent = PlannerAgent(mock_provider)
    idea = {"title": "Test Idea", "description": "Test Desc"}
    
    plan = await agent.plan(idea)
    
    assert plan == mock_plan
    mock_provider.structured_generate.assert_called_once()
    
    # Verify bounds were in the prompt
    call_args = mock_provider.structured_generate.call_args[1]
    assert "maximum of 3 research questions" in call_args["prompt"]
    assert "maximum of 2 competitor questions" in call_args["prompt"]
