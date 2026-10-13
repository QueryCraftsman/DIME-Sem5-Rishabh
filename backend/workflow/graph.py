from langgraph.graph import StateGraph, START, END

from backend.workflow.state import AnalysisState
from backend.workflow.nodes import (
    initialize_node,
    idea_understanding_node,
    query_planning_node,
    acquire_evidence_node,
    process_evidence_node,
    planner_node,
    research_node,
    competition_node,
    synthesis_node,
    scoring_node,
    complete_analysis_node,
    fail_analysis_node,
)
from backend.models.analysis import AnalysisStatus


def check_status(state: AnalysisState, next_node: str) -> str:
    """Check if the workflow failed, and route appropriately."""
    if state.get("status") == AnalysisStatus.FAILED.value:
        return "fail"
    return next_node


from typing import Any
def build_analysis_graph() -> Any:
    """
    Build and compile the LangGraph workflow.
    
    NEW pipeline order:
      START → initialize → idea_understanding → query_planning →
      acquire → process → planner → research → competition →
      synthesis → scoring → complete → END
    """
    
    workflow: Any = StateGraph(AnalysisState) # type: ignore
    
    workflow.add_node("initialize", initialize_node)
    workflow.add_node("idea_understanding", idea_understanding_node)
    workflow.add_node("query_planning", query_planning_node)
    workflow.add_node("acquire", acquire_evidence_node)
    workflow.add_node("process", process_evidence_node)
    workflow.add_node("planner", planner_node)
    workflow.add_node("research", research_node)
    workflow.add_node("competition", competition_node)
    workflow.add_node("synthesis", synthesis_node)
    workflow.add_node("scoring", scoring_node)
    workflow.add_node("complete", complete_analysis_node)
    workflow.add_node("fail", fail_analysis_node)
    
    workflow.add_edge(START, "initialize")
    
    workflow.add_conditional_edges(
        "initialize",
        lambda s: check_status(s, "idea_understanding"), # type: ignore
        {"idea_understanding": "idea_understanding", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "idea_understanding",
        lambda s: check_status(s, "query_planning"), # type: ignore
        {"query_planning": "query_planning", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "query_planning",
        lambda s: check_status(s, "acquire"), # type: ignore
        {"acquire": "acquire", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "acquire",
        lambda s: check_status(s, "process"), # type: ignore
        {"process": "process", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "process",
        lambda s: check_status(s, "planner"), # type: ignore
        {"planner": "planner", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "planner",
        lambda s: check_status(s, "research"), # type: ignore
        {"research": "research", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "research",
        lambda s: check_status(s, "competition"), # type: ignore
        {"competition": "competition", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "competition",
        lambda s: check_status(s, "synthesis"), # type: ignore
        {"synthesis": "synthesis", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "synthesis",
        lambda s: check_status(s, "scoring"), # type: ignore
        {"scoring": "scoring", "fail": "fail"}
    )
    
    workflow.add_conditional_edges(
        "scoring",
        lambda s: check_status(s, "complete"), # type: ignore
        {"complete": "complete", "fail": "fail"}
    )
    
    workflow.add_edge("complete", END)
    workflow.add_edge("fail", END)
    
    return workflow.compile()


# Global graph instance
analysis_graph = build_analysis_graph()
