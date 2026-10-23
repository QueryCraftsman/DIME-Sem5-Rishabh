"""
DIME Backend - AI Idea Extraction & Builder Service.

Transforms natural language input and conversational builder transcripts
into the normalized schema expected by DIME's multi-agent validation pipeline.
"""

from __future__ import annotations

import logging
from typing import Any

from backend.agents.provider import LLMProvider
from backend.schemas.idea_submission import (
    NaturalLanguageIdeaRequest,
    ExtractedIdeaResponse,
    ImproveIdeaRequest,
    ImproveIdeaResponse,
    BuilderChatRequest,
    BuilderChatResponse,
    BuilderSummaryRequest,
    BuilderChatMessage,
)

logger = logging.getLogger(__name__)


EXTRACTION_SYSTEM_PROMPT = """\
You are DIME's Senior Product Intelligence Architect.
Your task is to analyze an unformatted, natural-language business or product idea and extract a structured, grounded representation for downstream multi-agent market validation.

CRITICAL RULES:
1. Grounding & Honesty:
   - Only state as 'user_provided_fields' what the user explicitly stated.
   - For fields you reasonably extrapolate (e.g. industry category, technical concepts), label them in 'inferred_fields'.
   - If crucial elements like pricing model, competitors, or geographic bounds are absent, mark them in 'unknown_fields' and provide null or honest notes.
   - NEVER fabricate fake market sizes, customer research numbers, or claim the idea is already validated.
2. Title: Create a concise, professional title (under 80 characters, e.g. 'AI Placement Prep Platform').
3. Description: Write a clear 2-4 sentence summary of the proposed solution and mechanism.
4. Problem Statement: Articulate the core user pain point being solved.
5. Proposed Solution: How the product solves that pain point.
6. Target Audience: Specific personas (e.g. 'CS Undergraduates, Bootcamp Graduates, Hiring Managers'). Avoid generic 'Everyone'.
7. Industry: High-level classification (e.g. 'EdTech / Career Development', 'Developer Tools', 'Fintech', 'HealthTech', 'E-commerce').
8. Output MUST strictly conform to the ExtractedIdeaResponse schema.
"""


IMPROVEMENT_SYSTEM_PROMPT = """\
You are an expert Startup Advisor and YC-level Pitch Coach for DIME.
Your goal is to take a raw, informal idea description and rewrite it into a crisp, persuasive, and structured description without altering the original intent.

CRITICAL RULES:
1. Never invent customer testimonials, fake revenues, or market statistics.
2. Preserve all core concepts, audience hints, and unique angles from the user's input.
3. Organize clearly into: Problem, Solution, Target Audience, and Value Proposition.
4. Keep the improved description natural, compelling, and between 100-300 words.
5. List 2-4 bullet points in 'key_enhancements' explaining what was clarified (e.g., 'Articulated core monetization model', 'Specified target user persona').
"""


BUILDER_CHAT_SYSTEM_PROMPT = """\
You are DIME's Conversational Idea Builder — an empathetic, incisive AI product advisor.
Your role is to help the user turn a rough concept into a well-defined business idea through a friendly, natural dialog.

CONVERSATION PRINCIPLES:
1. Don't interrogate! Ask at most 1 or 2 focused questions at a time based on what the user just said.
2. Acknowledge and validate what the user shared before asking the next question.
3. Key areas to touch over the conversation (only as needed):
   - Problem & pain point
   - Target user & customer segment
   - Proposed solution & unique differentiator
   - Business/revenue model (optional)
4. If the user has already provided sufficient clarity on Problem, Target Users, and Proposed Solution, set 'is_ready_for_validation' to True!
5. Provide 2-3 short, actionable suggestions in 'suggested_questions' that the user can click as quick responses.
"""


BUILDER_SUMMARY_SYSTEM_PROMPT = """\
You are DIME's Senior Product Intelligence Architect.
Your task is to take a complete conversational transcript between a founder and DIME's AI Idea Builder, and synthesize the discussion into a single, cohesive, structured ExtractedIdeaResponse.

CRITICAL RULES:
1. Synthesize all answers given by the user across the conversation.
2. Differentiate between explicitly stated user decisions and inferred assumptions.
3. Produce a clear, professional working title and description suitable for immediate dispatch to DIME's multi-agent validation pipeline.
"""


class IdeaExtractionService:
    """Service providing natural language idea parsing, improvement, and conversational building."""

    def __init__(self, provider: LLMProvider | None = None) -> None:
        self.provider = provider or LLMProvider()

    async def extract_from_natural_language(
        self, request: NaturalLanguageIdeaRequest
    ) -> ExtractedIdeaResponse:
        """Extract structured idea information from raw natural language description and optional hints."""
        hints_section = []
        if request.target_audience:
            hints_section.append(f"- User-Specified Target Audience: {request.target_audience}")
        if request.industry:
            hints_section.append(f"- User-Specified Industry: {request.industry}")
        if request.geographic_market:
            hints_section.append(f"- User-Specified Market: {request.geographic_market}")
        if request.business_model:
            hints_section.append(f"- User-Specified Business Model: {request.business_model}")
        if request.known_competitors:
            hints_section.append(f"- User-Specified Competitors: {request.known_competitors}")
        if request.assumptions:
            hints_section.append(f"- User Assumptions: {request.assumptions}")

        hints_text = "\n".join(hints_section) if hints_section else "None provided."

        prompt = f"""\
[RAW IDEA DESCRIPTION]
{request.raw_description}

[USER-PROVIDED CONTEXTUAL HINTS]
{hints_text}

Analyze the above idea description and optional hints. Extract a structured representation strictly matching the ExtractedIdeaResponse schema.
Be realistic, grounded, and clearly distinguish user-provided vs inferred vs unknown information.
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=ExtractedIdeaResponse,
            system_prompt=EXTRACTION_SYSTEM_PROMPT,
        )

    async def improve_idea_description(
        self, request: ImproveIdeaRequest
    ) -> ImproveIdeaResponse:
        """Refine and clarify the user's description without inventing unsupported claims."""
        prompt = f"""\
[RAW IDEA DESCRIPTION]
{request.raw_description}

Please provide an improved, clearer version of this description and explain the key enhancements made.
Ensure you return valid JSON matching the ImproveIdeaResponse schema:
- improved_text: the refined description
- key_enhancements: list of specific improvements
- original_text: the exact original text provided
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=ImproveIdeaResponse,
            system_prompt=IMPROVEMENT_SYSTEM_PROMPT,
        )

    async def chat_builder(
        self, request: BuilderChatRequest
    ) -> BuilderChatResponse:
        """Process conversational turns in the AI Idea Builder."""
        # Format messages into transcript for LLM
        transcript_lines = []
        for msg in request.messages:
            speaker = "User" if msg.role == "user" else "DIME AI"
            transcript_lines.append(f"{speaker}: {msg.content}")

        transcript = "\n".join(transcript_lines)

        prompt = f"""\
[CONVERSATION TRANSCRIPT SO FAR]
{transcript}

Continue the conversation as DIME's AI Idea Builder.
Acknowledge the user's latest input, clarify any ambiguity, and ask the next natural question (or let them know their idea is ready for validation).
Output valid JSON matching BuilderChatResponse:
- message: your conversational response
- suggested_questions: 2-3 short chips the user could click to reply
- is_ready_for_validation: boolean (True if Problem, Target Users, and Proposed Solution are clear)
- key_takeaways: dictionary with current understanding of 'problem', 'target_audience', 'solution' (or None)
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=BuilderChatResponse,
            system_prompt=BUILDER_CHAT_SYSTEM_PROMPT,
        )

    async def summarize_builder_conversation(
        self, request: BuilderSummaryRequest
    ) -> ExtractedIdeaResponse:
        """Convert the entire conversation transcript into a normalized ExtractedIdeaResponse."""
        transcript_lines = []
        for msg in request.messages:
            speaker = "User" if msg.role == "user" else "DIME AI"
            transcript_lines.append(f"{speaker}: {msg.content}")

        transcript = "\n".join(transcript_lines)

        prompt = f"""\
[FULL CONVERSATION TRANSCRIPT]
{transcript}

Synthesize this entire conversation into a structured ExtractedIdeaResponse.
Extract the finalized Title, Description, Problem Statement, Proposed Solution, Target Audience, Industry, Core Features, Business Model, and Assumptions discussed.
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=ExtractedIdeaResponse,
            system_prompt=BUILDER_SUMMARY_SYSTEM_PROMPT,
        )
