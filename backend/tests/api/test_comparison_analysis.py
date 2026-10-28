"""
Unit and integration tests for DIME AI Enterprise Comparison Analysis.

Covers:
1. Candidate eligibility, min/max bounds, and duplicate rejection
2. Metric vector normalization and directionality
3. Pareto trade-off calculations
4. Decision recommendation concordance across objectives
5. REST API CRUD endpoints and summary statistics
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import create_app
from backend.services.comparison_engine import comparison_engine, OBJECTIVES


@pytest.fixture
def app():
    return create_app()


@pytest.fixture(autouse=True)
async def dispose_engine():
    yield
    from backend.core.database import engine
    await engine.dispose()


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac



# ── 1. Engine Normalization and Deterministic Calculations ──

def test_metric_normalization_bounds():
    """Ensures 0-100 scores normalize cleanly to 0-10 without NaN or overflow."""
    assert comparison_engine.normalize_to_ten(85.0) == 8.5
    assert comparison_engine.normalize_to_ten(9.2) == 9.2
    assert comparison_engine.normalize_to_ten(120.0) == 10.0
    assert comparison_engine.normalize_to_ten(-5.0) == 0.0
    assert comparison_engine.normalize_to_ten(None, default=7.5) == 7.5


def test_metric_vectors_directionality():
    """
    Verifies metric directionality:
    - Feasibility: higher is better
    - Novelty: higher is better
    - Competition: higher is more crowded
    - Risk: higher is riskier
    """
    snapshot = {
        "idea": {
            "id": "test-idea-1",
            "title": "Autonomous PR Reviewer",
            "industry": "DevTools",
            "description": "Test",
        },
        "scores": {
            "Novelty": 82.0,
            "Market Pain": 92.0,
            "Feasibility": 81.0,
            "Market Saturation": 64.0,
            "Risk Indicator": 32.0,
        },
    }

    vectors = comparison_engine.compute_metric_vectors(snapshot, position=1)
    assert vectors["novelty"]["score"] == 8.2
    assert vectors["market_demand"]["score"] == 9.2
    assert vectors["feasibility"]["score"] == 8.1
    assert vectors["competition"]["score"] == 6.4
    assert vectors["risk"]["score"] == 3.2
    assert "Low Risk" in vectors["risk"]["level"]
    assert vectors["composite"]["score"] >= 7.5



def test_pareto_frontier_synthesis():
    """Ensures 3 Pareto vectors are synthesized with proper labels."""
    candidates_data = [
        {
            "candidate": {
                "idea": {"title": "Autonomous PR Code Reviewer"},
                "evidence_count": 38,
            },
            "vectors": {"composite": {"score": 8.8}},
        },
        {
            "candidate": {
                "idea": {"title": "CRM Voice Copilot"},
                "evidence_count": 29,
            },
            "vectors": {"composite": {"score": 8.4}},
        },
    ]

    frontier = comparison_engine.synthesize_pareto_frontier(candidates_data)
    assert len(frontier) == 3
    assert "Novelty" in frontier[0]["title"] or "Feasibility" in frontier[0]["title"]
    assert "Demand" in frontier[1]["title"] or "Competition" in frontier[1]["title"]
    assert "Capital Efficiency" in frontier[2]["title"] or "Risk" in frontier[2]["title"]


def test_recommendation_synthesis_objectives():
    """Verifies that the recommendation engine aligns with user-selected objectives."""
    candidates_data = [
        {
            "candidate": {
                "idea": {"id": "c1", "title": "Developer AST Reviewer"},
            },
            "vectors": {
                "novelty": {"score": 8.5},
                "market_demand": {"score": 9.0},
                "feasibility": {"score": 9.2},
                "competition": {"score": 5.0},
                "risk": {"score": 2.5},
            },
        },
        {
            "candidate": {
                "idea": {"id": "c2", "title": "Voice Sales Copilot"},
            },
            "vectors": {
                "novelty": {"score": 6.0},
                "market_demand": {"score": 8.5},
                "feasibility": {"score": 7.0},
                "competition": {"score": 8.5},
                "risk": {"score": 6.0},
            },
        },
    ]

    rec_mvp = comparison_engine.synthesize_recommendation(candidates_data, "mvp")
    assert rec_mvp["winner_idea_id"] == "c1"
    assert "Weighted Score Concordance" in rec_mvp["concordance"] or "Confidence" in rec_mvp["concordance"]


# ── 2. REST API Integration Tests ──

@pytest.mark.asyncio
async def test_list_comparisons_endpoint(client: AsyncClient):
    """GET /api/v1/comparisons returns status 200 with reports and real statistics."""
    res = await client.get("/api/v1/comparisons")
    assert res.status_code == 200
    data = res.json()
    assert "reports" in data
    assert "statistics" in data
    assert "total_comparisons" in data["statistics"]
    assert "avg_synthesis_speed" in data["statistics"]


@pytest.mark.asyncio
async def test_eligible_ideas_endpoint(client: AsyncClient):
    """GET /api/v1/comparisons/eligible-ideas returns candidate ideas with eligibility flags."""
    res = await client.get("/api/v1/comparisons/eligible-ideas")
    assert res.status_code == 200
    data = res.json()
    assert "ideas" in data
    assert "eligible_count" in data
    assert len(data["ideas"]) > 0
    # Every idea must contain required eligibility properties
    first_idea = data["ideas"][0]
    assert "eligible" in first_idea
    assert "status_display" in first_idea
    assert "status_code" in first_idea
    assert "reason_codes" in first_idea


@pytest.mark.asyncio
async def test_preview_comparison_endpoint(client: AsyncClient):
    """POST /api/v1/comparisons/preview returns candidate preview and comparability status."""
    res = await client.post(
        "/api/v1/comparisons/preview",
        json={
            "idea_ids": ["idea-pr-reviewer", "idea-crm-copilot"],
            "objective": "mvp",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["eligible"] is True
    assert data["candidate_count"] == 2
    assert "Fully Comparable" in data["comparability_status"]


@pytest.mark.asyncio
async def test_comparison_bounds_validation(client: AsyncClient):
    """Rejects comparison requests with fewer than 2 or more than 4 candidates."""
    # Under min bounds (1 idea)
    res_under = await client.post(
        "/api/v1/comparisons",
        json={"idea_ids": ["idea-pr-reviewer"]},
    )
    assert res_under.status_code in (400, 422)

    # Over max bounds (5 ideas)
    res_over = await client.post(
        "/api/v1/comparisons",
        json={
            "idea_ids": [
                "idea-pr-reviewer",
                "idea-crm-copilot",
                "idea-ast-gatekeeper",
                "idea-api-doc-synthesizer",
                "idea-deal-risk-radar",
            ]
        },
    )
    assert res_over.status_code in (400, 422)


@pytest.mark.asyncio
async def test_comparison_crud_lifecycle(client: AsyncClient):
    """
    Tests complete lifecycle:
    1. Create comparison
    2. Get detailed report
    3. Update title
    4. Delete report
    """
    # 1. Create
    create_res = await client.post(
        "/api/v1/comparisons",
        json={
            "idea_ids": ["idea-pr-reviewer", "idea-ast-gatekeeper"],
            "title": "Automated Test Comparison",
            "objective": "feasibility",
        },
    )
    assert create_res.status_code == 200
    report_id = create_res.json()["id"]

    # 2. Get Report
    get_res = await client.get(f"/api/v1/comparisons/{report_id}")
    assert get_res.status_code == 200
    report_data = get_res.json()
    assert report_data["title"] == "Automated Test Comparison"
    assert len(report_data["candidates"]) == 2
    assert "recommendation" in report_data
    assert "pareto_frontier" in report_data
    assert "data_comparability" in report_data
    assert "executive_takeaway" in report_data

    # 3. Patch / Rename
    patch_res = await client.patch(
        f"/api/v1/comparisons/{report_id}",
        json={"title": "Updated Test Comparison Title"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Updated Test Comparison Title"

    # 4. Delete
    delete_res = await client.delete(f"/api/v1/comparisons/{report_id}")
    assert delete_res.status_code == 200

    # Verify 404 after deletion
    verify_res = await client.get(f"/api/v1/comparisons/{report_id}")
    assert verify_res.status_code == 404


@pytest.mark.asyncio
async def test_duplicate_candidate_rejection(client: AsyncClient):
    """Rejects comparison and preview requests with duplicate candidate ideas."""
    res = await client.post(
        "/api/v1/comparisons",
        json={"idea_ids": ["idea-pr-reviewer", "idea-pr-reviewer"]},
    )
    assert res.status_code in (400, 422)

    res_prev = await client.post(
        "/api/v1/comparisons/preview",
        json={"idea_ids": ["idea-pr-reviewer", "idea-pr-reviewer"]},
    )
    assert res_prev.status_code in (400, 422)


@pytest.mark.asyncio
async def test_latest_report_inclusion(client: AsyncClient):
    """Ensures GET /api/v1/comparisons returns latest_report object for report-first workspace."""
    res = await client.get("/api/v1/comparisons")
    assert res.status_code == 200
    data = res.json()
    if data["reports"]:
        assert "latest_report" in data
        assert data["latest_report"] is not None
        assert "winner_title" in data["latest_report"] or "title" in data["latest_report"]
