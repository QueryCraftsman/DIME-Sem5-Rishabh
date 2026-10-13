"""
DIME Backend - Centralized Relevance Scoring.

Provides configurable relevance scoring for candidates across all sources.
This replaces the "take first N results" pattern with evidence-quality filtering.

IMPORTANT: Keywords from the StructuredIdea are multi-word phrases
(e.g., "AI-powered resume screening"). We must tokenize them into
individual words for matching, NOT require exact phrase matches.
"""

import logging
import re
from typing import Any

from backend.agents.models import StructuredIdea, CandidateRelevance
from backend.core.config import get_settings

logger = logging.getLogger(__name__)

# ── Configurable Thresholds ────────────────────────────────────────────
# Lowered from 0.55/0.50 — the token-level scoring is more calibrated
GITHUB_MIN_RELEVANCE = 0.25
PAPER_MIN_RELEVANCE = 0.20
WEB_MIN_RELEVANCE = 0.25

# Max items to select even if above threshold (prevent flooding)
GITHUB_MAX_SELECTED = 25
PAPER_MAX_SELECTED = 20

# ── Stopwords to ignore during token matching ──────────────────────────
_STOPWORDS = frozenset({
    "a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "at",
    "by", "is", "it", "its", "are", "was", "be", "as", "with", "from",
    "that", "this", "has", "have", "had", "not", "but", "can", "will",
    "do", "if", "no", "so", "up", "out", "all", "my", "we", "our",
    "you", "your", "they", "them", "he", "she", "his", "her", "us",
    "than", "then", "also", "just", "more", "very", "any", "each",
    "such", "into", "over", "about", "use", "using", "used", "based",
    "via", "etc", "new", "way", "may", "like",
})


def _tokenize(text: str) -> set[str]:
    """Tokenize text into meaningful lowercase words (3+ chars, no stopwords)."""
    if not text:
        return set()
    # Split on non-alphanumeric (handles hyphens, slashes, etc.)
    words = re.split(r'[^a-zA-Z0-9]+', text.lower())
    return {w for w in words if len(w) >= 3 and w not in _STOPWORDS}


def _extract_idea_tokens(keywords: list[str]) -> set[str]:
    """Extract individual meaningful tokens from a list of keyword phrases."""
    tokens: set[str] = set()
    for kw in keywords:
        tokens.update(_tokenize(kw))
    return tokens


# ── Negative Patterns (generic repositories that are almost never relevant) ──
GENERIC_REPO_PATTERNS = [
    r"^awesome-",
    r"^awesome_",
    r"-awesome$",
    r"^curated-list",
    r"^collection-of",
    r"^list-of",
]

GENERIC_DESCRIPTION_KEYWORDS = [
    "curated list of",
    "awesome list",
    "a collection of",
    "list of resources",
    "a list of",
    "compilation of",
]


def compute_text_overlap(text_a: str, text_b: str) -> float:
    """Compute Jaccard-like word overlap between two texts."""
    words_a = _tokenize(text_a)
    words_b = _tokenize(text_b)
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)


def compute_keyword_match(text: str, keywords: list[str]) -> float:
    """
    Compute token-level keyword match score.
    
    Instead of requiring exact multi-word phrase matches, this:
    1. Tokenizes all keyword phrases into individual words
    2. Tokenizes the target text
    3. Returns the fraction of keyword tokens found in the text
    
    This means "AI-powered resume screening" generates tokens
    {"powered", "resume", "screening"} and matches if any appear.
    """
    if not text or not keywords:
        return 0.0
    
    idea_tokens = _extract_idea_tokens(keywords)
    if not idea_tokens:
        return 0.0
    
    text_tokens = _tokenize(text)
    if not text_tokens:
        return 0.0
    
    hits = idea_tokens & text_tokens
    # Return fraction of idea tokens found in text
    return len(hits) / len(idea_tokens)


def compute_keyword_coverage(text: str, keywords: list[str]) -> float:
    """
    Compute how many keyword *phrases* have at least one token match.
    
    This measures breadth: did the text touch on each keyword topic?
    A score of 0.5 means half the keyword phrases had at least one word match.
    """
    if not text or not keywords:
        return 0.0
    
    text_tokens = _tokenize(text)
    if not text_tokens:
        return 0.0
    
    covered = 0
    for kw in keywords:
        kw_tokens = _tokenize(kw)
        if kw_tokens and kw_tokens & text_tokens:
            covered += 1
    
    return covered / len(keywords)


def is_generic_repository(repo_name: str, description: str) -> bool:
    """Check if a repository is a generic list/collection that's rarely relevant."""
    name_lower = repo_name.lower()
    for pattern in GENERIC_REPO_PATTERNS:
        if re.search(pattern, name_lower):
            return True
    desc_lower = (description or "").lower()
    for keyword in GENERIC_DESCRIPTION_KEYWORDS:
        if keyword in desc_lower:
            return True
    return False


def score_github_candidate(
    repo_data: dict[str, Any],
    structured_idea: StructuredIdea,
    query_used: str = "",
    negative_keywords: list[str] | None = None,
) -> CandidateRelevance:
    """
    Score a GitHub repository candidate for relevance to the idea.
    
    Uses token-level matching (not exact phrase matching) so that
    multi-word keywords from the LLM actually match real repo text.
    """
    full_name = repo_data.get("full_name", "")
    description = repo_data.get("description", "") or ""
    topics = repo_data.get("topics", [])
    readme = repo_data.get("_readme_text", "") or ""
    url = repo_data.get("html_url", "")
    
    # Build idea keyword lists
    idea_keywords = (
        structured_idea.core_capabilities
        + structured_idea.technical_concepts
        + structured_idea.market_terms
        + [structured_idea.problem, structured_idea.domain, structured_idea.product_type]
    )
    idea_text = " ".join(idea_keywords)
    
    # 1. Title/Description token match (0.25 weight)
    repo_text = f"{full_name} {description} {' '.join(topics)}"
    title_token_score = compute_keyword_match(repo_text, idea_keywords)
    
    # 2. Title/Description coverage — how many keyword phrases are touched (0.15 weight)
    title_coverage = compute_keyword_coverage(repo_text, idea_keywords)
    
    # 3. README token match (0.25 weight)
    readme_score = 0.0
    if readme:
        readme_score = compute_keyword_match(readme[:5000], idea_keywords)
    
    # 4. Domain/topic match (0.15 weight)
    domain_terms = [structured_idea.domain] + structured_idea.market_terms
    topic_text = " ".join(topics) + " " + description
    domain_score = compute_keyword_match(topic_text, domain_terms)
    
    # 5. Text overlap with full idea (0.10 weight)
    overlap_score = compute_text_overlap(repo_text, idea_text)
    
    # 6. Metadata quality (0.10 weight)
    has_description = 1.0 if description else 0.0
    has_readme = 1.0 if readme else 0.5
    has_topics = 1.0 if topics else 0.0
    not_archived = 0.0 if repo_data.get("archived", False) else 1.0
    meta_score = (has_description * 0.3 + has_readme * 0.3 + has_topics * 0.2 + not_archived * 0.2)
    
    # Composite score
    raw_score = (
        title_token_score * 0.25
        + title_coverage * 0.15
        + readme_score * 0.25
        + domain_score * 0.15
        + overlap_score * 0.10
        + meta_score * 0.10
    )
    
    # Negative signal penalty
    penalty = 0.0
    reason_parts = []
    
    if is_generic_repository(full_name, description):
        penalty += 0.30
        reason_parts.append("generic list/collection repository")
    
    if negative_keywords:
        neg_tokens = _extract_idea_tokens(negative_keywords)
        text_tokens = _tokenize(repo_text) | _tokenize(readme[:1000])
        neg_hits = len(neg_tokens & text_tokens)
        if neg_hits > 2:
            penalty += 0.10 * min(neg_hits // 2, 3)
            reason_parts.append(f"matches {neg_hits} negative tokens")
    
    final_score = max(0.0, min(1.0, raw_score - penalty))
    
    # Classify relationship
    if final_score >= 0.55:
        relationship = "DIRECT_COMPETITOR"
    elif final_score >= 0.40:
        relationship = "INDIRECT_COMPETITOR"
    elif final_score >= 0.25:
        relationship = "TECHNICAL_REFERENCE"
    elif final_score >= 0.15:
        relationship = "ADJACENT"
    else:
        relationship = "IRRELEVANT"
    
    # Build reason
    if not reason_parts:
        reason_parts.append(
            f"tokens={title_token_score:.2f}, coverage={title_coverage:.2f}, "
            f"readme={readme_score:.2f}, domain={domain_score:.2f}"
        )
    
    return CandidateRelevance(
        source="github",
        title=full_name,
        url=url,
        relationship=relationship,
        relevance_score=round(final_score, 4),
        reason="; ".join(reason_parts),
        query_used=query_used,
        selected=final_score >= GITHUB_MIN_RELEVANCE,
    )


def score_paper_candidate(
    paper_data: dict[str, Any],
    structured_idea: StructuredIdea,
    query_used: str = "",
) -> CandidateRelevance:
    """Score an academic paper candidate for relevance using token-level matching."""
    title = paper_data.get("title", "") or ""
    abstract = paper_data.get("abstract", "") or ""
    url = paper_data.get("url", "") or ""
    
    idea_keywords = (
        structured_idea.core_capabilities
        + structured_idea.technical_concepts
        + structured_idea.market_terms
        + [structured_idea.problem, structured_idea.domain]
    )
    
    # 1. Title token match (0.25 weight)
    title_token_score = compute_keyword_match(title, idea_keywords)
    
    # 2. Title coverage (0.15 weight)
    title_coverage = compute_keyword_coverage(title, idea_keywords)
    
    # 3. Abstract token match (0.30 weight)
    abstract_score = compute_keyword_match(abstract[:3000], idea_keywords) if abstract else 0.0
    
    # 4. Domain match (0.15 weight)
    domain_terms = [structured_idea.domain] + structured_idea.market_terms
    domain_score = compute_keyword_match(f"{title} {abstract[:500]}", domain_terms)
    
    # 5. Problem match (0.15 weight)
    problem_score = compute_keyword_match(
        f"{title} {abstract[:500]}",
        [structured_idea.problem]
    )
    
    final_score = (
        title_token_score * 0.25
        + title_coverage * 0.15
        + abstract_score * 0.30
        + domain_score * 0.15
        + problem_score * 0.15
    )
    final_score = max(0.0, min(1.0, final_score))
    
    if final_score >= 0.50:
        relationship = "RESEARCH_REFERENCE"
    elif final_score >= 0.30:
        relationship = "TECHNICAL_REFERENCE"
    elif final_score >= 0.15:
        relationship = "ADJACENT"
    else:
        relationship = "IRRELEVANT"
    
    return CandidateRelevance(
        source="paper",
        title=title,
        url=url,
        relationship=relationship,
        relevance_score=round(final_score, 4),
        reason=f"tokens={title_token_score:.2f}, coverage={title_coverage:.2f}, abstract={abstract_score:.2f}, domain={domain_score:.2f}",
        query_used=query_used,
        selected=final_score >= PAPER_MIN_RELEVANCE,
    )
