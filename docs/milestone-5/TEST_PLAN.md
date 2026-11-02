# DIME — Milestone 5: Master Test Plan & Testing Strategy
## Phase 2 Deliverable — Comprehensive Test Plan Specification

---

### Document Control & Strategy Metadata

| Attribute | Specification Details |
| :--- | :--- |
| **Project Title** | **DIME** (Data-Driven Idea Exploration & Market Analysis Platform) |
| **Milestone Identifier** | **Milestone 5: Testing, Deployment & Performance Evaluation** |
| **Document Purpose** | Comprehensive Test Strategy, Plan & Central Test Case Register |
| **Author / Lead QA Engineer** | **Vivek Chaurasiya** |
| **Academic Programme** | B.Tech Computer Science & Engineering (Semester 5 Capstone Project) |
| **Test Environment** | Local Development & Containerized Services (PostgreSQL 16, Qdrant, Redis, MinIO) |
| **Target Deadline** | **26/10/2026 (till 18:29:59)** |
| **Status** | **Approved & Active** |

---

## 1. Executive Test Strategy Overview

The DIME testing strategy spans 20 critical software quality disciplines designed to ensure that the platform is mathematically defensible, functionally reliable, architecturally secure, and performant.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DIME QUALITY ASSURANCE PYRAMID                                 │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                 [User Acceptance Testing (UAT)]                                   │
│                               Human Usability Protocol & SUS Scale                                │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                             [End-to-End & Regression Testing]                                     │
│                        8 Multi-Tab Core Founder Validation User Journeys                          │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                      [AI, RAG & Agentic Groundedness Evaluation]                                  │
│             Retrieval Precision@K, Groundedness Audit, Citation Traceability, Hallucination        │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                   [Performance, Security & Reliability Testing]                                   │
│              API Latency Benchmarks, SQL Injection Defense, SSRF Safety, Chaos Fault Recovery     │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                 [API Integration & Database Pipeline Testing]                                     │
│           BFF Endpoints, Ingestion Normalization, Qdrant Vector Indexing, Tenant Isolation         │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│               [Unit Testing & Static Type Checking]                                               │
│       TypeScript Compilation (0 Errors), Mathematical Scoring Formulas, Prisma Schema Validation  │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Environment & Preconditions

| Component | Test Environment Specification | Operational Preconditions |
| :--- | :--- | :--- |
| **Frontend Runtime** | Node.js v20.18.0 / Next.js 16.1.6 App Router on Windows 11 | `package.json` dependencies installed, `.env` configured with `NEXTAUTH_SECRET`. |
| **Backend Runtime** | Python 3.13.7 virtual environment (`backend/.venv`) | FastAPI 0.115, SQLAlchemy 2.0 Async, Pydantic v2 installed. |
| **PostgreSQL Database** | PostgreSQL 16 Alpine running in Docker container (`dime-postgres` on port `5433`) | Database `dime` initialized with 26 tables; test user `cmueb7odn0008l3uxgsiq0lwb` present. |
| **Vector Store** | Qdrant v1.12.6 container (`dime-qdrant` on port `6333`) | Collection configured with 384-dimensional cosine distance metric. |
| **Message Broker** | Redis 7 Alpine container (`dime-redis` on port `6381`) | Celery worker task queue and event pub/sub operational. |

---

## 3. Central Test Case Register

### 3.1 Unit Testing Suite (`DIME-UNIT`)

| Test ID | Test Category | Description & Test Objective | Execution Method | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DIME-UNIT-001** | Static Type Safety | Run TypeScript compiler in strict no-emit mode across all frontend components. | `npx tsc --noEmit` | Clean exit with 0 errors and 0 type warnings. | **PASS** |
| **DIME-UNIT-002** | Database Schema | Validate Prisma schema relational definitions and foreign key constraints. | `npx prisma validate` | Confirmation: "The schema at prisma\schema.prisma is valid 🚀". | **PASS** |
| **DIME-UNIT-003** | Feasibility Scoring | Verify 3-dimensional feasibility evaluation across architectural complexity levels. | `pytest test_feasibility_enhancement.py` | Low complexity yields 90.0; extreme complexity drops to 30.0. | **PASS** |
| **DIME-UNIT-004** | Constraint Parsing | Verify regex extraction of team headcount and roles from natural language text. | `pytest test_feasibility_enhancement.py` | `"2 engineers, 1 designer"` correctly yields `(3, roles)`. | **PASS** |
| **DIME-UNIT-005** | Unassessed Handling | Verify that omitting optional constraints does not apply artificial score penalties. | `pytest test_feasibility_enhancement.py` | Delivery fit marked `Unassessed` with 0.0 constraint modifier. | **PASS** |
| **DIME-UNIT-006** | Text Normalization | Test document normalizer against malformed URLs, excessive whitespace, and HTML tags. | `pytest test_normalizer.py` | Clean UTF-8 text output with preserved semantic meaning. | **PASS** |
| **DIME-UNIT-007** | Text Chunking | Verify recursive token chunker adheres to maximum chunk sizes and overlap boundaries. | `pytest test_chunker.py` | Chunks stay within token bounds; overlap tokens preserved. | **PASS** |
| **DIME-UNIT-008** | Retrieval Models | Verify Pydantic validation for `RetrievalQuery` and `RetrievalResult`. | `pytest test_models.py` | Validates query constraints; rejects negative `top_k` values. | **PASS** |
| **DIME-UNIT-009** | Web Crawler Security | Test SSRF prevention: verify that private IP ranges and localhost are blocked. | `pytest test_web_security.py` | Blocks `127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`. | **PASS** |
| **DIME-UNIT-010** | Novelty Formula | Verify that Novelty equals $100 \times (1 - \text{max\_similarity})$. | Pytest calculation check | When similarity is 0.80, novelty evaluates to 20.0. | **PASS** |
| **DIME-UNIT-011** | Saturation Formula | Verify competitor count stepwise mapping with gap discount deduction. | Pytest calculation check | Base 55.0 for 4 competitors minus gap discount $\min(3G, 15)$. | **PASS** |
| **DIME-UNIT-012** | Risk Formula | Verify authoritative DIME formula: $0.3\text{Sat} + 0.4(100-\text{Feas}) + 0.3(100-\text{Nov})$. | Pytest calculation check | Mathematical composite accurately evaluates between 0 and 100. | **PASS** |

### 3.2 Backend API Testing Suite (`DIME-API`)

| Test ID | Endpoint & Method | Description & Test Objective | Test Payload / Headers | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DIME-API-001** | `POST /api/auth/[...nextauth]` | Verify credentials login with valid email and bcrypt-hashed password. | Valid credentials payload | Returns 200 OK with secure HTTP-only JWT session cookie. | **PASS** |
| **DIME-API-002** | `POST /api/auth/[...nextauth]` | Verify rejection of invalid credentials. | Wrong password payload | Returns 401 Unauthorized with descriptive error code. | **PASS** |
| **DIME-API-003** | `GET /api/ideas` | Retrieve idea portfolio for authenticated user. | Valid session cookie | Returns 200 OK with array of user-specific `Idea` objects. | **PASS** |
| **DIME-API-004** | `GET /api/ideas` | Verify unauthorized access without session cookie. | No auth headers | Returns 401 Unauthorized; zero records exposed. | **PASS** |
| **DIME-API-005** | `POST /api/ideas/start-analysis` | Validate minimum input length enforcement. | Title < 4 chars or Desc < 30 chars | Returns 400 Bad Request with validation message. | **PASS** |
| **DIME-API-006** | `POST /api/ideas/start-analysis` | Verify successful analysis dispatch and Celery queueing. | Valid product idea payload | Returns 200 OK with `ideaId`, `analysisId`, status `ANALYZING`. | **PASS** |
| **DIME-API-007** | `GET /api/dashboard/overview` | Verify dashboard aggregations and KPI calculations. | Valid session cookie | Returns stats, viability matrix, benchmark, and recent activity. | **PASS** |
| **DIME-API-008** | `GET /api/dashboard/recent-analyses`| Verify pagination and status filtering on recent analyses table. | `?page=1&limit=5&status=completed` | Returns 5 paginated analyses with novelty, market, feasibility. | **PASS** |
| **DIME-API-009** | `GET /api/v1/comparisons` | Verify multi-idea comparison reports listing. | AsyncSession DB call | Returns 200 OK with comparison reports and statistics. | **PASS** |
| **DIME-API-010** | `GET /api/v1/analyses/{id}/overview` | Verify contextual overview synthesis for a validated concept. | Analysis ID path param | Returns 200 OK with scores, competitors, gaps, and verdicts. | **PASS** |
| **DIME-API-011** | Tenant Isolation Test | Verify that User A cannot retrieve or mutate User B's analyses. | Cross-user query execution | User A receives empty array / 404; no data leakage. | **PASS** |

### 3.3 Data Pipeline & Ingestion Suite (`DIME-PIPE`)

| Test ID | Module | Description & Test Objective | Execution Method | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DIME-PIPE-001** | Multi-Source Ingestion | Verify ingestion of research papers, GitHub repos, and web articles. | Database query inspection | 553 source documents ingested across academic and web sources. | **PASS** |
| **DIME-PIPE-002** | SHA-256 Deduplication | Verify exact duplicate document identification via content hash. | DocumentPipeline execution | Duplicate URLs and hashes are skipped without re-indexing. | **PASS** |
| **DIME-PIPE-003** | Chunk & Citation Mapping | Verify multi-chunk evidence claims collapse properly to distinct sources. | `test_research_sources_metrics.py` | 361 total evidence claims deduplicate to 299 distinct sources. | **PASS** |
| **DIME-PIPE-004** | Qdrant Vector Sync | Verify vector store point counts match PostgreSQL chunk records. | Qdrant client collection query | 17,714 vector points stored with 384-dim embeddings. | **PASS** |
| **DIME-PIPE-005** | Graceful Source Failure | Simulate timeout on external academic API. | Unit test mock with timeout | Analysis proceeds using available sources; partial flag recorded. | **PASS** |

### 3.4 AI, RAG & Agentic Reasoning Suite (`DIME-AI`)

| Test ID | Agent / Component | Description & Test Objective | Execution Method | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DIME-AI-001** | Planner Agent | Verify extraction of `StructuredIdea` from ambiguous founder prompts. | Planner test invocation | Extracts target users, problem statement, and key value props. | **PASS** |
| **DIME-AI-002** | Research Agent | Verify academic literature retrieval and finding qualification. | Agent execution log audit | Identifies relevant papers; classifies findings as `supported`. | **PASS** |
| **DIME-AI-003** | Competition Agent | Verify 4-tier competitor taxonomy classification. | Overview service test | Categorizes direct commercial competitors and OSS repos. | **PASS** |
| **DIME-AI-004** | Synthesis Agent | Verify cross-source claim reconciliation and evidence linking. | Finding model verification | Every generated claim links to at least 1 verified chunk ID. | **PASS** |
| **DIME-AI-005** | RAG Groundedness | Audit final report claims against retrieved source text snippets. | Manual spot audit (50 samples) | Zero unsupported claims or fabricated citation DOIs. | **PASS** |
| **DIME-AI-006** | Substring Collision Defense | Verify that "LLM" in medical software does not trigger student "LMS" competitors. | `test_master_implementation_fixes.py` | Word boundary check passes; no false Canvas/Notion injection. | **PASS** |

### 3.5 End-to-End & Regression Suite (`DIME-E2E`)

| Test ID | User Journey | Description & Test Objective | Scope & Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DIME-E2E-001** | Auth & Onboarding | User registration, login, and redirection to authenticated dashboard. | Login page $\rightarrow$ credentials input $\rightarrow$ dashboard | User profile hydrated; top navbar displays user name. | **PASS** |
| **DIME-E2E-002** | Idea Submission | Multi-mode idea submission with operational parameters. | `/ideas/new` $\rightarrow$ fill form $\rightarrow$ trigger validation | Idea saved in PostgreSQL with status `ANALYZING`. | **PASS** |
| **DIME-E2E-003** | Dashboard Inspection | Review executive KPI strip, Recent Analyses table, and 2D matrix. | `/dashboard` page navigation | All 5 KPIs display live numbers; table renders without scrollbar. | **PASS** |
| **DIME-E2E-004** | Workspace Navigation | Navigate through all 12 validation workspace tabs. | `/workspace/[id]` $\rightarrow$ click all 12 tabs | Each tab mounts without errors; telemetry updates seamlessly. | **PASS** |
| **DIME-E2E-005** | Pareto Comparison | Side-by-side comparison of 2 portfolio concepts. | `/comparison` $\rightarrow$ select 2 ideas $\rightarrow$ run Pareto | Renders radar chart, trade-off matrix, and winning recommendation.| **PASS** |
| **DIME-E2E-006** | Report Export | Generate and download executive analysis summary. | Workspace report tab $\rightarrow$ click Export CSV/PDF | File downloads with complete citations and score breakdowns. | **PASS** |

### 3.6 Security & Performance Suite (`DIME-SEC` & `DIME-PERF`)

| Test ID | Discipline | Description & Test Objective | Execution Method | Target Benchmark | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **DIME-SEC-001** | SQL Injection | Inject SQL syntax payloads into search inputs and form fields. | `' OR 1=1; --` in idea query | Sanitized by ORM | Zero data leakage; parameterized execution. | **PASS** |
| **DIME-SEC-002** | XSS Defense | Inject `<script>alert(1)</script>` into idea description. | Script injection payload | Rendered as text | Escaped by React 19 JSX engine. | **PASS** |
| **DIME-SEC-003** | Cookie Security | Verify NextAuth session cookie attributes. | Inspect Set-Cookie header | `HttpOnly`, `SameSite=Lax` | Confirmed secure cookie configuration. | **PASS** |
| **DIME-PERF-001**| Dashboard Latency | Measure server response latency for `/api/dashboard/overview`. | 20 sequential GET requests | $\le 250\text{ ms}$ | **Mean: 142 ms** (Min: 118 ms, Max: 184 ms). | **PASS** |
| **DIME-PERF-002**| TypeScript Build | Measure full codebase static type-checking time. | `Measure-Command { npx tsc }` | $\le 15\text{ s}$ | **7.42 seconds** (0 errors). | **PASS** |
| **DIME-PERF-003**| Database Query | Measure execution time for multi-table tenant evidence join. | SQLAlchemy execution timer | $\le 50\text{ ms}$ | **18.4 ms** (Compound B-tree indexes utilized). | **PASS** |

---

## 4. Test Execution Governance & Traceability

1. **Safety Protocol**: All tests were executed in a controlled local environment against containerized services (`localhost:5433`, `localhost:6381`, `localhost:6333`).
2. **Defect Linkage**: Any failing test case triggers immediate logging in [`DEFECT_REGISTER.md`](file:///d:/Projects/DIME-Sem5/docs/milestone-5/DEFECT_REGISTER.md). Fixes must be validated by re-running the specific test and affected regression suites.
3. **Audit Evidence**: Execution logs and command outputs are captured in [`docs/milestone-5/evidence/`](file:///d:/Projects/DIME-Sem5/docs/milestone-5/evidence/).

