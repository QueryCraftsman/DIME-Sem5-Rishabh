# PRD — AI Product Intelligence & Idea Validation Platform

**Document Type:** Product Requirements Document + Technical Architecture Specification  
**Target:** Version 1 (Academic MVP) + Version 2 (Advanced Product Intelligence)  
**Status:** Development Blueprint  
**Audience:** Student engineering team, mentor, AI/ML reviewers, full-stack developers, data engineers  
**Primary Objective:** Transform the existing static idea-evaluation/data-analytics project into a dynamic, evidence-backed AI application without uncontrolled scope expansion.

---

# 1. Executive Summary

The **AI Product Intelligence & Idea Validation Platform** is a web-based decision-support application that helps students, developers, researchers, hackathon teams, and early-stage builders evaluate software/product ideas before investing significant development time.

The existing system is a static analytics application based on fixed Kaggle Play Store review datasets and a static GitHub repository dataset. Its current evaluation logic relies on rule-based sentiment analysis and basic similarity matching. The new system will replace the frozen intelligence layer with a dynamic data-ingestion architecture, semantic retrieval, vector search, Retrieval-Augmented Generation (RAG), and a small set of specialized AI agents.

The platform will accept a natural-language product idea and produce an evidence-backed analysis covering:

- Idea understanding and decomposition
- Existing solutions and competitors
- Semantic novelty
- Market/user pain signals
- Technology and implementation feasibility
- Technical complexity
- Risks and constraints
- Recommended differentiation opportunities
- Recommended MVP scope
- Evidence and source references

Version 1 focuses on a **small, reliable multi-agent system** using live GitHub data, legitimate app-review data, controlled public-web crawling, embeddings, a vector database, RAG, and 3–4 agents.

Version 2 expands the knowledge base and analytical capabilities with Product Hunt, arXiv, Reddit, Google Trends, automated orchestration, a knowledge graph, improved recommendations, and trend forecasting.

The system is intentionally designed so that Version 2 extends Version 1 rather than requiring a complete rewrite.

---

# 2. Product Vision

> Build an evidence-driven AI platform that turns a software idea into a structured product-intelligence report by combining live data, semantic retrieval, market signals, and specialized AI reasoning.

The platform should answer:

> **“What already exists, what is still missing, whether the idea is technically and commercially promising, and what should the builder do next?”**

It should NOT simply answer:

> “How similar is this idea to another text?”

---

# 3. Problem Statement

## 3.1 Current Problem

Students and developers often start projects without systematic validation.

A typical manual workflow is:

1. Think of an idea.
2. Search Google.
3. Search GitHub.
4. Search app stores.
5. Search research papers.
6. Read reviews.
7. Search competitors.
8. Ask an LLM.
9. Manually decide whether the project is worth building.

This process is:

- time-consuming
- fragmented
- difficult to reproduce
- dependent on manual judgment
- vulnerable to outdated information
- difficult to quantify

## 3.2 Current System Problems

The existing project has:

- Static Kaggle datasets
- Static GitHub data
- Frozen dashboard metrics
- Rule-based/static sentiment analysis
- Basic similarity matching
- No semantic understanding of ideas
- No live data refresh
- No evidence-backed AI reasoning
- No specialized research workflow
- No dynamic competitor discovery
- No technical feasibility intelligence

## 3.3 Proposed Solution

Create a dynamic platform that:

```text
User Idea
    ↓
Idea Understanding
    ↓
Research Planning
    ↓
Live / Stored Evidence Retrieval
    ↓
Competition + Market + Technical Analysis
    ↓
AI Reasoning
    ↓
Evidence-backed Report
```

---

# 4. Target Users

## Primary Users

### Students
- Final-year students
- Capstone project teams
- Computer science students
- Data science/AI students
- Hackathon participants

### Developers
- Indie developers
- Freelancers
- Open-source builders
- Early-stage technical founders

## Secondary Users

- Researchers
- Startup teams
- Product managers
- Innovation teams
- Mentors/academic evaluators

## Initial Target Persona

The first release should optimize for:

> **A student/developer who has a software idea and wants to know whether it is sufficiently novel, useful, feasible, and worth building.**

Do not optimize Version 1 for enterprise customers.

---

# 5. Product Goals

## Primary Goals

1. Replace static data with dynamically refreshed sources.
2. Replace text-overlap similarity with semantic retrieval.
3. Ground AI responses in retrieved evidence.
4. Automate initial market/competition research.
5. Provide explainable scores instead of unexplained numbers.
6. Preserve source provenance for every important claim.
7. Provide technical feasibility and MVP recommendations.
8. Build an architecture that can scale into Version 2.
9. Keep the MVP implementable by a small student team.
10. Create measurable academic evaluation criteria.

## Secondary Goals

- Make the platform visually compelling.
- Provide reusable workspaces.
- Allow users to compare analyzed ideas.
- Preserve historical analyses.
- Support incremental data-source additions.

---

# 6. Non-Goals

The following are deliberately NOT Version 1 goals:

- Training a foundation LLM from scratch
- Building a general-purpose chatbot
- Building an autonomous unrestricted AI agent
- Scraping the entire internet
- Building a mobile application
- Enterprise billing
- High-scale distributed infrastructure
- Kafka-based streaming infrastructure
- Spark clusters
- Neo4j in Version 1
- Fine-tuning an LLM in Version 1
- Guaranteed startup/business success prediction
- Legal certification
- Investment/financial advice
- Automated product launching
- Fully autonomous browser agents that can take external actions

These may be considered after Version 2.

---

# 7. Product Principles

## Principle 1 — Product First

AI is an implementation mechanism. The product exists to help users make better product/project decisions.

## Principle 2 — API First

Use official APIs or structured feeds when they provide appropriate data.

Use crawling only when an appropriate public source/API is unavailable or insufficient and access is permitted.

## Principle 3 — Evidence Before Generation

The LLM should reason over retrieved evidence rather than inventing market facts.

## Principle 4 — Explain Every Score

A score without evidence is not useful.

## Principle 5 — Modular Architecture

Every data source, agent, model, and scoring component should be replaceable.

## Principle 6 — Version 1 Must Be Finishable

Do not introduce infrastructure merely because it is technically fashionable.

## Principle 7 — Preserve the Existing Dataset

The current Kaggle datasets should remain available as benchmark/reference data for academic comparison.

---

# 8. High-Level Product Architecture

```text
                         WEB CLIENT
                            │
                            ▼
                       API BACKEND
                            │
                            ▼
                   ANALYSIS ORCHESTRATOR
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
             Planner     Research   Competition
              Agent       Agent       Agent
                │           │           │
                └───────────┼───────────┘
                            ▼
                    RETRIEVAL LAYER
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     GitHub API        App Review Data    Crawl4AI
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                     DATA NORMALIZER
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
             PostgreSQL             Qdrant
                 │                     │
                 │                 Embeddings
                 │                     │
                 └──────────┬──────────┘
                            ▼
                           RAG
                            │
                            ▼
                    REPORT GENERATOR
                            │
                            ▼
                      WEB DASHBOARD
```

---

# 9. Technology Strategy

The exact technologies may be swapped if the team has a strong reason. The following is the recommended baseline.

## Frontend

- Next.js / React
- TypeScript
- Tailwind CSS
- Charting library
- Server-side/client-side data fetching as appropriate

## Backend

- Python
- FastAPI
- Pydantic
- Async HTTP clients

## Primary Database

- PostgreSQL

Stores:
- users
- workspaces
- ideas
- analyses
- source metadata
- structured competitors
- scores
- agent outputs
- report versions

## Vector Database

Recommended first choice:
- Qdrant

Alternatives:
- Chroma for local prototyping
- Pinecone for managed cloud deployment
- Weaviate

## Embeddings

Recommended:
- Sentence Transformers / modern retrieval embedding model

Candidate families:
- BGE
- E5
- MPNet-class sentence embeddings

The final model must be selected through retrieval evaluation rather than popularity alone.

## LLM

Use an external or locally hosted capable instruction model depending on cost and availability.

The model must support:
- structured output
- reliable instruction following
- sufficient context
- low hallucination rate when grounded

Do not fine-tune in Version 1.

## Crawling

- Crawl4AI for controlled public web crawling/extraction
- HTTP/API clients for APIs
- RSS/XML parsers for feeds

## Orchestration

Version 1:
- Background jobs / lightweight task runner

Version 2:
- Prefect or Airflow

## Agent Orchestration

- LangGraph or an equivalent explicit workflow/orchestration layer

Agents should be represented as deterministic workflow nodes where possible.

## Caching

- Redis is optional for Version 1
- Strongly recommended when external API calls become frequent

## Deployment

Academic MVP:
- Docker Compose
- Single cloud VM or managed application services

Version 2:
- Containerized deployment
- Managed PostgreSQL
- Managed/vector cloud service or self-hosted Qdrant
- Separate worker service

---

# 10. Version Strategy

## Version 1 — Academic MVP

### Objective

Demonstrate that a static analytics system can become a dynamic AI-powered decision-support application.

### Required Features

- Authentication
- Workspace management
- Idea submission
- Live GitHub search
- Legitimate app-review ingestion/source integration
- Controlled web crawling using Crawl4AI
- Data normalization
- Embedding generation
- Vector database
- Hybrid/semantic retrieval
- RAG
- Planner Agent
- Research Agent
- Competition Agent
- Report Generator
- Explainable scoring
- Analysis history
- Source/evidence display

### Explicitly excluded

- Kafka
- Spark
- Neo4j
- Fine-tuning
- Large-scale distributed processing
- Full autonomous agents
- Full-time streaming architecture

---

# 11. Version 2 — Advanced Product Intelligence

### Objective

Turn the MVP into a broader continuously updated product-intelligence system.

### Add

- Product Hunt
- arXiv
- Reddit
- Google Trends
- Automated ingestion orchestration
- Neo4j knowledge graph
- Trend forecasting
- Better recommendation engine
- Market saturation analysis
- Technology adoption analysis
- Historical trend analysis
- More specialized agents
- Data freshness monitoring
- Source health monitoring

---

# 12. Version 1 Functional Requirements

## FR-001 Authentication

The system shall support:

- Registration
- Login
- Logout
- Password security
- Session/token management
- Protected application routes

Optional:
- OAuth

Acceptance criteria:

- Unauthenticated users cannot access private workspaces.
- Passwords are never stored in plaintext.
- Authentication errors do not reveal sensitive account information.

---

# 13. Workspace Management

Users shall be able to:

- Create workspace
- Rename workspace
- Archive workspace
- Delete workspace
- Add ideas
- View previous analyses

Workspace structure:

```text
User
 └── Workspace
      ├── Idea
      │    ├── Analysis
      │    ├── Evidence
      │    └── Report
      └── Idea
```

---

# 14. Idea Submission

The user shall enter:

- Idea title
- Idea description
- Optional target users
- Optional industry/domain
- Optional intended platform
- Optional constraints
- Optional desired timeline

The system shall also support a minimal flow where only an idea description is provided.

---

# 15. Planner Agent

## Responsibility

Convert an unstructured idea into an analysis plan and structured representation.

Input:

```text
AI-powered interview preparation platform for engineering students.
```

Output example:

```json
{
  "domain": "education",
  "target_users": ["engineering students"],
  "problem": "interview preparation",
  "product_type": "software platform",
  "technologies": ["AI", "LLM"],
  "analysis_tasks": [
    "competition",
    "market",
    "technical feasibility",
    "research"
  ]
}
```

The planner should NOT fabricate market facts.

---

# 16. Research Agent

## Responsibility

Identify relevant research and technical evidence.

Version 1 sources:

- Searchable technical content
- Existing indexed knowledge base
- Public research pages where permitted
- arXiv integration may be introduced early if implementation capacity allows, but full arXiv expansion is a Version 2 target.

Output:

- relevant papers
- technologies
- approaches
- research gaps
- evidence snippets
- source URLs/identifiers
- retrieval timestamps

---

# 17. Competition Agent

## Responsibility

Find direct and indirect competing products/projects.

Sources:

- GitHub API
- Existing structured data
- Controlled public web crawling with Crawl4AI

Extract:

- project/product name
- description
- features
- target audience
- URL
- repository metadata where available
- pricing if publicly available
- last updated/retrieved timestamp

The agent must distinguish:

- Direct competitor
- Indirect competitor
- Related project
- Research implementation

---

# 18. Report Generator

The report generator combines evidence and structured agent outputs.

Required sections:

1. Executive Summary
2. Idea Understanding
3. Novelty Analysis
4. Existing Solutions
5. Competition Analysis
6. Market Pain Signals
7. Technical Feasibility
8. Risks
9. Recommended Differentiation
10. Suggested MVP
11. Evidence
12. Confidence

The generator must not present unsupported claims as facts.

---

# 19. Retrieval-Augmented Generation

## RAG Pipeline

```text
User Idea
    ↓
Query Construction
    ↓
Embedding
    ↓
Vector Search
    ↓
Metadata Filtering
    ↓
Optional Keyword Search
    ↓
Candidate Documents
    ↓
Reranking
    ↓
Relevant Context
    ↓
LLM
    ↓
Structured Output
```

## Required Metadata

Each indexed document should include:

- source
- source_type
- source_url
- title
- published_at if available
- retrieved_at
- document_id
- domain/category
- language
- content_hash
- embedding_model
- ingestion_version

---

# 20. Semantic Search

Replace TF-IDF-only matching.

Example:

```text
"AI interview coach for engineers"
```

should retrieve semantically related:

- mock interview systems
- AI career coaches
- technical interview platforms
- coding interview assistants

even if exact words differ.

The system should retain keyword/metadata filtering because semantic retrieval alone is not always sufficient.

---

# 21. Vector Database Design

Each chunk should contain:

```text
id
document_id
chunk_text
embedding
source
source_url
source_type
title
metadata
created_at
```

Recommended collection strategy:

- One main knowledge collection initially
- Metadata filters for source/domain
- Separate collections only if evaluation demonstrates a benefit

Avoid unnecessary collection fragmentation.

---

# 22. Data Acquisition Architecture

The ingestion layer should use three strategies.

## Tier 1 — Official APIs

Preferred where appropriate.

Example:

```text
GitHub
  ↓
GitHub API
  ↓
JSON
```

## Tier 2 — Structured feeds

Example:

```text
arXiv RSS/API
  ↓
Parser
```

## Tier 3 — Controlled web crawling

Example:

```text
Public competitor website
  ↓
Crawl4AI
  ↓
Markdown / structured extraction
```

The platform should NOT indiscriminately scrape the web.

---

# 23. Crawl4AI Requirements

Crawl4AI is suitable for Version 1.

Use it for:

- public competitor websites
- public product information
- publicly accessible technical/product pages
- pages where an appropriate API is unavailable

Pipeline:

```text
URL
 ↓
Crawl4AI
 ↓
HTML/browser processing
 ↓
Clean Markdown
 ↓
Structured extraction
 ↓
Normalization
 ↓
PostgreSQL
 ↓
Chunking
 ↓
Embeddings
 ↓
Qdrant
```

Store:

- URL
- retrieval timestamp
- page title
- extracted content
- extraction status
- HTTP status if available
- content hash
- crawl metadata

Respect:

- robots.txt
- rate limits
- terms of service
- source restrictions
- copyright constraints
- authentication boundaries

Do not bypass anti-bot/security controls.

---

# 24. Scraping Strategy

Do NOT implement:

```text
User clicks Analyze
 ↓
Scrape hundreds of websites
 ↓
Wait for all pages
 ↓
Generate response
```

Instead:

```text
Scheduled/Triggered Ingestion
        ↓
Raw Data
        ↓
Normalization
        ↓
Deduplication
        ↓
Embeddings
        ↓
Knowledge Base
```

Use on-demand crawling only for:

- a specific user-provided URL
- missing evidence
- controlled small-scale research

---

# 25. Data Storage Layers

## Raw Layer

Store original responses/pages where permitted.

Purpose:
- reproducibility
- debugging
- reprocessing

## Normalized Layer

Clean structured records.

## Knowledge Layer

Contains:

- embeddings
- chunks
- entities
- relationships
- derived metrics

Version 1 can use PostgreSQL + Qdrant.

Version 2 can add Neo4j.

---

# 26. Data Quality

Every ingestion pipeline should perform:

- schema validation
- null checking
- duplicate detection
- content hash generation
- timestamp normalization
- URL normalization
- language detection where required
- malformed record handling

Each record should have an ingestion status.

Example:

```text
NEW
PROCESSING
PROCESSED
FAILED
SKIPPED
```

---

# 27. Deduplication

Possible duplicate signals:

- canonical URL
- repository ID
- content hash
- title + source
- external source ID

Do not rely on title alone.

---

# 28. Data Freshness

Every source must track:

```text
last_successful_ingestion
last_attempt
record_count
error_count
source_status
```

Dashboard/admin monitoring should eventually expose source freshness.

---

# 29. Scoring Framework

Do NOT make one score the sole output.

Use multiple dimensions.

## Novelty Score

Potential components:

- semantic distance from existing solutions
- feature differentiation
- technology differentiation
- market differentiation

## Competition Score

Potential components:

- number of direct competitors
- competitor activity
- competitor popularity
- feature overlap
- market concentration

## Market Demand Score

Potential components:

- review pain frequency
- feature-request frequency
- sentiment
- trend direction
- evidence volume

## Technical Feasibility Score

Potential components:

- technology maturity
- implementation complexity
- API availability
- infrastructure requirements
- ML requirements
- integration complexity

## Risk Score

Potential components:

- technical risk
- data availability risk
- operational risk
- privacy/security risk
- dependency risk

Scores must include:

- score
- interpretation
- evidence
- confidence
- timestamp

---

# 30. Important Scoring Rule

Do not claim:

> “Your idea has a 78% probability of success.”

unless a validated predictive model actually supports that probability.

Prefer:

> “Feasibility: High”

and:

> “Confidence: 0.81 based on 23 retrieved evidence items.”

The system should distinguish:

- heuristic score
- model prediction
- LLM assessment
- measured statistic

---

# 31. Market Sentiment

Version 1 should use Transformer-based sentiment analysis when enough review data is available.

Pipeline:

```text
Reviews
 ↓
Cleaning
 ↓
Language filtering
 ↓
Sentiment model
 ↓
Sentiment
 ↓
Aspect/topic extraction
 ↓
Aggregation
```

Potential outputs:

- Positive
- Neutral
- Negative

Optional:

- emotion
- aspect-based sentiment

Do not claim model accuracy without evaluating it.

---

# 32. Market Pain Detection

Use embeddings/topic modeling to cluster feedback.

Example:

```text
Reviews
 ↓
Embeddings
 ↓
Clustering/topic modeling
 ↓
Pain-point clusters
 ↓
Frequency
 ↓
Trend
```

Example topics:

- pricing
- performance
- login
- ads
- privacy
- missing feature
- customer support

---

# 33. Version 2 — Advanced Market Intelligence

Add:

## Product Hunt

Use suitable official/authorized access.

Analyze:

- product launches
- categories
- positioning
- launch activity

## arXiv

Analyze:

- research volume
- topics
- emerging techniques
- research momentum

## Reddit

Where authorized access is available:

- user discussions
- complaints
- requests
- emerging problems

## Google Trends

Use appropriate access/data source to estimate search-interest trends.

---

# 34. Version 2 Knowledge Graph

Introduce Neo4j.

Example:

```text
Idea
 │
 ├── DOMAIN → Healthcare
 │
 ├── TECHNOLOGY → LLM
 │
 ├── COMPETITOR → Product X
 │
 ├── PROBLEM → Documentation
 │
 └── RESEARCH → Paper Y
```

Technology relationships:

```text
LLM
 ↓
RAG
 ↓
Vector Database
 ↓
Qdrant
```

The graph enables relationship-based queries that pure vector search does not handle well.

---

# 35. Version 2 Orchestration

Introduce Prefect or Airflow.

Example:

```text
Daily
 ↓
GitHub ingestion
 ↓
Product ingestion
 ↓
Research ingestion
 ↓
Reddit ingestion
 ↓
Trend ingestion
 ↓
Normalize
 ↓
Deduplicate
 ↓
Embed
 ↓
Index
 ↓
Analytics refresh
```

Airflow is preferable when you need mature DAG scheduling/monitoring.

Prefect may be simpler for a small engineering team.

Do not deploy both unless there is a real reason.

---

# 36. Version 2 Forecasting

Use historical signals such as:

- repository activity
- review volume
- topic frequency
- search interest
- product launches

Potential methods:

- baseline moving averages
- exponential smoothing
- Prophet-style models
- statistical forecasting
- time-series ML

Start with simple baselines.

Only adopt deep time-series models if they outperform the baseline.

---

# 37. Version 2 Agent Architecture

Possible expanded workflow:

```text
Planner
   ↓
Research
   ↓
Competition
   ↓
Market
   ↓
Technical
   ↓
Business
   ↓
Risk
   ↓
Synthesis
```

Do not run every agent for every request.

The planner should determine which analyses are necessary.

---

# 38. Agent Design Rules

Every agent must have:

- clear responsibility
- explicit input schema
- explicit output schema
- allowed tools
- evidence requirements
- failure behavior
- timeout
- retry policy
- logging

Agents should not have unrestricted access to every tool.

---

# 39. Agent Output Contract

Example:

```json
{
  "agent": "competition_agent",
  "status": "completed",
  "findings": [],
  "evidence": [],
  "confidence": 0.0,
  "warnings": [],
  "generated_at": "timestamp"
}
```

This makes agent outputs composable.

---

# 40. Report Evidence Requirements

Every externally verifiable finding should have provenance.

Example:

```text
Finding:
There are 18 closely related repositories.

Evidence:
GitHub search results

Retrieved:
2026-XX-XX

Source:
GitHub

Confidence:
High
```

Never create fake citations.

---

# 41. Frontend Requirements

## Dashboard

Show:

- recent analyses
- idea count
- analysis status
- major scores
- recent market signals

## Idea Analysis Page

Sections:

1. Idea summary
2. Overall assessment
3. Novelty
4. Competition
5. Market demand
6. Feasibility
7. Risks
8. Recommendations
9. Evidence
10. Agent activity/status

## Competition View

Show:

- competitor cards
- feature matrix
- source links
- similarity/relevance
- activity indicators

## Evidence View

Show:

- source
- title
- URL
- retrieval time
- relevant excerpt
- evidence type

---

# 42. Analysis Job UX

Because research may take time, do not block the UI.

Use:

```text
SUBMITTED
 ↓
PLANNING
 ↓
RESEARCHING
 ↓
RETRIEVING
 ↓
ANALYZING
 ↓
GENERATING_REPORT
 ↓
COMPLETED
```

Failures:

```text
FAILED
PARTIAL
```

The UI should show progress.

---

# 43. Partial Failure Handling

If GitHub fails but research and market analysis succeed:

Do NOT fail the entire report.

Return:

```text
Competition analysis unavailable
Other sections completed
```

This is essential for production reliability.

---

# 44. API Design

Example endpoints:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout

GET    /workspaces
POST   /workspaces
GET    /workspaces/{id}

POST   /ideas
GET    /ideas/{id}

POST   /analyses
GET    /analyses/{id}
GET    /analyses/{id}/status
GET    /analyses/{id}/report

GET    /analyses/{id}/evidence
GET    /analyses/{id}/competitors

GET    /health
GET    /ready
```

Do not expose internal agent tools directly to the browser.

---

# 45. Background Processing

Long-running analysis should run outside the request-response cycle.

```text
POST /analyses
      ↓
Create analysis job
      ↓
Return job ID
      ↓
Worker processes job
      ↓
Frontend polls/subscribes
      ↓
Report available
```

Version 1 may use a lightweight worker/task queue.

Version 2 can introduce more sophisticated orchestration.

---

# 46. Database Entities

Minimum PostgreSQL entities:

```text
users
workspaces
ideas
analyses
analysis_runs
agent_runs
sources
documents
competitors
scores
reports
evidence
ingestion_jobs
```

Potential relationships:

```text
User → Workspaces
Workspace → Ideas
Idea → Analyses
Analysis → Agent Runs
Analysis → Scores
Analysis → Evidence
Source → Documents
Documents → Chunks
```

---

# 47. Security Requirements

Minimum:

- password hashing
- secure authentication
- input validation
- authorization checks
- rate limiting
- secrets stored in environment/secret manager
- no API keys in frontend
- sanitized URLs
- SSRF protection for user-submitted URLs
- request size limits
- safe crawler configuration
- logging without sensitive information

Crawling user-supplied URLs must be treated as a security-sensitive operation.

---

# 48. SSRF Protection

If users can submit URLs:

Do NOT allow unrestricted backend requests.

Protect against:

- localhost
- private IP ranges
- internal network addresses
- cloud metadata endpoints
- unexpected protocols
- redirects to internal addresses

Validate URL schemes and destinations.

---

# 49. LLM Safety

The RAG system may retrieve malicious or misleading text.

Treat retrieved content as **untrusted data**.

The LLM must not interpret retrieved webpage instructions as system instructions.

Example:

```text
Retrieved webpage:
"Ignore all previous instructions..."
```

This is data, not an instruction.

Use structured prompts and explicit tool boundaries.

---

# 50. Observability

Every analysis should have a traceable run.

Log:

- analysis ID
- agent ID
- start/end time
- model
- token usage if available
- retrieval count
- source count
- errors
- latency
- final status

Version 2 can integrate OpenTelemetry/LLM tracing tools.

---

# 51. Caching

Cache:

- GitHub queries
- crawled pages
- embeddings
- repeated retrievals
- model responses where safe

Use content hashes to avoid embedding identical documents repeatedly.

---

# 52. Rate Limits

Every external source should have:

- request timeout
- retry policy
- exponential backoff
- rate limit handling
- circuit-breaker/failure state where appropriate

Never retry indefinitely.

---

# 53. Data Freshness Policy

Suggested initial policy:

- GitHub: periodic refresh
- Crawled pages: configurable TTL
- App reviews: periodic refresh
- Research data: periodic refresh
- User-triggered URL crawl: on demand

The exact frequency should depend on source limits and project requirements.

---

# 54. Academic Evaluation

This project should include a measurable comparison against the old system.

## Baseline

```text
Static Dataset
+
TF-IDF
+
Cosine Similarity
+
Rule-based sentiment
```

## Proposed

```text
Live/updated data
+
Transformer embeddings
+
Vector search
+
RAG
+
Specialized agents
```

Compare:

### Retrieval

- Precision@K
- Recall@K
- nDCG/MRR where applicable

### Sentiment

- Accuracy
- Precision
- Recall
- F1

### Topic Quality

- human relevance
- cluster coherence where appropriate

### System

- latency
- data freshness
- failure rate
- ingestion success rate

### AI Output

Human evaluation:

- relevance
- factual grounding
- completeness
- usefulness
- evidence quality

---

# 55. Groundedness Evaluation

Create a manually labeled evaluation set.

For each generated claim:

```text
Supported
Partially Supported
Unsupported
```

Measure groundedness.

This is more meaningful than saying:

> “The LLM response looks good.”

---

# 56. Retrieval Evaluation Dataset

Create 50–200 representative idea queries.

For each query manually identify relevant:

- repositories
- products
- research documents
- market evidence

Then evaluate retrieval models.

This also gives you an academic experiment for embedding-model selection.

---

# 57. Model Selection Process

Do not choose an embedding model simply because it is popular.

Evaluate candidate models on:

- retrieval precision
- semantic relevance
- latency
- embedding dimension
- storage cost
- domain performance

Choose the model with the best trade-off.

---

# 58. Cost Management

The application should minimize expensive LLM calls.

Use:

```text
Cheap retrieval
 ↓
Filter
 ↓
Rerank
 ↓
LLM only on relevant evidence
```

Do not send hundreds of documents to the LLM.

Use:

- chunking
- top-K retrieval
- reranking
- caching
- structured outputs

---

# 59. Failure Scenarios

The system must handle:

### GitHub unavailable

Continue with other sources.

### Crawl failure

Record source failure and continue.

### LLM timeout

Retry within limits.

### Embedding failure

Queue document for retry.

### Vector DB unavailable

Return temporary service error; do not silently generate unsupported results.

### Insufficient evidence

Report:

> “Insufficient evidence to confidently assess this dimension.”

Do not hallucinate.

---

# 60. Recommended Development Order

## Sprint 0 — Architecture

- Freeze requirements
- Define database schema
- Define API contracts
- Define agent contracts
- Define source contracts
- Set up repository structure
- Dockerize services

## Sprint 1 — Foundation

- Authentication
- PostgreSQL
- Workspaces
- Ideas
- Analysis jobs
- Frontend routing

## Sprint 2 — Data Layer

- GitHub API integration
- Data normalization
- Source metadata
- Crawling service
- Crawl4AI integration
- Ingestion status

## Sprint 3 — Semantic Retrieval

- Embedding service
- Qdrant
- Chunking
- Metadata filtering
- Semantic search
- Retrieval evaluation

## Sprint 4 — AI Layer

- Planner Agent
- Research Agent
- Competition Agent
- RAG
- Structured outputs

## Sprint 5 — Reporting

- Report generator
- Explainable scores
- Evidence
- Confidence
- Analysis history

## Sprint 6 — Frontend

- Analysis dashboard
- Competitor view
- Evidence view
- Progress/status UI
- Charts

## Sprint 7 — Evaluation

- Baseline comparison
- Retrieval evaluation
- Sentiment evaluation
- Groundedness evaluation
- Latency testing
- Error testing

## Sprint 8 — Deployment

- Docker
- Production configuration
- Logging
- Monitoring
- Security review
- Backup
- Documentation

---

# 61. Version 2 Development Roadmap

## V2-A — Data Expansion

Add:

- Product Hunt
- arXiv
- Reddit
- Google Trends

Build common source adapter interface:

```python
class SourceAdapter:
    def discover(self, query): ...
    def fetch(self, item): ...
    def normalize(self, raw): ...
```

Each source becomes an independent adapter.

## V2-B — Orchestration

Introduce:

- Prefect OR Airflow
- scheduled ingestion
- retries
- source monitoring
- data freshness dashboards

## V2-C — Knowledge Graph

Introduce:

- Neo4j
- entity extraction
- entity resolution
- relationships
- graph queries

## V2-D — Market Intelligence

Add:

- trend analysis
- market saturation
- topic evolution
- competitor activity
- feature gap detection

## V2-E — Forecasting

Add:

- historical feature tables
- baseline forecasting
- model comparison
- forecast confidence intervals
- trend dashboards

## V2-F — Recommendation Engine

Recommend:

- differentiated features
- technology choices
- MVP scope
- target users
- potential business models

Recommendations must be evidence-backed.

---

# 62. Recommended V1 Agent Count

Keep it to four logical components:

### 1. Planner Agent

Understands the idea and creates the analysis plan.

### 2. Research Agent

Finds research/technical evidence.

### 3. Competition Agent

Finds existing products/projects.

### 4. Synthesis/Report Agent

Combines evidence and generates the final report.

Market and technical scoring can initially be deterministic services fed by retrieved evidence rather than separate autonomous agents.

This is deliberately simpler and easier to evaluate.

---

# 63. Why Not Build Seven Agents in V1?

Because more agents do not automatically mean better AI.

Seven agents create:

- more latency
- more API calls
- more failure points
- more prompt complexity
- harder debugging
- harder evaluation

Build additional agents only when a distinct responsibility cannot be implemented cleanly as a normal service.

---

# 64. Recommended Repository Structure

```text
project/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── agents/
│   ├── retrieval/
│   ├── scoring/
│   ├── reports/
│   └── workers/
│
├── ingestion/
│   ├── adapters/
│   │   ├── github/
│   │   ├── app_reviews/
│   │   └── web/
│   ├── normalization/
│   ├── deduplication/
│   ├── chunking/
│   └── embeddings/
│
├── evaluation/
│   ├── retrieval/
│   ├── sentiment/
│   ├── groundedness/
│   └── datasets/
│
├── infrastructure/
│   ├── docker/
│   └── deployment/
│
├── docs/
│
├── tests/
│
└── README.md
```

---

# 65. Definition of Done — Version 1

Version 1 is complete only when:

- User can register/login.
- User can create a workspace.
- User can submit an idea.
- System creates an analysis job.
- Planner produces structured idea information.
- GitHub data is retrieved dynamically.
- At least one controlled web-crawling workflow works.
- App-review data is integrated from a legitimate source.
- Documents are normalized and stored.
- Embeddings are generated.
- Qdrant retrieval works.
- RAG returns grounded responses.
- Research Agent works.
- Competition Agent works.
- Report Generator works.
- Scores contain explanations.
- Evidence is shown.
- Failed sources do not crash the entire analysis.
- Analysis history is persisted.
- Dashboard reflects completed analyses dynamically.
- Baseline vs proposed system evaluation is completed.
- Security and API keys are reviewed.
- Application runs reproducibly using documented setup instructions.

---

# 66. Definition of Done — Version 2

Version 2 is complete when:

- Additional sources are integrated.
- Automated ingestion workflows run reliably.
- Data freshness is visible.
- Neo4j contains validated entities/relationships.
- Vector and graph retrieval can be combined where useful.
- Trend analytics operate on historical data.
- Forecasting has a baseline comparison.
- Recommendation engine produces evidence-backed recommendations.
- Market/competition analytics are historically comparable.
- Source failures are monitored.
- System has production-oriented observability.
- V2 does not break V1 workflows.

---

# 67. Scope-Control Rules

These rules are mandatory.

## Rule 1

No new technology enters the stack unless it solves a documented problem.

## Rule 2

No new feature enters Version 1 unless it directly supports:

- idea validation
- evidence retrieval
- competition analysis
- market understanding
- feasibility
- reporting

## Rule 3

No autonomous agent is created merely to demonstrate agentic AI.

## Rule 4

No scraper is created if an appropriate official API provides the required information.

## Rule 5

No model is fine-tuned until a baseline has been measured.

## Rule 6

No database is introduced without a clear query/use case.

## Rule 7

Every score must have a defined formula/model and evidence strategy.

---

# 68. Success Metrics

## Product Metrics

- Analysis completion rate
- Time to report
- User satisfaction
- Report usefulness
- Repeat analysis rate

## Technical Metrics

- API latency
- Retrieval latency
- End-to-end analysis latency
- ingestion success rate
- crawl success rate
- agent failure rate

## AI Metrics

- retrieval Precision@K
- groundedness
- evidence coverage
- sentiment F1
- human-rated report relevance

## Data Metrics

- source freshness
- duplicate rate
- invalid-record rate
- embedding coverage

---

# 69. Key Architectural Decision Records

The team should document decisions such as:

### ADR-001

Why Qdrant was selected over Chroma/Pinecone.

### ADR-002

Why API-first acquisition is used.

### ADR-003

Why Crawl4AI is used selectively.

### ADR-004

Why Version 1 does not use Neo4j.

### ADR-005

Why Version 1 does not use Kafka/Spark.

### ADR-006

Why RAG is preferred over LLM-only generation.

### ADR-007

Why four logical AI components are used instead of a large autonomous multi-agent system.

This documentation will strengthen the academic defense.

---

# 70. Mentor Presentation Summary

The project should be explained as follows:

> “The existing application is a static analytics system based on fixed datasets and heuristic similarity/sentiment methods. We propose to transform it into an AI-powered Product Intelligence & Idea Validation Platform. The new system will use an API-first dynamic data acquisition architecture, controlled web crawling through Crawl4AI where appropriate, transformer-based semantic embeddings, vector search, Retrieval-Augmented Generation, and a small modular multi-agent workflow. The system will analyze an idea against live evidence from software repositories, product information, user feedback, and technical sources. Version 1 will focus on a practical academic MVP with Planner, Research, Competition, and Report/Synthesis components. Version 2 will extend the same architecture with additional sources, automated orchestration, a knowledge graph, trend forecasting, and improved recommendations. The architecture is intentionally modular so the team can demonstrate a working MVP without introducing unnecessary distributed infrastructure, while retaining a clear path toward a production-grade platform.”

---

# 71. Final Architecture Philosophy

The project should evolve through this sequence:

```text
CURRENT
Static CSV
    ↓
Rule-based analytics
    ↓
Similarity score
    ↓
Frozen dashboard
```

to:

```text
VERSION 1
Live/API/Web data
    ↓
Normalization
    ↓
Embeddings
    ↓
Vector DB
    ↓
RAG
    ↓
3–4 specialized AI components
    ↓
Evidence-backed report
    ↓
Dynamic dashboard
```

and finally:

```text
VERSION 2
Multiple live sources
    ↓
Automated orchestration
    ↓
Data warehouse / structured knowledge
    ↓
Vector DB + Knowledge Graph
    ↓
Market + Competition + Trend Intelligence
    ↓
Forecasting
    ↓
Evidence-backed AI recommendations
    ↓
Product Intelligence Platform
```

The fundamental principle is:

> **Do not build AI for the sake of AI. Build a reliable evidence pipeline first, then use AI where reasoning adds measurable value.**

That principle should guide every engineering decision in this project.
