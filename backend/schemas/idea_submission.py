"""
DIME Backend - Idea Submission & Extraction Schemas.

Defines the Pydantic schemas for Multi-Mode Idea Validation:
- Natural language description extraction
- AI-assisted idea improvement
- AI Idea Builder conversational flow
- Shared normalization schemas
"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class NaturalLanguageIdeaRequest(BaseModel):
    """Payload for natural-language idea submission and extraction."""
    raw_description: str = Field(..., min_length=15, max_length=10000, description="User's natural language idea description.")
    target_audience: Optional[str] = Field(None, max_length=500, description="Optional target audience provided by user.")
    industry: Optional[str] = Field(None, max_length=300, description="Optional industry/domain provided by user.")
    geographic_market: Optional[str] = Field(None, max_length=200, description="Optional geographic market provided by user.")
    business_model: Optional[str] = Field(None, max_length=300, description="Optional expected monetization/business model.")
    known_competitors: Optional[str] = Field(None, max_length=500, description="Optional known competitors.")
    assumptions: Optional[str] = Field(None, max_length=1000, description="Optional hypotheses or assumptions.")


class ExtractedIdeaResponse(BaseModel):
    """Structured idea representation extracted from natural language or conversational flow."""
    title: str = Field(..., max_length=150, description="Concise, working title for the idea.")
    description: str = Field(..., description="Comprehensive description of the concept and solution.")
    problem_statement: str = Field(..., description="Specific problem being solved.")
    proposed_solution: str = Field(..., description="Core proposed product solution.")
    target_audience: str = Field(..., description="Specific target user segments.")
    industry: str = Field(..., description="Industry or primary market domain.")
    core_features: list[str] = Field(default_factory=list, description="Key features or functional capabilities.")
    business_model: Optional[str] = Field(None, description="Monetization or revenue model if specified or inferred.")
    known_competitors: list[str] = Field(default_factory=list, description="Existing alternative solutions or competitors.")
    geographic_market: Optional[str] = Field(None, description="Target geographic market.")
    assumptions: list[str] = Field(default_factory=list, description="Key business/technical assumptions.")
    missing_information: list[str] = Field(default_factory=list, description="Important details not yet provided.")
    user_provided_fields: list[str] = Field(default_factory=list, description="Fields explicitly mentioned by the user.")
    inferred_fields: list[str] = Field(default_factory=list, description="Fields inferred by the AI model.")
    unknown_fields: list[str] = Field(default_factory=list, description="Fields that remain unknown.")


class ImproveIdeaRequest(BaseModel):
    """Payload for AI-assisted idea description improvement."""
    raw_description: str = Field(..., min_length=15, max_length=10000, description="The raw idea to improve.")


class ImproveIdeaResponse(BaseModel):
    """Response containing the refined idea and change rationale."""
    improved_text: str = Field(..., description="Clearer, well-structured version of the user idea.")
    key_enhancements: list[str] = Field(default_factory=list, description="Summary of key enhancements made.")
    original_text: str = Field(..., description="The original raw idea text.")


class BuilderChatMessage(BaseModel):
    """A message in the AI Idea Builder conversation."""
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., max_length=4000)


class BuilderChatRequest(BaseModel):
    """Payload for conversational idea development."""
    messages: list[BuilderChatMessage] = Field(..., min_length=1)


class BuilderChatResponse(BaseModel):
    """Assistant reply with smart context and suggested follow-ups."""
    message: str = Field(..., description="Next conversational response from AI product coach.")
    suggested_questions: list[str] = Field(default_factory=list, description="2-3 prompt chips for quick user answers.")
    is_ready_for_validation: bool = Field(default=False, description="Whether enough details are collected to begin validation.")
    key_takeaways: Optional[dict[str, str]] = Field(default=None, description="Current understanding of problem, audience, solution.")


class BuilderSummaryRequest(BaseModel):
    """Request to convert builder conversation history into a structured idea."""
    messages: list[BuilderChatMessage] = Field(..., min_length=1)


class NormalizedIdeaPayload(BaseModel):
    """The canonical shared normalization schema expected by DIME's validation engine."""
    title: str = Field(..., min_length=4, max_length=200)
    description: str = Field(..., min_length=30)
    targetAudience: str = Field(..., min_length=2)
    industry: str = Field(..., min_length=2)
    analysisDepth: str = Field(default="STANDARD")
    formFactors: list[str] = Field(default_factory=list)
    budget: str = Field(default="")
    teamSize: str = Field(default="")
    timeline: str = Field(default="")
    preferredTechnologies: list[str] = Field(default_factory=list)
    inputMode: str = Field(default="natural_language")
    rawIdea: Optional[str] = None
