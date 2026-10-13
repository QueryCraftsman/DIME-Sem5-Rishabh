import pytest
from unittest.mock import AsyncMock, MagicMock
from backend.agents.provider import LLMProvider
from backend.agents.models import SynthesisResult
from backend.agents.synthesis import SynthesisAgent


@pytest.mark.asyncio
async def test_synthesis_combines_inputs() -> None:
    mock_provider = MagicMock(spec=LLMProvider)
    mock_provider.settings = MagicMock()
    
    mock_result = SynthesisResult(
        key_findings=["Finding"],
        market_observations=["Market obs"],
        competitor_observations=["Comp obs"],
        evidence_references=["chunk_1"],
        uncertainties=["None"]
    )
    
    mock_provider.structured_generate = AsyncMock(return_value=mock_result)
    agent = SynthesisAgent(mock_provider)
    
    result = await agent.synthesize({"plan": "data"}, {"research": "data"}, {"comp": "data"})
    
    assert result == mock_result
    mock_provider.structured_generate.assert_called_once()
    
    call_args = mock_provider.structured_generate.call_args[1]
    assert "[ANALYSIS PLAN]" in call_args["prompt"]
    assert "[RESEARCH FINDINGS]" in call_args["prompt"]
    assert "[COMPETITION FINDINGS]" in call_args["prompt"]
