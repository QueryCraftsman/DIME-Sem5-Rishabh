"""
DIME Backend - Multi-Mode Idea Validation System Tests.

Tests:
1. Natural language idea extraction schema and endpoints
2. Idea description improvement endpoint
3. Conversational AI Idea Builder chat and summary endpoints
4. Shared normalization layer convergence
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import create_app
from backend.schemas.idea_submission import (
    NaturalLanguageIdeaRequest,
    ExtractedIdeaResponse,
    ImproveIdeaRequest,
    ImproveIdeaResponse,
    BuilderChatRequest,
    BuilderChatResponse,
    BuilderChatMessage,
    BuilderSummaryRequest,
    NormalizedIdeaPayload,
)

@pytest.fixture
def app():
    return create_app()

@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_extract_idea_validation_rejects_empty(client: AsyncClient):
    """Rejects empty or too-short descriptions."""
    res = await client.post(
        "/api/v1/ideas/extract",
        json={"raw_description": "too short"}
    )
    assert res.status_code == 422 or res.status_code == 400


@pytest.mark.asyncio
async def test_improve_idea_rejects_empty(client: AsyncClient):
    """Rejects empty improvement requests."""
    res = await client.post(
        "/api/v1/ideas/improve",
        json={"raw_description": "short"}
    )
    assert res.status_code == 422 or res.status_code == 400


@pytest.mark.asyncio
async def test_builder_chat_rejects_empty_messages(client: AsyncClient):
    """Rejects chat requests with no messages."""
    res = await client.post(
        "/api/v1/ideas/builder-chat",
        json={"messages": []}
    )
    assert res.status_code == 422 or res.status_code == 400


@pytest.mark.asyncio
async def test_shared_normalization_schema():
    """Verify that all submission methods can construct a valid NormalizedIdeaPayload."""
    # From Describe mode
    describe_payload = NormalizedIdeaPayload(
        title="AI Placement Prep Platform",
        description="A platform offering automated mock interviews and real-time coding feedback.",
        targetAudience="College CS Students",
        industry="EdTech / Career Prep",
        analysisDepth="STANDARD",
        inputMode="natural_language",
        rawIdea="I want to build an AI interview prep platform for students."
    )
    assert describe_payload.title == "AI Placement Prep Platform"
    assert describe_payload.inputMode == "natural_language"

    # From Structured form mode
    structured_payload = NormalizedIdeaPayload(
        title="Dental Clinic Voice Scribe",
        description="An ambient voice AI scribe for solo and small group dental clinics.",
        targetAudience="Dentists, Hygienists",
        industry="Healthcare / Dental",
        analysisDepth="STANDARD",
        formFactors=["Web App", "Chrome Extension"],
        budget="50k-100k",
        inputMode="structured_form"
    )
    assert structured_payload.title == "Dental Clinic Voice Scribe"
    assert structured_payload.inputMode == "structured_form"

    # From AI Idea Builder mode
    builder_payload = NormalizedIdeaPayload(
        title="GraphQL Breaking Change Detector",
        description="A CI/CD tool that monitors GraphQL schemas across federated microservices.",
        targetAudience="Platform Engineers, Backend Developers",
        industry="Developer Tools",
        analysisDepth="STANDARD",
        inputMode="ai_builder",
        rawIdea="User: I want a bot for GraphQL PRs\nAI: Who is it for?\nUser: Backend teams"
    )
    assert builder_payload.title == "GraphQL Breaking Change Detector"
    assert builder_payload.inputMode == "ai_builder"


@pytest.mark.asyncio
async def test_extracted_idea_response_schema_fields():
    """Verify field attribution and schema validation."""
    data = ExtractedIdeaResponse(
        title="Automated Pull Request Reviewer",
        description="A bot that integrates with GitHub to review pull requests.",
        problem_statement="Manual reviews take too long and block deployments.",
        proposed_solution="Instant AI review on PR creation.",
        target_audience="Software Engineers",
        industry="Developer Tools",
        core_features=["PR commenting", "Vulnerability scanning"],
        business_model=None,
        known_competitors=["CodeRabbit", "Sourcery"],
        geographic_market=None,
        assumptions=["Teams use GitHub"],
        missing_information=["Pricing details"],
        user_provided_fields=["product_concept"],
        inferred_fields=["industry", "features"],
        unknown_fields=["business_model", "geographic_market"]
    )
    assert data.title == "Automated Pull Request Reviewer"
    assert "product_concept" in data.user_provided_fields
    assert "business_model" in data.unknown_fields
    assert data.business_model is None
