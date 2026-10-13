# DIME – Data-Driven Idea & Market Evaluation Platform

<div align="center">

![DIME Banner](https://img.shields.io/badge/DIME-AI%20Product%20Intelligence-blue?style=for-the-badge&logo=rocket)

**Autonomous Multi-Agent Idea Validation, Deep Market Intelligence & Feasibility Analysis Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2.60-orange?style=flat-square&logo=langchain)](https://langchain-ai.github.io/langgraph/)
[![Qdrant](https://img.shields.io/badge/Qdrant-v1.12-red?style=flat-square&logo=qdrant)](https://qdrant.tech/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*Validate your software concepts against real codebases, academic literature, customer review datasets, and competitor clusters before writing a single line of code.*

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Multi-Agent Pipeline](#-multi-agent-pipeline-langgraph) • [Scoring Engine](#-deterministic-scoring-engine) • [Quick Start](#-quick-start) • [API Reference](#-api-reference)

</div>

---

## 📌 Overview

**DIME (Data-Driven Idea & Market Evaluation Platform)** is an enterprise-grade AI product intelligence system. It helps founders, software engineers, and product teams systematically validate startup and project ideas using empirical data.

Most software products fail not because of flawed technical execution, but because the underlying idea was never validated against market realities:
- ❌ **Blind Development:** Commencing engineering without verifying whether target users experience real, acute pain.
- ❌ **Competitor Blindspots:** Entering saturated spaces without differentiating value propositions.
- ❌ **Overestimated Feasibility:** Underestimating technical, team, regulatory, and capital requirements.
- ❌ **Unsubstantiated Claims:** Relying on gut feelings rather than empirical research and market signals.

**DIME solves this** by executing an automated, multi-agent research workflow that crawls GitHub repositories, parses academic papers, interrogates consumer complaint datasets, computes deterministic multi-pillar scores, and generates an executive PDF dossier with real-time streaming progress.

---

## ✨ Key Features

### 1. 🎯 Structured Idea Intake & Exploration
- Detailed intake capturing title, description, domain, target audience, tech stack familiarity, team size, and timeline.
- Real-time pre-validation checks and character constraints ensuring high-fidelity agent inputs.

### 2. 🤖 Autonomous Multi-Agent Research System (LangGraph)
- **12-Stage State Graph Pipeline:** Orchestrated sequentially and conditionally with structured error handling.
- **Decomposed Query Planning:** Automatically splits ideas into targeted keyword and semantic query permutations.
- **Evidence Cross-Verification:** Gathers and cross-references findings from open-source repositories, academic databases, and live web domains.

### 3. 🌐 Multi-Source Data Acquisition Layer
- **GitHub REST Integration:** Concurrent query dispatching, ETag conditional caching, topic/stargazer analysis, and automated README extraction.
- **Academic Research Integration:** Unified retrieval across **Semantic Scholar** (citation graphs & AI papers), **Crossref** (polite pool publication metadata), and **IEEE Xplore** (technical specifications & engineering papers).
- **Crawl4AI Web Acquisition:** Controlled live web crawler with hardened SSRF defenses, private IP blacklisting, DNS rebinding guards, and cached `robots.txt` compliance.

### 4. 📊 6-Dimensional Deterministic Scoring Engine
DIME replaces vague LLM summaries with calibrated, deterministic mathematical formulas:
- **Novelty Score:** Semantic distance from incumbent repositories using dense vector embeddings in Qdrant.
- **Market Saturation Score:** Incumbent density across categories, normalized on a logarithmic scale.
- **Market Pain Score:** Negative sentiment density and unmet complaint clustering from real app store reviews.
- **Feasibility Score:** Multi-pillar evaluation (Technology Readiness: 35%, Team Capacity: 25%, Capital Requirements: 20%, Legal/Compliance: 20%).
- **Opportunity Score:** Whitespace indicator combining high unaddressed market pain with high novelty.
- **Composite Risk Score:** Weighted formula categorizing projects into *Low*, *Moderate*, *High*, or *Critical* risk.

### 5. ⚡ Real-Time SSE Agent Streaming
- Live Server-Sent Events (`/api/v1/analyses/{id}/events`) push step-by-step agent thoughts, progress percentages, active tools, and ingestion events to the Next.js UI in real-time.

### 6. 📈 Interactive Analytics & Dashboards
- **Executive Dashboard:** KPI metric cards, market signals, activity tracking, and recent analysis feeds.
- **Opportunity Matrix:** Interactive scatter/bubble chart mapping Feasibility vs. Market Impact with category filters.
- **Visual Analytics:** Market demand growth lines, competitor density bar charts, and 4-axis feasibility radar charts powered by Recharts.
- **Idea Workspace & Notes:** Kanban board tracking ideas from *Draft* to *Validated*, with sticky-note tagging.

### 7. 📑 One-Click Executive PDF Export
- Server-side branded PDF dossier generation using `pdf-lib`, detailing overall viability, radar metrics, evidence citations, competitor landscapes, and actionable next steps.

---

## 🏛️ System Architecture

DIME is architected as a high-performance decoupled system: a reactive **Next.js 16** web application coupled with an asynchronous **Python 3.12 (FastAPI + LangGraph)** intelligence backend, backed by **Qdrant** for vector search, **Redis** for pub/sub & caching, and **PostgreSQL** for relational persistence.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION LAYER                              │
│       Next.js 16 (App Router) • React 19 • Tailwind CSS v4 • Recharts       │
│        NextAuth v5 • Firebase Auth • Framer Motion • Lucide Icons           │
└───────────────────────┬─────────────────────────────▲───────────────────────┘
                        │ HTTP / JSON                 │ Server-Sent Events (SSE)
                        ▼                             │ (Live Execution Logs)
┌─────────────────────────────────────────────────────┴───────────────────────┐
│                               API GATEWAY                                   │
│            FastAPI (Python 3.12) • Pydantic v2 • Uvicorn ASGI               │
│                  Endpoints: /api/v1/analyses, /events, /report              │
└──────────┬──────────────────────────┬───────────────────────────┬───────────┘
           │                          │                           │
           ▼ Async Job Queue          ▼ Dense Vector Search       ▼ Fast Cache & Pub/Sub
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│    CELERY WORKER     │   │    QDRANT VECTOR     │   │      REDIS 7         │
│  Async Analysis Jobs │   │ SentenceTransformers │   │  SSE Event Pub/Sub   │
│  LangGraph Workflow  │   │ Dense Chunks Storage │   │  ETag / Crawl Cache  │
└──────────┬───────────┘   └──────────────────────┘   └──────────────────────┘
           │
           ├──────────────────────────────┬─────────────────────────────┐
           ▼                              ▼                             ▼
┌──────────────────────┐       ┌──────────────────────┐      ┌──────────────────────┐
│  GITHUB INTEGRATION  │       │  RESEARCH PROVIDERS  │      │  CRAWL4AI SCRAPER    │
│  Repos, Stars, Etags │       │  Semantic Scholar    │      │  SSRF Protection     │
│  Cached READMEs      │       │  Crossref / IEEE     │      │  Robots.txt Checked  │
└──────────────────────┘       └──────────────────────┘      └──────────────────────┘
           │
           ▼ Relational Persistence
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA STORAGE LAYER                                │
│       PostgreSQL 16 (Port 5433) • Prisma ORM (Frontend) • SQLAlchemy 2.0    │
│           Tables: Users, Ideas, Analyses, Scores, Evidence, Ingestions      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent Pipeline (LangGraph)

The core analytical pipeline is defined as a directed acyclic graph (DAG) in `backend/workflow/graph.py`. Each node is an autonomous agent or processing step with typed input/output states:

```mermaid
graph TD
    START([START]) --> Init[1. initialize_node]
    Init --> Understand[2. idea_understanding_node]
    Understand --> PlanQ[3. query_planning_node]
    PlanQ --> Acquire[4. acquire_evidence_node]
    Acquire --> Process[5. process_evidence_node]
    Process --> Planner[6. planner_node]
    Planner --> Research[7. research_node]
    Research --> Competition[8. competition_node]
    Competition --> Synthesis[9. synthesis_node]
    Synthesis --> Scoring[10. scoring_node]
    Scoring --> Complete[11. complete_analysis_node]
    Complete --> END([END])
    
    Init -. Error .-> Fail[fail_analysis_node]
    Understand -. Error .-> Fail
    PlanQ -. Error .-> Fail
    Acquire -. Error .-> Fail
    Process -. Error .-> Fail
    Planner -. Error .-> Fail
    Research -. Error .-> Fail
    Competition -. Error .-> Fail
    Synthesis -. Error .-> Fail
    Scoring -. Error .-> Fail
    Fail --> END
```

| # | Node Name | Agent Role / Responsibility |
|---|---|---|
| 1 | `initialize` | Validates idea payload, creates database records, establishes SSE channels |
| 2 | `idea_understanding` | Extracts problem statements, core mechanisms, target user personas, and domain tags |
| 3 | `query_planning` | Generates keyword & semantic queries tailored for code, literature, and web engines |
| 4 | `acquire_evidence` | Concurrently dispatches requests to GitHub, Semantic Scholar, Crossref, and IEEE |
| 5 | `process_evidence` | Normalizes incoming payloads to `SourceDocument`, performs chunking and deduplication |
| 6 | `planner` | Synthesizes acquired evidence and sets priority goals for downstream deep-dive agents |
| 7 | `research` | Evaluates academic literature, extracts state-of-the-art methodology, and measures technical depth |
| 8 | `competition` | Scrapes incumbent products, clusters competitors, identifies feature gaps and pricing models |
| 9 | `synthesis` | Merges multi-source evidence into structured findings with confidence weights |
| 10 | `scoring` | Executes the 6-pillar mathematical scoring engine via `ScoringEngine` |
| 11 | `complete` | Persists scores, findings, and evidence references to PostgreSQL; flags status as `COMPLETED` |

---

## 🧮 Deterministic Scoring Engine

DIME eliminates arbitrary LLM hallucinations by calculating scores mathematically from retrieved data:

### 1. Novelty Index ($0 - 100$)
Evaluates semantic divergence between the submitted concept and existing projects via dense embeddings:
$$\text{Novelty} = 100 - (\max(\text{Cosine Similarity}(\vec{v}_{\text{idea}}, \vec{v}_{\text{repos}})) \times 100)$$
*Higher score indicates lower direct competition in open-source and market indices.*

### 2. Market Saturation ($0 - 100$)
Measures competitor density within the selected industry category:
$$\text{Saturation} = \min\left(100, \; \ln(N_{\text{incumbents}} + 1) \times 18.5\right)$$
Categorized as: **Low** ($<30$), **Moderate** ($30-60$), **High** ($60-80$), or **Saturated** ($>80$).

### 3. Market Pain Score ($0 - 100$)
Calculated from negative review clusters ($1-2\star$ ratings) extracted from real app store datasets:
$$\text{Market Pain} = \left(\frac{\text{Unaddressed Pain Clusters}}{\text{Total Identified Pain Clusters}}\right) \times 100$$

### 4. Feasibility Score ($0 - 100$)
Evaluated across four weighted pillars:

| Pillar | Weight | Evaluation Method |
|---|---|---|
| **Technology Readiness** | **35%** | Stack complexity vs. self-reported team familiarity (Beginner: 40, Intermediate: 65, Advanced: 85) |
| **Team Capacity** | **25%** | Ratio of team size to estimated project scope and timeline |
| **Capital Requirements** | **20%** | Infrastructure and API cost model by domain (e.g., AI/ML vs. Web App) |
| **Legal & Compliance** | **20%** | Domain regulatory baseline (HealthTech/FinTech: high risk; DevTools: low risk) |

$$\text{Feasibility} = 0.35 T_{\text{readiness}} + 0.25 C_{\text{team}} + 0.20 K_{\text{capital}} + 0.20 L_{\text{legal}}$$

### 5. Opportunity Score ($0 - 100$)
Synthesizes whitespace potential by pairing high market pain with high product novelty:
$$\text{Opportunity} = (\text{Novelty} \times 0.5) + (\text{Market Pain} \times 0.5)$$

### 6. Composite Risk Indicator
Calculates cumulative venture exposure:
$$\text{Risk} = (\text{Saturation} \times 0.3) + ((100 - \text{Feasibility}) \times 0.4) + ((100 - \text{Novelty}) \times 0.3)$$

- **Low Risk:** $<25$
- **Moderate Risk:** $25 - 50$
- **High Risk:** $50 - 75$
- **Critical Risk:** $>75$

---

## 📁 Repository Structure

```
DIME-Sem5/
├── backend/                        # Python FastAPI Backend & AI Agents
│   ├── agents/                     # Specialized agent modules (research, competition, query_planner)
│   ├── api/v1/                     # REST API route handlers (analyses, health, router)
│   ├── core/                       # App settings, logging, async database session, cache manager
│   ├── ingestion/                  # Document parsing and schema normalization
│   ├── integrations/               # External source adapters
│   │   ├── github/                 # GitHub API client with ETag support & star rankers
│   │   ├── research/               # Semantic Scholar, Crossref, IEEE Xplore clients
│   │   └── web/                    # Crawl4AI web scraper with SSRF defenses & robots parser
│   ├── models/                     # SQLAlchemy 2.0 ORM models (Analysis, Score, Evidence, Finding)
│   ├── retrieval/                  # Dense vector retriever & Qdrant query interface
│   ├── schemas/                    # Pydantic v2 validation models
│   ├── scoring/                    # Deterministic scoring engine & algorithms
│   ├── worker/                     # Celery application & asynchronous worker tasks
│   ├── workflow/                   # LangGraph state machine (nodes, graph, state, events)
│   ├── main.py                     # FastAPI application factory & entry point
│   └── pyproject.toml              # Python dependencies & build definitions
├── datasets/                       # Benchmark & review datasets for market pain analysis
│   ├── foodpanda_cleaned.csv       # Food delivery review clusters
│   ├── grab_cleaned.csv            # Super-app mobility review clusters
│   ├── uber_cleaned.csv            # Ridesharing complaint datasets
│   ├── instagram_cleaned.csv       # Social media feature request clusters
│   ├── waze_cleaned.csv            # Navigation complaint data
│   ├── github_cleaned.csv          # Open-source benchmark repositories
│   └── ideas_clean_description.csv # Preprocessed validation references
├── docs/                           # Architecture specifications & deep dives
│   ├── crawl4ai-integration.md     # Web crawler security & SSRF defense documentation
│   ├── github-integration.md       # GitHub integration & rate-limiting specs
│   └── research-integration.md     # Academic API integration architecture
├── prisma/                         # Frontend Prisma Schema & migrations
│   └── schema.prisma               # PostgreSQL models for Users, Accounts, Sessions, Ideas
├── src/                            # Next.js 16 Web Application (App Router)
│   ├── app/                        # Route pages and API handlers
│   │   ├── (auth)/                 # Login, register, email verification
│   │   ├── (authenticated)/        # Protected workspace pages
│   │   │   ├── dashboard/          # Analytics overview & KPI widgets
│   │   │   ├── ideas/              # Idea creation & validation progress
│   │   │   ├── opportunity-matrix/ # Interactive whitespace scatter plot
│   │   │   └── notes/              # Concept workspace & sticky notes
│   │   └── api/                    # Next.js API routes (dashboard, export/pdf, auth)
│   ├── components/                 # Reusable UI primitives & dashboard widgets
│   └── lib/                        # Client utilities, auth configurations, API helpers
├── docker-compose.yml              # Local infrastructure (PostgreSQL 5433, Redis 6381, Qdrant, MinIO)
├── package.json                    # Next.js frontend dependencies & scripts
└── .env.example                    # Comprehensive environment template
```

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or later (LTS recommended)
- **Python**: `3.12.x`
- **Docker & Docker Compose**: For PostgreSQL, Redis, Qdrant, and MinIO
- **Git**

---

### 2. Infrastructure Setup (Docker Compose)
Start the supporting services (PostgreSQL, Redis, Qdrant Vector DB, and MinIO) in detached mode:

```bash
# From the project root
docker compose up -d
```

| Service | Host Port | Internal Port | Purpose |
|---|---|---|---|
| **PostgreSQL** | `5433` | `5432` | Relational application database |
| **Redis** | `6381` | `6379` | Task broker, ETag caching, SSE pub/sub |
| **Qdrant** | `6333` | `6333` | Semantic dense vector store |
| **MinIO** | `9000` / `9001` | `9000` / `9001` | S3-compatible artifact storage (Console on 9001) |

---

### 3. Backend Setup (FastAPI + LangGraph)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python 3.12 virtual environment
# Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# Linux / macOS:
# python3.12 -m venv .venv
# source .venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -e ".[dev]"

# 4. Configure environment variables
# Copy root .env.example to .env and provide your LLM / API keys
cp ../.env.example .env

# 5. Run database migrations (Alembic)
alembic upgrade head

# 6. Start the FastAPI API server (Port 8000)
uvicorn backend.main:app --reload --port 8000
```

In a separate terminal (with the virtual environment activated), start the **Celery worker**:

```bash
# Windows:
celery -A backend.worker.celery_app worker --loglevel=info -P solo

# Linux / macOS:
# celery -A backend.worker.celery_app worker --loglevel=info
```

The FastAPI Swagger interactive documentation will be available at:
👉 **`http://localhost:8000/api/docs`**

---

### 4. Frontend Setup (Next.js 16)

Open a new terminal at the project root:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Run database migrations for the Next.js app
npx prisma migrate dev --name init

# 4. Start the Next.js development server
npm run dev
```

The DIME web platform is now live at:
👉 **`http://localhost:3000`**

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` in the root and in `backend/` and configure the following variables:

```env
# ── PostgreSQL Database ────────────────────────────────────
DATABASE_URL="postgresql://dime:dime@localhost:5433/dime"

# ── Redis Cache & Pub/Sub ─────────────────────────────────
REDIS_URL="redis://localhost:6381/0"

# ── Qdrant Vector Database ────────────────────────────────
QDRANT_URL="http://localhost:6333"
QDRANT_COLLECTION_NAME="dime_chunks"

# ── LLM Providers (Provide at least one) ───────────────────
GOOGLE_API_KEY="your-gemini-api-key"        # Google Gemini 2.5 Flash / Pro
GROQ_API_KEY="your-groq-api-key"            # Groq high-speed inference
OPENAI_API_KEY="your-openai-api-key"        # Optional OpenAI fallback
ANTHROPIC_API_KEY="your-anthropic-api-key"  # Optional Anthropic Claude fallback

# ── GitHub Integration ─────────────────────────────────────
GITHUB_TOKEN="ghp_your_personal_access_token"
GITHUB_API_URL="https://api.github.com"

# ── Academic Research Integrations ────────────────────────
SEMANTIC_SCHOLAR_API_KEY="your_api_key_here"  # Free at semanticscholar.org
CROSSREF_MAILTO="your-email@domain.com"       # Required for Crossref Polite Pool
IEEE_XPLORE_API_KEY="your_ieee_key_here"      # Optional IEEE Xplore API key

# ── NextAuth & Security ────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-secret"
BACKEND_SECRET_KEY="generate-a-secure-random-secret"

# ── Object Storage (MinIO / S3) ───────────────────────────
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="dime-artifacts"
```

---

## 📡 API Reference

### FastAPI Core Endpoints (`http://localhost:8000/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyses` | Queue a new idea analysis job |
| `GET` | `/analyses/{id}` | Check status and execution stage of an analysis |
| `GET` | `/analyses/{id}/events` | **Server-Sent Events (SSE)** live stream of agent execution |
| `GET` | `/analyses/{id}/report` | Structured report with all 6 scores, verdict, and findings |
| `GET` | `/analyses/{id}/evidence` | List all retrieved evidence chunks, citations, and confidence scores |
| `GET` | `/analyses/{id}/agents` | Audit log of agent thoughts, decisions, and tool executions |
| `GET` | `/analyses/{id}/sources` | Metrics on sources searched (GitHub, Academic, Web) |
| `GET` | `/health` | Health probe checking DB, Redis, and Qdrant connectivity |

#### Example: Submitting an Idea for Analysis

```bash
curl -X POST http://localhost:8000/api/v1/analyses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Autonomous DevOps Incident Triager",
    "description": "An AI agent that monitors Kubernetes clusters, ingests OpenTelemetry traces, correlates anomalous logs, and automatically drafts pull requests to resolve infrastructure failures.",
    "targetAudience": "Site Reliability Engineers & Platform Teams",
    "industry": "DevOps & Cloud Infrastructure",
    "techFamiliarity": "Advanced",
    "teamSize": 4,
    "timelineMonths": 6
  }'
```

---

## 🧪 Testing & Validation

### Python Backend Tests
The backend test suite includes unit tests, integration tests, and mocked client tests for external APIs:

```bash
cd backend

# Run all backend tests
pytest -v

# Run GitHub integration tests
pytest tests/integrations/test_github.py -v

# Run Ingestion & Normalizer tests
pytest tests/ingestion/test_normalizer.py -v

# End-to-end local analysis pipeline verification
python test_e2e.py
```

### Frontend Code Quality
```bash
# Run ESLint check
npm run lint

# Validate Prisma schema
npm run prisma:validate
```

---

## 🗺️ Roadmap

- [x] Next.js 16 + React 19 Frontend with Tailwind CSS v4 & Recharts.
- [x] FastAPI backend with SQLAlchemy 2.0 Asyncio & Alembic.
- [x] LangGraph 12-stage multi-agent orchestration pipeline.
- [x] Multi-source ingestion: GitHub REST API, Crawl4AI, Semantic Scholar, Crossref.
- [x] Real-time SSE streaming of agent thoughts and status.
- [x] Deterministic 6-pillar scoring engine.
- [x] PDF validation report generation via `pdf-lib`.
- [ ] Direct Google Trends API real-time integration.
- [ ] Team collaboration workspaces & shared commenting.
- [ ] Autonomous weekly competitor tracking alerts.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Vivek Chaurasiya**  
- GitHub: [@VivekChaurasiya95](https://github.com/VivekChaurasiya95)  
- Project Repository: [vivekchaurasiya/dime](https://github.com/VivekChaurasiya95/DIME)

---

<div align="center">
<sub>Built with precision for builders, engineers, and product teams. Validate first. Build right.</sub>
</div>
