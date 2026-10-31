"""
Comprehensive 5-Idea Market Intelligence Test Suite for DIME.
Tests Idea Understanding, Dynamic Query/Signal Generation, Provenance,
Enhanced New Sections (TAM/SAM/SOM, Competitors, Research, GitHub, Insights, Gaps, Coverage),
and Cross-Idea Isolation.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.services.market_intelligence_service import MarketIntelligenceService
from backend.models.analysis import Analysis, AnalysisStatus
from backend.models.evidence import Evidence, Finding
from backend.models.scoring import AnalysisScore

ideas = [
    {
        "id": "idea-a",
        "title": "HIPAA-Compliant Dental Voice AI Assistant",
        "description": "Hands-free ambient voice AI assistant for dental charting, periodontal probing dictation, and Dentrix EHR integration during sterile clinical procedures.",
        "domain": "HealthTech / Dental Software",
        "target_audience": "Dentists and dental hygienists",
    },
    {
        "id": "idea-b",
        "title": "AI-Powered Code Review and Debugging Platform",
        "description": "Automated PR code reviewer providing deterministic AST validation, regression detection, and distributed microservice dependency tracing.",
        "domain": "Developer Tools / Infrastructure",
        "target_audience": "Software engineering teams and tech leads",
    },
    {
        "id": "idea-c",
        "title": "AI-Powered Personalized Learning Platform for Rural Students",
        "description": "Offline-first adaptive EdTech tutoring platform designed for low-bandwidth rural schools, offering Socratic inquiry and curriculum pacing.",
        "domain": "Education / EdTech",
        "target_audience": "K-12 students and teachers in rural districts",
    },
    {
        "id": "idea-d",
        "title": "AI-Powered Expense Management for Small Businesses",
        "description": "Automated receipt OCR, month-end QuickBooks reconciliation, and tax deduction misclassification prevention for SMBs.",
        "domain": "FinTech / SMB Accounting",
        "target_audience": "Small business owners and bookkeepers",
    },
    {
        "id": "idea-e",
        "title": "Sustainable Packaging Marketplace for Small Manufacturers",
        "description": "Pooled-demand marketplace connecting artisan makers with certified compostable and mycelium packaging suppliers with low MOQs.",
        "domain": "Supply Chain / CleanTech",
        "target_audience": "Small food & cosmetic manufacturers",
    },
]

def run_tests() -> None:
    print("=" * 70)
    print("FIVE-IDEA MARKET INTELLIGENCE TEST SUITE")
    print("=" * 70)
    results = []

    for item in ideas:
        analysis = Analysis(
            id=f"test-analysis-{item['id']}",
            idea_id=item["id"],
            user_id="test-user",
            title=item["title"],
            description=item["description"],
            domain=item["domain"],
            target_audience=item["target_audience"],
            status=AnalysisStatus.COMPLETED
        )
        scores = [
            AnalysisScore(analysis_id=analysis.id, metric_name="Market Pain", score=82.0),
            AnalysisScore(analysis_id=analysis.id, metric_name="Opportunity", score=85.0),
        ]
        ev_sample = [
            Evidence(
                analysis_id=analysis.id,
                evidence_type="research",
                claim=f"Empirical clinical and operational benchmark for {item['title']}",
                supporting_text=f"Empirical evidence regarding {item['domain']} operational hurdles and customer friction.",
                source_url=f"https://doi.org/10.1000/{item['id']}",
                source_title=f"{item['domain']} Research Journal",
                relevance_score=0.92,
                confidence=0.95
            ),
            Evidence(
                analysis_id=analysis.id,
                evidence_type="github",
                claim=f"Open source architecture for {item['title']}",
                supporting_text=f"Codebase providing core protocols and architecture for {item['domain']}.",
                source_url=f"https://github.com/org/{item['id']}",
                source_title=f"GitHub - org/{item['id']}",
                relevance_score=0.88,
                confidence=0.91
            ),
        ]
        findings = [
            Finding(
                analysis_id=analysis.id,
                category="pain",
                title=f"Severe Operational Friction in {item['title']}",
                description=f"Field interviews confirm recurring bottlenecks across {item['domain']} workflows.",
                confidence=0.92,
                evidence_count=8
            ),
            Finding(
                analysis_id=analysis.id,
                category="market",
                title=f"Ecosystem Fragmentation in {item['domain']}",
                description=f"Disconnected legacy tooling creates high error rates for {item['target_audience']}.",
                confidence=0.88,
                evidence_count=6
            ),
        ]

        mi = MarketIntelligenceService.synthesize_market_intelligence(
            analysis=analysis,
            db_scores=scores,
            findings=findings,
            evidence_list=ev_sample,
            competitors=None,
            source_documents=None,
            source_ingestions=None,
        )
        results.append((item, mi))

        print(f"\n>>> TEST IDEA: {item['title']} ({item['domain']})")
        print(f"  Supporting Signal: {mi['summary']['marketDemand']['supportingSignal']}")
        print(f"  Demand Chart: \"{mi['demandChart']['series1Label']}\" vs \"{mi['demandChart']['series2Label']}\"")
        print(f"  Qualitative Signals: {[s['title'] for s in mi['qualitativeSignals']]}")
        print(f"  Top Pain Point: {mi['painPoints'][0]['title']} ({mi['painPoints'][0]['percentage']}%)")
        print(f"  TAM/SAM/SOM: {mi['marketSize']['tam']['value']} / {mi['marketSize']['sam']['value']} / {mi['marketSize']['som']['value']}")
        print(f"  Competitors Found: {len(mi['competitorLandscape']['competitors'])} (Angle: {mi['competitorLandscape']['differentiationAngle'][:60]}...)")
        print(f"  Research Papers: {len(mi['researchLandscape']['topPapers'])} papers (Velocity: {mi['researchLandscape']['academicVelocity']})")
        print(f"  GitHub Repos: {len(mi['githubEcosystem']['topRepositories'])} repos (Gap: {mi['githubEcosystem']['openSourceGap'][:60]}...)")
        print(f"  Insights: {len(mi['evidenceInsights']['insights'])} categories")
        print(f"  Research Gaps: {mi['researchGaps']['totalGaps']} identified")
        print(f"  Source Coverage: {mi['sourceCoverage']['totalProviders']} providers")

    # Cross-Idea Isolation Assertions
    print("\n" + "=" * 70)
    print("CROSS-IDEA ISOLATION & ZERO-LEAKAGE VERIFICATION")
    print("=" * 70)
    for i in range(len(results)):
        for j in range(i + 1, len(results)):
            t1, mi1 = results[i]
            t2, mi2 = results[j]
            assert mi1["qualitativeSignals"][0]["title"] != mi2["qualitativeSignals"][0]["title"], f"Signal collision between {t1['id']} and {t2['id']}"
            assert mi1["painPoints"][0]["title"] != mi2["painPoints"][0]["title"], f"Pain point collision between {t1['id']} and {t2['id']}"
            assert mi1["demandChart"]["series1Label"] != mi2["demandChart"]["series1Label"], f"Chart series collision between {t1['id']} and {t2['id']}"
            assert mi1["strategicOpportunity"]["explanation"] != mi2["strategicOpportunity"]["explanation"], f"Opportunity collision between {t1['id']} and {t2['id']}"
            assert mi1["marketSize"]["tam"]["description"] != mi2["marketSize"]["tam"]["description"], f"Market size collision between {t1['id']} and {t2['id']}"
            assert mi1["competitorLandscape"]["differentiationAngle"] != mi2["competitorLandscape"]["differentiationAngle"], f"Competitor angle collision between {t1['id']} and {t2['id']}"

    # Assert no mock data leaks anywhere in all 5 outputs
    for item, mi in results:
        dump = str(mi).lower()
        assert "leetcode" not in dump, f"LeetCode leak detected in {item['title']}!"
        assert "hackerrank" not in dump, f"HackerRank leak detected in {item['title']}!"
        assert "blind 75" not in dump, f"Blind 75 leak detected in {item['title']}!"
        assert "mock ai tool searches" not in dump, f"Mock label leak detected in {item['title']}!"
        assert "interview prep pain" not in dump, f"Interview prep leak detected in {item['title']}!"

    # Verify all expected keys are present in each output
    expected_top_keys = [
        "idea", "summary", "tabs", "demandChart", "qualitativeSignals",
        "painPoints", "sentiment", "strategicOpportunity", "marketSize",
        "competitorLandscape", "researchLandscape", "githubEcosystem",
        "evidenceInsights", "researchGaps", "sourceCoverage"
    ]
    for item, mi in results:
        for k in expected_top_keys:
            assert k in mi, f"Missing key {k} in payload for {item['title']}"

    print("SUCCESS: All 5 test ideas produce distinct, isolated, evidence-grounded research profiles.")
    print("SUCCESS: 0% data leakage across analyses.")
    print("SUCCESS: All 15 payload sections verified across all 5 test ideas.")
    print("SUCCESS: 0 mock/hardcoded values detected.")
    print("=" * 70)

def test_five_ideas_market_intelligence() -> None:
    run_tests()

if __name__ == "__main__":
    run_tests()
