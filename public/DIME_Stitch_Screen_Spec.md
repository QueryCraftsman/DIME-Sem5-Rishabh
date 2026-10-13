# DIME — Stitch Screen & UI Specification
## AI Product Intelligence & Idea Validation Platform
### Existing Orange + White Theme Preservation

> **Purpose:** This document is the complete screen specification for generating the redesigned DIME frontend in Stitch.
>
> **Primary source:** DIME PRD and the existing DIME website screenshots supplied by the product team.
>
> **Critical instruction:** The current DIME visual identity must be preserved. Do **not** redesign DIME as a generic purple/blue AI SaaS product. The existing orange + white interface is the source of truth.
>
> **Product change:** The visual shell remains familiar, but the product methodology changes from static CSV/TF-IDF/rule-based analytics to dynamic evidence retrieval, semantic search, RAG, specialized AI components, competition intelligence, market intelligence, technical feasibility, and evidence-backed recommendations.

---

# 1. Product Experience Goal

DIME should feel like:

> **An intelligent research and decision-support workspace for validating software/product ideas.**

The user journey is:

```text
Dashboard
   ↓
Create / Validate Idea
   ↓
Analysis Processing
   ↓
Evidence Collection
   ↓
Idea Intelligence Report
   ├── Overview
   ├── Market Intelligence
   ├── Competition
   ├── Technical Feasibility
   ├── Research & Evidence
   ├── Risks
   └── Recommendations / MVP
   ↓
Save analysis to My Ideas
```

The user should never feel that DIME is simply a chatbot.

The UI must communicate:

- evidence
- sources
- confidence
- freshness
- analysis status
- competitors
- market signals
- technical feasibility
- risks
- recommendations

---

# 2. Global Visual Language

## 2.1 Existing DIME Theme

The existing screenshots show:

- white sidebar
- white top navigation bar
- very light gray application background
- orange active navigation item
- orange primary buttons
- dark navy text
- blue-gray secondary text
- white cards with thin gray borders
- medium rounded corners
- restrained shadows
- clean analytics/dashboard layout
- purple and cyan used selectively for charts
- green/red/amber for semantic states

Preserve this exact visual character.

## 2.2 Brand Colors

Use these tokens consistently:

```css
--dime-orange: #EA580C;
--dime-orange-hover: #F97316;
--dime-orange-dark: #C2410C;
--dime-orange-soft: #FFF7ED;
--dime-orange-light: #FFEDD5;

--dime-navy: #0F172B;
--dime-text: #172033;
--dime-text-secondary: #64748B;
--dime-text-muted: #94A3B8;

--dime-background: #F8FAFC;
--dime-surface: #FFFFFF;
--dime-border: #E2E8F0;
--dime-border-light: #EEF2F6;

--dime-green: #16A34A;
--dime-green-soft: #F0FDF4;

--dime-red: #DC2626;
--dime-red-soft: #FEF2F2;

--dime-amber: #D97706;
--dime-amber-soft: #FFFBEB;

--dime-blue: #2563EB;
--dime-blue-soft: #EFF6FF;

--dime-purple: #8B5CF6;
--dime-purple-soft: #F5F3FF;

--dime-cyan: #06B6D4;
--dime-cyan-soft: #ECFEFF;
```

### Color meaning

| Color | Meaning |
|---|---|
| Orange | DIME brand, primary actions, selected navigation |
| Navy | Primary text and headings |
| Purple | AI activity / AI-derived visualizations |
| Cyan | Data visualization / secondary analytics |
| Green | Positive/healthy/completed |
| Amber | Caution/medium confidence |
| Red | Risk/failure/critical |
| Blue | Informational state |

Do not use gradients as a primary visual style.

---

# 3. Typography

Use **Inter** throughout the product.

Recommended hierarchy:

```text
Page title:       28–32px / 700
Section title:    20–22px / 650
Card title:       16–18px / 600
Body:             14–15px / 400
Secondary:        13–14px / 400
Caption:          12px / 400
Metric:           28–36px / 700
```

Headings should be dark navy.

Body text should use blue-gray.

Avoid excessive bold text.

---

# 4. Layout System

## Desktop

Target:

```text
1440px+
```

Layout:

```text
┌───────────────┬─────────────────────────────────────────┐
│               │ Top Header                              │
│   Sidebar     ├─────────────────────────────────────────┤
│   268px       │                                         │
│               │ Main Content                            │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
```

Existing screenshot proportions should be preserved:

- Sidebar approximately 264–270px
- Header approximately 76–84px
- Main content scrolls independently
- 24–32px page padding
- cards aligned to an 8px spacing rhythm

## Tablet

- collapsible sidebar
- 20–24px content padding
- cards become 1–2 columns

## Mobile

- sidebar becomes drawer
- header becomes compact
- cards become one column
- charts become horizontally scrollable or simplified
- tables become cards
- persistent bottom action may be used for primary analysis actions

---

# 5. Global Application Shell

Every authenticated screen uses the same shell.

## Left Sidebar

```text
DIME logo

Dashboard
Validate Idea
Market Intelligence
Competition
Research & Evidence
Opportunity Matrix

WORKSPACE

My Ideas
Notes

bottom:
Settings
```

### Active navigation

Active item:

```text
background: #EA580C
text: white
icon: white
border-radius: 10–12px
```

Inactive item:

```text
background: transparent
text: #334155
icon: #8FA2BD
```

Hover:

```text
background: #FFF7ED
text: #EA580C
```

## Top Header

Left:

```text
Global search
Search ideas, markets, competitors, datasets...
```

Right:

```text
theme icon
notifications
divider
user name
email
avatar
```

Preserve the existing header appearance from the screenshots.

---

# 6. Global Search

Search field placeholder:

> Search ideas, markets or datasets...

When focused, show a dropdown:

```text
Recent Searches

AI interview coach
Healthcare documentation
Developer productivity

Ideas
────────────
AI Interview Coach

Competitors
────────────
Pramp
LeetCode

Sources
────────────
GitHub repository...
```

Search result categories should be visually separated.

---

# 7. Global UI Components

Create reusable components for:

- Sidebar
- Header
- PageHeader
- Breadcrumb
- PrimaryButton
- SecondaryButton
- IconButton
- MetricCard
- EvidenceCard
- SourceBadge
- ConfidenceBadge
- StatusBadge
- ScoreCard
- CompetitorCard
- InsightCard
- EmptyState
- LoadingState
- ErrorState
- ProgressStepper
- DataTable
- ChartCard
- Tabs
- FilterBar
- SearchInput
- Modal
- Drawer
- Toast
- Tooltip
- Citation/EvidencePopover

Cards should generally use:

```text
background: white
border: 1px solid #E2E8F0
border-radius: 14px
shadow: subtle
```

Avoid heavy shadows.

---

# 8. SCREEN MAP

Generate these primary routes/screens:

```text
PUBLIC
1. Login
2. Register

CORE
3. Dashboard
4. Validate Idea
5. Analysis Progress
6. Analysis Overview

ANALYSIS DETAIL
7. Market Intelligence
8. Competition
9. Technical Feasibility
10. Research & Evidence
11. Risks & Recommendations

PORTFOLIO
12. Opportunity Matrix
13. My Ideas
14. Idea Workspace Detail

DATA / WORKSPACE
15. Data Sources
16. Notes

ACCOUNT
17. Settings

SYSTEM STATES
18. Empty states
19. Loading/skeleton states
20. Error/partial-analysis states
21. No-evidence state
22. Mobile responsive states
```

---

# 9. SCREEN 1 — LOGIN

## Route

```text
/login
```

## Purpose

Authenticate an existing DIME user.

## Layout

Desktop:

```text
┌───────────────────────┬─────────────────────────────────┐
│                       │                                 │
│ DIME branding         │        Welcome back             │
│                       │                                 │
│ Short product        │ Email                           │
│ description           │ [________________________]      │
│                       │                                 │
│                       │ Password                        │
│                       │ [________________________]      │
│                       │                                 │
│                       │ [        Sign In        ]       │
│                       │                                 │
│                       │ Forgot password?                │
│                       │                                 │
│                       │ Don't have an account? Sign up  │
└───────────────────────┴─────────────────────────────────┘
```

Use mostly white background with subtle orange branding.

Primary CTA orange.

Do not create a large gradient hero.

---

# 10. SCREEN 2 — REGISTER

## Route

```text
/register
```

Fields:

- Full name
- Email
- Password
- Confirm password

CTA:

> Create account

Below:

> Already have an account? Sign in

Optional:

- Google/GitHub OAuth buttons if implemented
- terms acknowledgement

Keep visually consistent with Login.

---

# 11. SCREEN 3 — DASHBOARD

## Route

```text
/dashboard
```

## Page Header

Title:

> Idea Validation Overview

Subtitle:

> Monitor your ideas, market signals, evidence, and analysis progress.

Primary button:

> + New Idea Analysis

## KPI row

Four cards:

### Ideas

```text
12
Total ideas
```

### Analyses

```text
18
Completed analyses
```

### Evidence

```text
342
Evidence items
```

### Sources

```text
47
Indexed sources
```

Each card may have a small semantic icon.

## Recent Analyses

Cards/table:

```text
Idea
Status
Novelty
Market
Competition
Feasibility
Updated
```

Example:

```text
AI Interview Coach
Completed
Medium
Strong
High
High
2 hours ago
```

## Market Signals

Right-side card:

```text
Market Signals

AI / ML
Trending

Demand momentum
71%

Evidence:
24 sources
```

## Recent Activity

Timeline:

```text
Analysis completed
AI Interview Coach

Competitor research updated
14 sources added

New evidence indexed
GitHub
```

## Quick Insight

Orange insight card:

```text
PRO TIP

Your recent ideas show strong demand signals,
but several have high competitor overlap.

View portfolio →
```

Do not fabricate actual values in implementation; use API data.

---

# 12. SCREEN 4 — VALIDATE IDEA

## Route

```text
/ideas/new
```

This is the main creation flow.

## Header

Title:

> Validate a New Idea

Subtitle:

> Describe your product idea and DIME will investigate its market, competition, technical feasibility, and evidence.

## Main layout

Left: form

Right: "What DIME analyzes" panel.

## Form

### Idea Title

Placeholder:

> e.g. AI-powered interview preparation platform

### Idea Description

Large textarea.

Placeholder:

> Describe the problem, target users, proposed solution, and what makes the idea different...

### Target Users

Optional input.

### Domain

Pills:

```text
AI/ML
SaaS
Web App
Mobile App
FinTech
HealthTech
EdTech
Developer Tools
Cybersecurity
Other
```

### Intended Platform

```text
Web
Mobile
Desktop
API
Browser Extension
Other
```

### Constraints

Optional:

```text
Budget
Team size
Timeline
Required technologies
```

### Analysis depth

Radio/select:

```text
Quick
Standard
Deep Research
```

Default:

> Standard

## Submit CTA

Large orange button:

> Analyze My Idea

Below:

> Analysis may take several minutes while DIME gathers external evidence.

## Right panel

Title:

> What We Analyze

Cards:

```text
Market Intelligence
Demand signals, user pain and trends.

Competition
Existing products, repositories and feature overlap.

Technical Feasibility
Technology maturity, complexity and dependencies.

Research
Relevant technical and academic evidence.
```

Use small colored icons, not giant illustrations.

---

# 13. SCREEN 5 — ANALYSIS PROGRESS

## Route

```text
/analyses/:id/progress
```

## Purpose

Show asynchronous analysis processing.

Title:

> Analyzing your idea

Subtitle:

> DIME is gathering evidence and evaluating your idea.

## Progress stepper

```text
✓ Idea Understanding
✓ Research Planning
● Market Research
○ Competition Analysis
○ Technical Feasibility
○ Evidence Synthesis
○ Final Report
```

Current step gets purple AI indicator.

Completed steps use green.

Pending steps use gray.

## Agent activity panel

```text
AI Activity

Research Agent
Searching relevant technical evidence
12 sources found

Competition Agent
Searching GitHub and public product pages
8 candidates found

Market analysis
Waiting for market evidence...
```

## Source progress

```text
Sources

GitHub             ✓
Web                ●
Research           ✓
App/User feedback  ●
```

## Footer

Do not provide a fake exact remaining time.

Use:

> Research can take a few minutes depending on source availability.

---

# 14. SCREEN 6 — ANALYSIS OVERVIEW

## Route

```text
/analyses/:id
```

This is the central report screen.

## Header

Breadcrumb:

```text
My Ideas / AI Interview Coach / Analysis
```

Title:

> AI Interview Coach

Badges:

```text
Completed
Last updated 18 Sep 2026
```

Actions:

```text
Export Report
Refresh Analysis
More
```

## Top summary

Large summary card:

```text
AI Interview Coach

Executive Summary

DIME found strong evidence of an existing market around
technical interview preparation, with multiple established
solutions and several recurring user pain signals.

The idea appears technically feasible, but differentiation
should focus on clearly identified gaps...

[Read full summary]
```

## Score cards

Four/five cards:

```text
Novelty
Medium
Confidence 82%

Market Demand
Strong
Confidence 79%

Competition
High
Confidence 91%

Technical Feasibility
High
Confidence 87%

Risk
Medium
Confidence 76%
```

Important:

Never show "78% chance of success".

Use:

```text
Score
Interpretation
Confidence
Evidence count
```

## Analysis tabs

```text
Overview
Market
Competition
Technical
Research
Risks & Recommendations
```

Orange active tab.

---

# 15. SCREEN 7 — MARKET INTELLIGENCE

## Route

```text
/analyses/:id/market
```

## Header

Title:

> Market Intelligence

Subtitle:

> Evidence-backed demand and user pain signals relevant to this idea.

## Top summary

```text
Market Demand
Strong

Evidence:
27 sources

Confidence:
79%

Last updated:
18 Sep 2026
```

## Demand signals chart

Line/bar chart showing normalized signals over time.

Do not imply precise market size unless source data supports it.

## User Pain Signals

Cards:

```text
Personalized feedback
High frequency
32 evidence items

Interview anxiety
Medium frequency
21 evidence items

Generic preparation
Medium frequency
18 evidence items
```

## Sentiment

Donut:

```text
Positive
Neutral
Negative
```

## Top Pain Points

Horizontal bar chart.

Each item should be clickable.

Clicking opens evidence drawer.

## Evidence drawer

```text
Why this signal?

Source:
Public review / product page

Excerpt:
"..."

Retrieved:
18 Sep 2026

Relevance:
High
```

---

# 16. SCREEN 8 — COMPETITION

## Route

```text
/analyses/:id/competition
```

## Header

Title:

> Competition Intelligence

Subtitle:

> Existing products, repositories, and related solutions discovered for this idea.

## Summary metrics

```text
Direct competitors     8
Related products       14
Research projects      5
Repositories           23
```

## Competitor table

Columns:

```text
Product
Type
Relevance
Audience
Key features
Activity
Source
```

## Competitor cards

Each card:

```text
Logo / icon
Name
Direct competitor

Short description

Relevance: 91%
Activity: Active

Features:
AI coaching
Mock interviews
Feedback

View source →
```

## Feature comparison matrix

Rows:

```text
AI feedback
Personalized coaching
Coding interviews
Resume analysis
Voice interview
Progress tracking
```

Columns:

```text
Your idea
Competitor A
Competitor B
Competitor C
```

Use orange for "Your idea".

## Differentiation section

```text
Observed gaps

1. ...
2. ...
3. ...
```

Every gap should link to evidence.

---

# 17. SCREEN 9 — TECHNICAL FEASIBILITY

## Route

```text
/analyses/:id/technical
```

## Header

Title:

> Technical Feasibility

Subtitle:

> Evaluate implementation complexity, technology maturity, dependencies, and infrastructure requirements.

## Overall card

```text
Technical Feasibility
High

Confidence 87%

Based on:
12 technology signals
9 repositories
6 technical sources
```

## Dimensions

Cards:

```text
Technology maturity
High

Implementation complexity
Medium

Infrastructure requirements
Medium

API availability
High

ML requirements
Medium

Integration complexity
Medium
```

## Recommended architecture

Show a simple visual architecture:

```text
Web App
   ↓
API
   ↓
LLM / AI service
   ↓
Vector database
   ↓
Data sources
```

Only show technologies supported by the analysis.

## Technology evidence

List:

```text
Technology
Why relevant
Evidence
Maturity
```

---

# 18. SCREEN 10 — RESEARCH & EVIDENCE

## Route

```text
/analyses/:id/research
```

## Header

Title:

> Research & Evidence

Subtitle:

> Explore the sources used to support this analysis.

## Search

```text
Search evidence...
```

Filters:

```text
All
GitHub
Web
Research
User Feedback
Other
```

## Evidence list

Each item:

```text
Source badge
Title

Short excerpt...

Why relevant:
Supports competition analysis

Retrieved:
18 Sep 2026

Relevance:
High

[Open Source]
```

## Evidence side panel

When selected:

```text
Evidence Details

Finding:
Existing interview platforms provide
automated mock interview feedback.

Source:
Example source

Retrieved:
18 Sep 2026

Excerpt:
"..."

Used by:
Competition Agent
Synthesis Agent

Confidence:
High
```

This screen is critical for trust and academic evaluation.

---

# 19. SCREEN 11 — RISKS & RECOMMENDATIONS

## Route

```text
/analyses/:id/recommendations
```

## Header

Title:

> Risks & Recommendations

## Risk matrix

Categories:

```text
Technical
Market
Competition
Data
Privacy / Security
Operational
```

Severity:

```text
Low
Medium
High
```

Each risk:

```text
Risk
High competitor overlap

Severity
High

Evidence
12 sources

Why it matters
...

Mitigation
...
```

## Recommended Differentiation

Large cards:

```text
Recommendation 01

Focus on personalized interview feedback
rather than generic question generation.

Evidence:
7 sources

Confidence:
High
```

## Suggested MVP

Show prioritized features:

```text
P0 — Must have
Personalized interview analysis

P0 — Must have
Technical question generation

P1 — Should have
Progress tracking

P2 — Later
Voice interview mode
```

Do not use "AI thinks you should..." language. Use professional product language.

---

# 20. SCREEN 12 — OPPORTUNITY MATRIX

## Route

```text
/opportunity-matrix
```

Preserve the existing screen concept but modernize the data model.

## Header

Title:

> Opportunity Matrix

Subtitle:

> Compare analyzed ideas across opportunity and feasibility signals.

## Filter bar

```text
All industries
All statuses
All confidence levels
Date range

Export Matrix
```

## Scatter plot

X-axis:

> Technical Feasibility

Y-axis:

> Opportunity Evidence

Each point represents an analyzed idea.

Point colors:

```text
Orange = selected/current idea
Purple = other ideas
Gray = insufficient evidence
```

## Right panel

Selected idea:

```text
AI Interview Coach

Opportunity
Strong

Feasibility
High

Novelty
Medium

Competition
High

Confidence
84%

Evidence
37 sources
```

## Quadrants

Use labels such as:

```text
High opportunity / High feasibility
High opportunity / Lower feasibility
Lower opportunity / High feasibility
Lower opportunity / Lower feasibility
```

Avoid presenting the quadrant as a guaranteed business-success prediction.

---

# 21. SCREEN 13 — MY IDEAS

## Route

```text
/ideas
```

This replaces the existing "Idea Workspace" concept with a stronger idea portfolio.

## Header

Title:

> My Ideas

Subtitle:

> Manage ideas, analyses, and validation progress.

CTA:

> + New Idea

## Tabs

```text
All Ideas
Draft
Analyzing
Validated
Needs Review
Archived
```

## Idea cards

Example:

```text
AI Interview Coach

AI/ML
Validated

Market Demand
Strong

Novelty
Medium

Competition
High

Feasibility
High

Last analyzed
2 hours ago

View Analysis →
```

Use orange status for active actions, green for completed, amber for review.

---

# 22. SCREEN 14 — IDEA WORKSPACE DETAIL

## Route

```text
/ideas/:id
```

## Header

```text
My Ideas / AI Interview Coach

AI Interview Coach
AI/ML

[Run New Analysis]
[Edit Idea]
```

## Sub-navigation

```text
Overview
Analyses
Competition
Market
Research
Notes
```

## Overview

```text
Idea description

Current validation status

Latest analysis

Key signals

Recent evidence

Activity
```

## Analysis history

Timeline:

```text
18 Sep 2026
Deep Research
Completed

12 Sep 2026
Standard Analysis
Completed

02 Sep 2026
Initial Analysis
Completed
```

Each version can be opened.

---

# 23. SCREEN 15 — DATA SOURCES

## Route

```text
/data-sources
```

This is an operational/data transparency page, not the primary user journey.

## Header

Title:

> Data Sources

Subtitle:

> Monitor the sources that power DIME's intelligence layer.

## Source cards

```text
GitHub API
Healthy

Last successful ingestion
18 Sep 2026

Documents indexed
8,213

[View Details]
```

```text
Web Crawling
Healthy

Last successful crawl
18 Sep 2026

Pages indexed
1,482
```

```text
Research
Healthy

Documents
4,231
```

## Source status

```text
Healthy
Degraded
Unavailable
```

## Source detail

Show:

- source name
- type
- status
- last attempt
- last successful ingestion
- record count
- error count
- freshness
- ingestion history

## Benchmark data

Separate section:

> Legacy Benchmark Datasets

Explain:

> These datasets are retained for academic comparison and baseline evaluation. They are not the primary live intelligence layer.

---

# 24. SCREEN 16 — NOTES

## Route

```text
/notes
```

Preserve the existing Sticky Board concept but connect notes to ideas.

## Header

Title:

> Notes

Subtitle:

> Capture research observations, decisions, and follow-up items.

CTA:

> + New Note

## Search

```text
Search notes by title or content...
```

## Categories

```text
All
Market Research
Competition
Technical
User Feedback
Design Ideas
General
```

## Note card

```text
Market Research

Interview candidates want more
personalized feedback.

Updated:
18 Sep 2026

Related idea:
AI Interview Coach

Pin
Edit
Delete
```

Notes may optionally reference evidence.

---

# 25. SCREEN 17 — SETTINGS

## Route

```text
/settings
```

Use left settings navigation:

```text
Profile
Account
Preferences
Analysis Settings
Data & Sources
Security
```

## Profile

Fields:

- Name
- Email
- Avatar

## Analysis Settings

```text
Default analysis depth
Standard

Preferred sources
GitHub
Web
Research

Default confidence threshold
```

## Security

```text
Change password
Active sessions
Logout all sessions
```

Keep this screen simple.

---

# 26. SCREEN 18 — EMPTY STATES

Create deliberate empty states.

## No ideas

```text
No ideas yet

Start with a product idea and DIME
will investigate the market, competition,
technical feasibility, and evidence.

[ + Validate My First Idea ]
```

## No analyses

```text
No analysis has been run yet.

[ Analyze Idea ]
```

## No competitors

```text
No relevant competitors found

This does not prove that the market has no competitors.
Try broadening the research scope.
```

## No evidence

```text
Insufficient evidence

DIME could not retrieve enough reliable evidence
to confidently assess this dimension.
```

Never display fake data to make the UI look populated.

---

# 27. SCREEN 19 — LOADING / SKELETON STATES

Every major screen needs skeleton loading.

Do not use a full-screen spinner unless absolutely necessary.

Example:

```text
┌──────────────────────────┐
│ █████████████████        │
│ ██████████               │
│                          │
│ ███████  ███████         │
│                          │
│ █████████████████████    │
└──────────────────────────┘
```

For analysis:

Use the progress stepper rather than generic loading.

---

# 28. SCREEN 20 — ERROR / PARTIAL ANALYSIS

The system must support partial failure.

Example:

```text
Analysis completed with limited evidence

✓ Idea Understanding
✓ Market Analysis
⚠ Competition
✓ Technical Feasibility
✓ Recommendations

Competition research was unavailable
because the external source could not be reached.

Your other analysis sections remain available.

[Retry Competition Research]
```

Do not fail the entire report because one source fails.

---

# 29. SCREEN 21 — SOURCE / EVIDENCE MODAL

Any finding in the report can have a "View evidence" action.

Clicking it opens a modal/drawer:

```text
Evidence

Finding:
Several existing platforms provide
automated technical interview practice.

Sources: 4

────────────────────────

Source 1

GitHub
Repository title

Relevant excerpt:
"..."

Retrieved:
18 Sep 2026

Relevance:
0.91

[Open Source]
```

This should be a reusable component throughout DIME.

---

# 30. SCREEN 22 — CONFIDENCE COMPONENT

Whenever DIME displays a conclusion, use:

```text
Confidence: High
Evidence: 18 sources
Updated: 18 Sep 2026
```

or:

```text
Confidence: Medium
Evidence: 6 sources
Updated: 18 Sep 2026
```

Confidence must never visually imply statistical certainty unless a validated statistical model exists.

---

# 31. SCREEN 23 — NOTIFICATIONS

Header notification icon opens:

```text
Notifications

Analysis completed
AI Interview Coach
2 min ago

New evidence found
AI Interview Coach
1 hour ago

Source ingestion failed
GitHub
3 hours ago
```

Unread badge is orange/red as appropriate.

---

# 32. SCREEN 24 — EXPORT REPORT

Clicking "Export Report" opens:

```text
Export Analysis

Format

○ PDF
○ Markdown
○ JSON

Include:
☑ Executive Summary
☑ Scores
☑ Competition
☑ Market Intelligence
☑ Technical Feasibility
☑ Evidence
☑ Recommendations

[Export Report]
```

---

# 33. RESPONSIVE DESIGN

## Mobile sidebar

Transform sidebar into drawer.

Top:

```text
☰   DIME                     🔔
```

## Mobile analysis

Use:

```text
Overview
Market
Competition
Technical
Research
Recommendations
```

as horizontally scrollable tabs.

## Mobile cards

One card per row.

## Mobile charts

Charts may be horizontally scrollable.

## Mobile competitor matrix

Convert table into stacked competitor cards.

---

# 34. Accessibility

Required:

- keyboard navigable controls
- visible focus states
- sufficient text contrast
- semantic buttons
- aria labels for icon-only buttons
- chart labels and accessible summaries
- do not rely on color alone
- tooltips must be keyboard accessible
- form errors must be explicit

---

# 35. Interaction Rules

## Primary CTA

Use orange.

Example:

```text
+ New Idea Analysis
Analyze My Idea
Generate Report
Export Report
```

## Destructive actions

Use red only for:

```text
Delete
Remove
Revoke
```

## AI activity

Use subtle purple:

```text
AI reasoning
Research agent active
Synthesis in progress
```

Do not use animated neon effects.

## Hover

Use subtle:

- background change
- border change
- elevation

Avoid dramatic scaling.

---

# 36. Chart Rules

Charts should look like the existing DIME dashboard.

Use:

- white chart cards
- thin grid lines
- dark labels
- restrained colors
- rounded bars
- simple legends

Avoid:

- 3D charts
- excessive gradients
- glowing charts
- dark dashboard backgrounds
- unnecessary animation

---

# 37. Analysis Status System

Use:

```text
Draft
Queued
Planning
Researching
Retrieving
Analyzing
Generating Report
Completed
Partial
Failed
```

Colors:

```text
Draft        gray
Queued       blue
Planning     purple
Researching  purple
Retrieving   cyan
Analyzing    purple
Generating   purple
Completed    green
Partial      amber
Failed       red
```

---

# 38. Source Type Badges

Use small outlined badges:

```text
GITHUB
WEB
RESEARCH
APP REVIEW
USER FEEDBACK
DATASET
```

They should be compact and not dominate the page.

---

# 39. AI Agent Activity UI

The user should see AI activity without turning the app into an agent-chat interface.

Example:

```text
Analysis Activity

✓ Planner
Idea decomposed into 5 research dimensions

✓ Research Agent
12 technical sources found

● Competition Agent
Searching related products...

○ Synthesis
Waiting for evidence
```

No chat bubbles.

No humanoid AI avatars.

No "AI magic" visual effects.

---

# 40. Report Design Principles

The report must be:

- scannable
- evidence-backed
- modular
- explainable
- comparable
- exportable

Each major conclusion should visually contain:

```text
Conclusion
Interpretation
Confidence
Evidence count
Last updated
```

Example:

```text
Competition
High

Several established solutions overlap with
the proposed feature set.

Confidence
91%

Evidence
22 sources

Updated
18 Sep 2026

[View Evidence]
```

---

# 41. What NOT to Generate in Stitch

Do not generate:

- a purple-first AI SaaS dashboard
- dark-mode-only UI
- futuristic neon UI
- giant gradients
- floating 3D AI objects
- chatbot as the main homepage
- excessive glassmorphism
- excessive rounded pill UI
- random illustrations
- huge hero sections inside the authenticated application
- unrelated finance-style design
- generic analytics template disconnected from DIME
- old TF-IDF/Sentiment/Keyword chips as the primary methodology
- static fake datasets presented as live intelligence

---

# 42. Existing UI Elements That MUST Be Preserved

From the current screenshots, preserve:

1. DIME logo position
2. left sidebar structure
3. top global search
4. user profile area
5. orange active navigation
6. white card surfaces
7. thin borders
8. compact analytics cards
9. orange primary buttons
10. purple/cyan secondary chart colors
11. clean white workspace
12. Settings at bottom of sidebar
13. existing spacing density
14. overall professional analytics appearance

The redesign should feel like:

> **DIME V2**

not:

> **a completely different product.**

---

# 43. Stitch Master Prompt

Use the following prompt when generating the complete application:

```text
Design the complete DIME — AI Product Intelligence & Idea Validation Platform.

IMPORTANT:
Use the existing DIME screenshots as the visual source of truth.

Preserve the existing orange + white analytics dashboard identity:
- white sidebar
- white top navigation
- very light gray application background
- dark navy typography
- orange active navigation
- orange primary buttons
- white bordered cards
- subtle shadows
- rounded 12–14px cards
- blue-gray secondary text
- purple and cyan only for secondary data visualization and AI states
- green/amber/red for semantic states

Do NOT redesign the product into a generic purple AI SaaS dashboard.

The application is a decision-support product, not a chatbot.

Create these pages:

1. Login
2. Register
3. Dashboard
4. Validate Idea
5. Analysis Progress
6. Analysis Overview
7. Market Intelligence
8. Competition Intelligence
9. Technical Feasibility
10. Research & Evidence
11. Risks & Recommendations
12. Opportunity Matrix
13. My Ideas
14. Idea Workspace Detail
15. Data Sources
16. Notes
17. Settings
18. Notifications
19. Export Report modal
20. Empty/loading/error/partial-analysis states

Use a consistent authenticated shell:
- 268px left sidebar
- top navigation bar
- global search
- user profile
- Settings at sidebar bottom

Main navigation:
Dashboard
Validate Idea
Market Intelligence
Competition
Research & Evidence
Opportunity Matrix

Workspace:
My Ideas
Notes

The core product journey is:

Dashboard → Validate Idea → Analysis Progress → Evidence-backed Analysis Report.

The report should contain:
- Executive Summary
- Idea Understanding
- Novelty
- Competition
- Market Demand
- Technical Feasibility
- Risks
- Differentiation
- Suggested MVP
- Evidence
- Confidence

Use evidence cards, confidence badges, source badges, competitor cards, charts, feature comparison matrices, timelines, and progress indicators.

Avoid fake data being presented as factual live information. Use realistic placeholder values only as clearly illustrative UI content.

The design must be desktop-first but responsive on tablet and mobile.

Use Inter typography.

Primary brand color:
#EA580C

Primary text:
#0F172B

Background:
#F8FAFC

Surface:
#FFFFFF

Border:
#E2E8F0

AI accent:
#8B5CF6

Data accent:
#06B6D4

Success:
#16A34A

Warning:
#D97706

Danger:
#DC2626

The visual result should look like a polished production analytics application that evolved directly from the existing DIME website.
```

---

# 44. Recommended Stitch Generation Order

Do **not** ask Stitch to generate 20 unrelated screens independently.

Generate in this order:

## Batch 1 — Design system + shell

```text
1. Global shell
2. Sidebar
3. Header
4. Buttons
5. Cards
6. Tabs
7. Badges
8. Charts
```

## Batch 2 — Core workflow

```text
9. Dashboard
10. Validate Idea
11. Analysis Progress
12. Analysis Overview
```

## Batch 3 — Intelligence

```text
13. Market Intelligence
14. Competition
15. Technical Feasibility
16. Research & Evidence
17. Risks & Recommendations
```

## Batch 4 — Workspace

```text
18. Opportunity Matrix
19. My Ideas
20. Idea Workspace
21. Notes
```

## Batch 5 — Supporting screens

```text
22. Data Sources
23. Settings
24. Login
25. Register
26. Notifications
27. Export modal
```

## Batch 6 — States

```text
28. Loading
29. Empty
30. Error
31. Partial analysis
32. Insufficient evidence
33. Mobile versions
```

This ordering will give Stitch a much more consistent design system than asking it to invent each page independently.

---

# 45. Final Screen Architecture

The complete application should conceptually become:

```text
DIME
│
├── Dashboard
│
├── Validate Idea
│     ├── Idea Form
│     └── Analysis Progress
│
├── Analysis
│     ├── Overview
│     ├── Market Intelligence
│     ├── Competition
│     ├── Technical Feasibility
│     ├── Research & Evidence
│     └── Risks & Recommendations
│
├── Opportunity Matrix
│
├── My Ideas
│     └── Idea Workspace
│           ├── Overview
│           ├── Analyses
│           ├── Market
│           ├── Competition
│           ├── Research
│           └── Notes
│
├── Data Sources
│
├── Notes
│
└── Settings
      ├── Profile
      ├── Preferences
      ├── Analysis Settings
      └── Security
```

---

# 46. Most Important Product Rule

The old DIME UI was organized around:

```text
datasets
↓
statistics
↓
similarity
↓
dashboard
```

The new DIME UI must be organized around:

```text
IDEA
↓
RESEARCH
↓
EVIDENCE
↓
INTELLIGENCE
↓
DECISION SUPPORT
```

The interface should therefore always answer:

> **What did DIME find?**

> **Why does it matter?**

> **What evidence supports it?**

> **How confident is the conclusion?**

> **What should the builder investigate or build next?**

This is the central UX principle for the new DIME.
