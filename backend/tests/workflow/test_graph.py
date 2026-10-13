from unittest.mock import AsyncMock, MagicMock, patch
from typing import Any
import pytest

from backend.models.analysis import AnalysisStatus
from backend.agents.models import (
    StructuredIdea,
    QueryPlan,
    AnalysisPlan,
    ResearchFindings,
    CompetitionFindings,
    SynthesisResult,
    RetrievalDiagnostics,
)
from backend.schemas.github import GitHubSearchResult
from backend.schemas.research import ResearchSearchResult
from backend.workflow.graph import analysis_graph


@pytest.mark.asyncio
@patch("backend.workflow.nodes.ProgressPublisher")
@patch("backend.workflow.nodes.IdeaAnalyzer")
@patch("backend.workflow.nodes.QueryPlanner")
@patch("backend.workflow.nodes.GitHubService")
@patch("backend.workflow.nodes.ResearchService")
@patch("backend.workflow.nodes.DocumentPipeline")
@patch("backend.workflow.nodes.PlannerAgent")
@patch("backend.workflow.nodes.ResearchAgent")
@patch("backend.workflow.nodes.CompetitionAgent")
@patch("backend.workflow.nodes.SynthesisAgent")
@patch("backend.workflow.nodes.ScoringEngine")
@patch("backend.workflow.nodes.async_session_factory")
@patch("backend.workflow.nodes._build_retrieval_service")
@patch("backend.workflow.nodes.get_settings")
async def test_successful_graph_execution(
    mock_get_settings: Any,
    mock_retrieval_service: Any,
    mock_session_factory: Any,
    mock_scoring_engine: Any,
    mock_synthesis_agent: Any,
    mock_competition_agent: Any,
    mock_research_agent: Any,
    mock_planner_agent: Any,
    mock_pipeline: Any,
    mock_research: Any,
    mock_github: Any,
    mock_query_planner: Any,
    mock_idea_analyzer: Any,
    mock_publisher: Any,
) -> None:
    """Test a successful full execution of the LangGraph workflow."""
    mock_get_settings.return_value.crawl4ai_enabled = False

    # Mock IdeaAnalyzer
    mock_analyzer_inst = AsyncMock()
    mock_analyzer_inst.analyze.return_value = StructuredIdea(
        problem="Problem",
        domain="Tech",
        target_users=["Users"],
        product_type="SaaS",
        core_capabilities=["Cap1"],
        technical_concepts=["Concept1"],
        market_terms=["Term1"],
    )
    mock_idea_analyzer.return_value = mock_analyzer_inst

    # Mock QueryPlanner
    mock_planner_inst = AsyncMock()
    mock_planner_inst.plan_queries.return_value = QueryPlan(
        github_queries=[],
        paper_queries=[],
        web_queries=[],
    )
    mock_query_planner.return_value = mock_planner_inst

    # Mock GitHub
    mock_github_inst = AsyncMock()
    mock_github_inst.acquire_evidence.return_value = (
        GitHubSearchResult(documents=[], total_found=0, returned=0),
        RetrievalDiagnostics(source="github"),
    )
    mock_github.return_value = mock_github_inst

    # Mock Research
    mock_research_inst = AsyncMock()
    mock_research_inst.acquire_evidence.return_value = (
        ResearchSearchResult(documents=[], total_found=0, returned=0),
        {"semantic_scholar": RetrievalDiagnostics(source="semantic_scholar")},
    )
    mock_research.return_value = mock_research_inst

    # Mock DocumentPipeline
    mock_pipeline_inst = AsyncMock()
    mock_pipeline_inst.process_batch.return_value = ["doc-1"]
    mock_pipeline.return_value = mock_pipeline_inst

    # Mock PlannerAgent
    mock_planner_agent_inst = AsyncMock()
    mock_planner_agent_inst.plan.return_value = AnalysisPlan(
        objectives=["Obj1"],
        research_questions=["Q1"],
        competitor_questions=["C1"],
        evidence_requirements=["Req1"],
    )
    mock_planner_agent.return_value = mock_planner_agent_inst

    # Mock ResearchAgent
    mock_research_agent_inst = AsyncMock()
    mock_research_agent_inst.research.return_value = ResearchFindings(
        findings=[],
        unresolved_questions=[],
    )
    mock_research_agent.return_value = mock_research_agent_inst

    # Mock CompetitionAgent
    mock_comp_agent_inst = AsyncMock()
    mock_comp_agent_inst.analyze_competition.return_value = CompetitionFindings(competitors=[], gaps=[])
    mock_competition_agent.return_value = mock_comp_agent_inst

    # Mock SynthesisAgent
    mock_synth_agent_inst = AsyncMock()
    mock_synth_agent_inst.synthesize.return_value = SynthesisResult(
        key_findings=[],
        market_observations=[],
        competitor_observations=[],
        evidence_references=[],
        uncertainties=[],
    )
    mock_synthesis_agent.return_value = mock_synth_agent_inst

    # Mock ScoringEngine
    mock_scoring_inst = AsyncMock()
    empty_scores: dict[str, Any] = {}
    mock_scoring_inst.compute_all_scores.return_value = empty_scores
    mock_scoring_engine.return_value = mock_scoring_inst

    # Mock async session factory
    mock_session = AsyncMock()
    mock_session_factory.return_value.__aenter__.return_value = mock_session
    mock_session_factory.return_value.__aexit__.return_value = None

    # Mock publisher
    mock_publisher_inst = AsyncMock()
    mock_publisher.return_value = mock_publisher_inst

    initial_state: dict[str, Any] = {
        "analysis_id": "test-id",
        "idea": {"title": "Test"},
        "status": AnalysisStatus.RUNNING.value,
        "current_stage": "STARTING",
        "progress": 0,
        "evidence_references": [],
        "errors": [],
    }

    # Execute the graph
    result = await analysis_graph.ainvoke(initial_state)

    assert result["status"] == AnalysisStatus.COMPLETED.value
    assert result["current_stage"] == "COMPLETED"
    assert result["progress"] == 100
    assert len(result["errors"]) == 0


@pytest.mark.asyncio
@patch("backend.workflow.nodes.ProgressPublisher")
@patch("backend.workflow.nodes.IdeaAnalyzer")
async def test_graph_execution_failure(
    mock_idea_analyzer: Any,
    mock_publisher: Any,
) -> None:
    """Test that a failure in a node routes to failure state."""
    mock_analyzer_inst = AsyncMock()
    mock_analyzer_inst.analyze.side_effect = Exception("API Error")
    mock_idea_analyzer.return_value = mock_analyzer_inst

    mock_publisher.return_value = AsyncMock()

    initial_state: dict[str, Any] = {
        "analysis_id": "test-id",
        "idea": {"title": "Test"},
        "status": AnalysisStatus.RUNNING.value,
        "current_stage": "STARTING",
        "progress": 0,
        "evidence_references": [],
        "errors": [],
    }

    # Execute the graph
    result = await analysis_graph.ainvoke(initial_state)

    # Assert workflow was routed to failed
    assert result["status"] == AnalysisStatus.FAILED.value
    assert result["current_stage"] == "IDEA_UNDERSTANDING"
    assert result["progress"] == 10
    assert "API Error" in result["errors"][0]
