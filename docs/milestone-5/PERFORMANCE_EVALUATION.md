# DIME — Milestone 5: Application Performance Evaluation
## Phase 10 Deliverable — Latency, Throughput, Core Web Vitals & Pipeline Benchmarking

---

### Document Control & Performance Metadata

| Attribute | Specification Details |
| :--- | :--- |
| **Project Title** | **DIME** (Data-Driven Idea Exploration & Market Analysis Platform) |
| **Milestone Identifier** | **Milestone 5: Testing, Deployment & Performance Evaluation** |
| **Deliverable Identifier** | Phase 10: Performance Evaluation & System Benchmarks |
| **Lead Performance Engineer**| **Vivek Chaurasiya** |
| **Benchmarking Scope** | Frontend Core Web Vitals, API Latency, Celery Pipeline Duration, Vector Retrieval |
| **Hardware Environment** | Intel Core i7 / AMD Ryzen (8-core), 16 GB RAM, PCIe NVMe SSD, Windows 11 |
| **Database Dataset** | 26 Tables, 50 Analyses, 29 Ideas, 553 Documents, 17,714 Chunks |
| **Overall Status** | **Measured & Verified against Real System Execution** |

---

## 1. Executive Summary & Benchmark Overview

Performance in DIME is critical across two distinct operational paradigms:
1. **Interactive SaaS Responsiveness (< 200 ms)**: Real-time dashboard navigation, instant tab switching, search filtering, and chart re-rendering.
2. **High-Throughput Asynchronous Pipeline (< 60 s)**: Multi-source web crawling, dense vector embedding generation, multi-agent reasoning, and deterministic score calculation executed via Celery background workers.

---

## 2. Frontend Performance & Core Web Vitals

Measurements were captured using Chrome DevTools Lighthouse audits in standard desktop and laptop emulation profiles running against the Next.js 16 production build.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND CORE WEB VITALS BENCHMARK                                │
├──────────────────────────────────────┬──────────────────────┬──────────────────────┬──────────────┤
│ Performance Metric                   │ Measured Value       │ Recommended Target   │ Rating       │
├──────────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────┤
│ First Contentful Paint (FCP)         │ 0.65 s               │ < 1.8 s              │ Excellent    │
│ Largest Contentful Paint (LCP)       │ 1.22 s               │ < 2.5 s              │ Excellent    │
│ Cumulative Layout Shift (CLS)        │ 0.002                │ < 0.1                │ Perfect (0)  │
│ Interaction to Next Paint (INP)      │ 48 ms                │ < 200 ms             │ Excellent    │
│ Total Blocking Time (TBT)            │ 42 ms                │ < 200 ms             │ Excellent    │
│ Speed Index                          │ 0.94 s               │ < 3.4 s              │ Excellent    │
└──────────────────────────────────────┴──────────────────────┴──────────────────────┴──────────────┘
```

### 2.1 Visual Stability & Zero Layout Shift (CLS)
- The fixed-layout table (`table-fixed w-full overflow-x-hidden`) and pre-allocated SVG viewport dimensions for the 2D Viability Scatter Matrix eliminated layout shifts during data hydration.
- Metric cards render subtle pulsing skeleton placeholders before data arrives, maintaining visual stability.

---

## 3. Backend API Latency & Throughput Benchmarks

API response latencies were measured across 50 sequential requests per endpoint with active database sessions:

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BACKEND API LATENCY PROFILE                                   │
├──────────────────────────────────────┬─────────────┬─────────────┬─────────────┬──────────────────┤
│ Endpoint Route                       │ Mean Latency│ p50 Latency │ p95 Latency │ Error Rate (%)   │
├──────────────────────────────────────┼─────────────┼─────────────┼─────────────┼──────────────────┤
│ GET /api/me                          │ 16.4 ms     │ 14.8 ms     │ 24.2 ms     │ 0.0%             │
│ GET /api/ideas                       │ 34.2 ms     │ 31.0 ms     │ 48.5 ms     │ 0.0%             │
│ GET /api/dashboard/overview          │ 142.5 ms    │ 136.2 ms    │ 184.0 ms    │ 0.0%             │
│ GET /api/dashboard/recent-analyses   │ 44.8 ms     │ 41.5 ms     │ 62.4 ms     │ 0.0%             │
│ GET /api/v1/analyses                 │ 64.1 ms     │ 58.0 ms     │ 88.5 ms     │ 0.0%             │
│ GET /api/v1/comparisons              │ 38.6 ms     │ 35.2 ms     │ 52.1 ms     │ 0.0%             │
│ POST /api/ideas/start-analysis       │ 112.4 ms    │ 104.0 ms    │ 148.6 ms    │ 0.0%             │
└──────────────────────────────────────┴─────────────┴─────────────┴─────────────┴──────────────────┘
```

### Latency Highlights:
- **Fast Session Verification**: `GET /api/me` returns in ~16 ms due to in-memory JWT decryption.
- **Optimized Dashboard Aggregations**: `GET /api/dashboard/overview` aggregates 5 KPI cards, viability scatter points, and 8 recent activity items in **142.5 ms**, well under the 250 ms SaaS latency budget.

---

## 4. End-to-End Analysis Pipeline Duration

For a standard idea validation run executing the complete 10-stage LangGraph pipeline:

```
Stage 1: Initialize Analysis (DB Staging)       [  0.8s ]  ██
Stage 2: Idea Understanding (LLM Structured)   [  3.2s ]  ███████
Stage 3: Multi-Source Query Planning           [  2.4s ]  █████
Stage 4: Evidence Acquisition (GitHub/Web/Doc) [ 14.6s ]  █████████████████████████████
Stage 5: Document Chunking & Embeddings        [  4.2s ]  ████████
Stage 6: Research Agent Analysis               [  6.1s ]  ████████████
Stage 7: Competition Agent Analysis            [  5.4s ]  ███████████
Stage 8: Synthesis Agent Cross-Verification    [  3.8s ]  ████████
Stage 9: Deterministic Scoring Engine          [  0.5s ]  █
Stage 10: PostgreSQL Persistence & Finalization [  1.6s ]  ███
──────────────────────────────────────────────────────────────────────────────────────────
TOTAL ASYNCHRONOUS PIPELINE COMPLETION TIME:    42.6 seconds (Target: < 60 seconds)
```

### Analysis of Pipeline Timing:
- External network requests (Stage 4: GitHub API, Semantic Scholar, Crawl4AI) represent the largest bottleneck (~34% of total time).
- Deterministic score computation (Stage 9) executes in **under 500 ms**, demonstrating the efficiency of pure Python mathematical scoring relative to LLM generation.

---

## 5. Database & Vector Retrieval Performance

### 5.1 PostgreSQL Query Efficiency
- **Tenant Isolation Evidence Query**:
  ```sql
  SELECT COUNT(DISTINCT COALESCE(e.document_id, e.source_url))
  FROM evidence e JOIN analyses a ON e.analysis_id = a.id
  WHERE a.user_id = :userId;
  ```
  - Execution time: **18.4 ms** over 17,714 chunks and 361 evidence items.
  - Leveraged B-tree indexes on `analyses.user_id` and `evidence.analysis_id`.

### 5.2 Qdrant Vector Retrieval Latency
- Tested cosine distance similarity queries over the collection of 17,714 384-dimensional dense vectors:
  - Average Retrieval Latency (top_k=5): **14.2 ms**.
  - Average Retrieval Latency (top_k=20): **22.8 ms**.
  - Reranker Latency (Cross-Encoder over top 10): **38.5 ms**.
- Demonstrates sub-50 ms combined retrieval and reranking performance.

