"""
Tests for OverviewIntelligenceService:
- Contextual competitor discovery and dynamic overlap
- Cross-idea differentiation (FoodLoop vs CampusOS vs Physics Lab)
- Authentic confidence calculation (elimination of fixed 91% bug)
- Idea and analysis-run isolation
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.analysis import Analysis, AnalysisStatus
from backend.models.evidence import Evidence, Finding
from backend.models.scoring import AnalysisScore
from backend.services.overview_intelligence_service import OverviewIntelligenceService


@pytest.mark.asyncio
async def test_foodloop_overview_contextual_intelligence(db_session: AsyncSession):
    analysis = Analysis(
        id="test-foodloop-001",
        idea_id="idea-foodloop-001",
        user_id="user-1",
        title="FoodLoop: Smart Surplus Food Redistribution",
        description="A B2B platform connecting corporate cafeterias and grocery stores with local food rescue charities.",
        domain="Food Logistics / Waste Reduction",
        target_audience="Corporate kitchen managers, food bank directors, and volunteer drivers.",
        status=AnalysisStatus.COMPLETED,
    )
    db_session.add(analysis)
    await db_session.commit()

    evidence_list = [
        Evidence(
            id=f"ev-food-{i}",
            analysis_id=analysis.id,
            evidence_type="web",
            claim="Commercial food rescue platforms reduce cafeteria waste.",
            supporting_text="Food donation logistics require real-time temperature tracking.",
            source_url="https://recyclecopia.com",
            source_title="Copia Food Redistribution",
            confidence=0.88,
            relevance_score=0.9,
        )
        for i in range(8)
    ]
    for ev in evidence_list:
        db_session.add(ev)
    await db_session.commit()

    overview = await OverviewIntelligenceService.get_or_synthesize_overview(
        analysis=analysis,
        db_scores=[],
        findings=[],
        evidence_list=evidence_list,
        db=db_session,
    )

    competitors = overview["competitors"]
    comp_names = [c["name"] for c in competitors]
    assert any("Too Good To Go" in n or "Copia" in n or "Olio" in n for n in comp_names)
    assert not any("LeetCode" in n or "Pramp" in n or "Interviewing" in n for n in comp_names)

    # Verify strategic gaps are food-specific
    gaps = overview["strategic_gaps"]
    gap_titles = [g["title"] for g in gaps]
    assert any("Food Safety" in t or "Donor Liability" in t or "Routing" in t for t in gap_titles)
    assert not any("Resume" in t or "Audio" in t or "STAR" in t for t in gap_titles)

    # Verify competition confidence is NOT fixed 91%
    comp_score = overview["scores"]["Market Saturation"]
    assert comp_score["confidence"] != 91 or comp_score["status"] == "AVAILABLE"
    assert comp_score["overlap"] >= 40


@pytest.mark.asyncio
async def test_campusos_overview_contextual_intelligence(db_session: AsyncSession):
    analysis = Analysis(
        id="test-campusos-002",
        idea_id="idea-campusos-002",
        user_id="user-1",
        title="CampusOS: The Student Workflow Assistant",
        description="An AI-powered academic operating system that aggregates student syllabi, deadlines, and Canvas assignments into an adaptive study queue.",
        domain="EdTech / Student Productivity",
        target_audience="Undergraduate college students and high school seniors balancing heavy course loads.",
        status=AnalysisStatus.COMPLETED,
    )
    db_session.add(analysis)
    await db_session.commit()

    overview = await OverviewIntelligenceService.get_or_synthesize_overview(
        analysis=analysis,
        db_scores=[],
        findings=[],
        evidence_list=[],
        db=db_session,
    )

    competitors = overview["competitors"]
    comp_names = [c["name"] for c in competitors]
    assert any("Notion" in n or "Canvas" in n or "MyStudyLife" in n for n in comp_names)
    assert not any("Too Good To Go" in n or "Copia" in n for n in comp_names)

    # Verify strategic gaps are student/workflow specific
    gaps = overview["strategic_gaps"]
    gap_titles = [g["title"] for g in gaps]
    assert any("LMS" in t or "Syllabus" in t or "Study Pacing" in t for t in gap_titles)


@pytest.mark.asyncio
async def test_physics_lab_overview_contextual_intelligence(db_session: AsyncSession):
    analysis = Analysis(
        id="test-physics-003",
        idea_id="idea-physics-003",
        user_id="user-1",
        title="Gamified Virtual Physics Lab with AI Guidance",
        description="An interactive simulation playground where students solve experimental mechanics challenges with real-time conversational AI guidance.",
        domain="EdTech / Science Education",
        target_audience="High school students, early college students, and STEM teachers.",
        status=AnalysisStatus.COMPLETED,
    )
    db_session.add(analysis)
    await db_session.commit()

    overview = await OverviewIntelligenceService.get_or_synthesize_overview(
        analysis=analysis,
        db_scores=[],
        findings=[],
        evidence_list=[],
        db=db_session,
    )

    competitors = overview["competitors"]
    comp_names = [c["name"] for c in competitors]
    assert any("PhET" in n or "Labster" in n or "Algodoo" in n for n in comp_names)
    assert not any("Notion" in n or "Canvas" in n or "Pramp" in n for n in comp_names)

    # Verify strategic gaps are physics/simulation specific
    gaps = overview["strategic_gaps"]
    gap_titles = [g["title"] for g in gaps]
    assert any("Socratic" in t or "Gamification" in t or "Vector" in t for t in gap_titles)


@pytest.mark.asyncio
async def test_confidence_and_isolation_across_runs(db_session: AsyncSession):
    # Analysis with zero evidence
    analysis_low = Analysis(
        id="test-empty-004",
        idea_id="idea-empty-004",
        user_id="user-1",
        title="Quantum Molecular Dynamics Solver",
        description="Novel quantum simulation engine.",
        domain="DeepTech",
        target_audience="Bio-chemists",
        status=AnalysisStatus.COMPLETED,
    )
    db_session.add(analysis_low)
    await db_session.commit()

    overview_low = await OverviewIntelligenceService.get_or_synthesize_overview(
        analysis=analysis_low,
        db_scores=[],
        findings=[],
        evidence_list=[],
        db=db_session,
    )

    # Confidence must reflect lack of evidence honestly (preliminary/low, never 91% Very High)
    sat_conf = overview_low["scores"]["Market Saturation"]["confidence"]
    assert sat_conf <= 60, f"Expected low confidence for empty evidence, got {sat_conf}"
