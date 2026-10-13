# DESIGN.md
# DIME — AI Product Intelligence & Idea Validation Platform
## Production UI/UX Design Specification — Existing Orange & White Theme

> **Purpose:** This document defines how the existing DIME product should evolve from the current static analytics dashboard into the AI Product Intelligence & Idea Validation Platform described in `PRD.md`.
>
> **Critical requirement:** The existing DIME visual language shown in the supplied website screenshot is the source of truth for the product theme. The new product must **extend the existing UI, not replace it with a new generic SaaS/AI theme**.

---

# 1. Design Direction

## 1.1 Product

**DIME — Data Driven Idea and Market Evaluation**

DIME is evolving into an evidence-backed AI product intelligence platform that helps users understand:

- whether an idea is novel
- what existing solutions and competitors exist
- what market/user pain signals exist
- whether the idea is technically feasible
- what risks exist
- how the idea should be differentiated
- what an MVP should contain
- what evidence supports each conclusion

The PRD explicitly positions the product as a web-based decision-support application rather than a generic chatbot. The interface must therefore prioritize **decision making, evidence, analysis, comparison, and actionable recommendations**.

---

# 2. Existing Website Theme — SOURCE OF TRUTH

The supplied screenshot establishes the current DIME visual language.

## 2.1 Core Visual Characteristics

The existing website uses:

- white application shell
- orange primary brand color
- dark navy/near-black typography
- very light gray page background
- white bordered cards
- rounded cards
- compact left sidebar
- top search/navigation bar
- orange filled active navigation item
- restrained blue-gray secondary text
- small semantic colored indicators
- purple and cyan data visualization accents
- clean enterprise analytics appearance

The new UI must preserve these characteristics.

## 2.2 Dominant Brand Color

The screenshot's dominant orange is:

```text
#EA580C
```

Use this as the primary DIME brand color.

This orange is visually present in:

- DIME logo mark
- active sidebar item
- primary CTA
- important call-to-action states
- selected/highlighted product actions
- high-potential chart category
- insight/pro-tip card

Do **not** replace this with the previous generic blue-first palette.

---

# 3. Color System

## 3.1 Primary Brand Palette

| Token | Hex | Usage |
|---|---|---|
| `brand-900` | `#9A3412` | pressed/dark orange states |
| `brand-700` | `#C2410C` | dark brand emphasis |
| `brand-600` | `#EA580C` | primary brand / main CTA |
| `brand-500` | `#F97316` | hover / lighter brand action |
| `brand-100` | `#FFEDD5` | selected backgrounds / soft orange |
| `brand-50` | `#FFF7ED` | subtle orange surfaces |

### Primary rule

```text
#EA580C = DIME's primary interactive color.
```

The product should immediately look like the existing screenshot.

---

# 4. Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `neutral-950` | `#0F172B` | primary headings / strong text |
| `neutral-900` | `#111827` | major text |
| `neutral-700` | `#334155` | body text |
| `neutral-600` | `#64748B` | secondary text |
| `neutral-500` | `#94A3B8` | placeholders / metadata |
| `neutral-400` | `#CBD5E1` | disabled / subtle UI |
| `neutral-300` | `#E2E8F0` | borders |
| `neutral-200` | `#E5E7EB` | dividers / input borders |
| `neutral-100` | `#F1F5F9` | subtle surfaces |
| `neutral-50` | `#F8FAFC` | application/page background |
| `white` | `#FFFFFF` | cards / navigation / modals |

The screenshot uses a white shell with a very light gray main content background. Preserve that relationship.

---

# 5. Semantic Colors

Semantic colors must remain secondary to the orange brand.

| Meaning | Hex | Usage |
|---|---|---|
| Success | `#16A34A` | completed, positive, healthy |
| Warning | `#D97706` | caution, medium risk |
| Danger | `#DC2626` | high risk, failure, destructive |
| Info | `#2563EB` | informational state |
| AI | `#8B5CF6` | AI activity only |
| Data/Cyan | `#06B6D4` | charts / secondary analytics |

## 5.1 Important Rule

Do not turn the entire product purple because it contains AI.

Use:

```text
Orange → DIME/product action
Purple → AI is acting/speaking
Cyan → data visualization
Green → positive result
Amber → warning
Red → risk/error
Blue → informational
```

This creates a semantic visual language.

---

# 6. Data Visualization Palette

The existing screenshot uses purple and cyan in the Opportunity Mix visualization.

Preserve this visual pattern.

Recommended:

```text
High Potential     #EA580C
Promising          #8B5CF6
Needs Validation   #06B6D4
Insufficient Data  #94A3B8
Risk               #DC2626
```

For competitor comparison:

```text
Primary / User Idea     #EA580C
Competitor A            #8B5CF6
Competitor B            #06B6D4
Competitor C            #2563EB
Competitor D            #16A34A
```

Never rely on color alone. Use:

- labels
- legends
- icons
- percentages
- values
- tooltips

---

# 7. Logo

Use the existing DIME logo.

Do not create a new logo for Version 1 or Version 2.

The logo treatment shown in the screenshot should remain visually dominant:

```text
Orange symbol + dark DIME wordmark
```

Recommended placement:

```text
Sidebar top-left
```

Approximate dimensions:

```text
Logo mark: 24–28px
Wordmark: 18–20px
Sidebar logo area height: 64–72px
```

Do not place a large AI icon beside the DIME logo.

---

# 8. Typography

## 8.1 Typeface

Use:

```text
Inter
```

for the complete application UI.

The screenshot has a clean modern sans-serif appearance. Inter preserves that style.

Optional report-only typography:

```text
Lora
```

for long-form generated reports if a document/editorial appearance is required.

Financial numbers:

```text
IBM Plex Mono
```

may be used for dense numeric tables.

---

# 9. Typography Scale

| Component | Size | Weight | Line Height |
|---|---:|---:|---:|
| Landing hero | 40–48px | 700 | 48–56px |
| Page H1 | 28–32px | 700 | 36–40px |
| Section H2 | 20–24px | 600–700 | 28–32px |
| Card title | 16–18px | 600 | 24–26px |
| Body | 14px | 400 | 20px |
| Body large | 16px | 400 | 24px |
| Label | 12–13px | 500–600 | 18px |
| Caption | 11–12px | 400–500 | 16px |
| KPI | 30–40px | 700 | 36–44px |

---

# 10. Existing Application Shell

The current screenshot should remain the reference shell.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ DIME        │ Search ideas, markets or datasets...      ☼  🔔  User Avatar │
├─────────────┼───────────────────────────────────────────────────────────────┤
│             │                                                               │
│ Dashboard   │ Page Header                                      Primary CTA   │
│ Idea        │                                                               │
│ Analysis    │ KPI / Overview Cards                                         │
│ Market      │                                                               │
│ Analysis    │                                                               │
│ Opportunity │ Analytics                Recent Activity                      │
│ Matrix      │                                                               │
│ Dataset     │                                                               │
│ Explorer    │                                                               │
│             │                                                               │
│ WORKSPACE   │                                                               │
│ Idea        │                                                               │
│ Workspace   │                                                               │
│ Notes       │                                                               │
│             │                                                               │
│             │                                                               │
│ Settings    │                                                               │
└─────────────┴───────────────────────────────────────────────────────────────┘
```

The left sidebar and top header should remain familiar even as the product becomes substantially more capable.

---

# 11. Sidebar Specification

## 11.1 Width

Desktop:

```text
268px
```

The supplied screenshot uses a wide enough sidebar to keep labels comfortable.

Recommended range:

```text
248–280px
```

## 11.2 Sidebar

```text
Background: #FFFFFF
Border-right: 1px solid #E5E7EB
```

## 11.3 Navigation Item

Default:

```text
Text: #334155
Icon: #94A3B8
Background: transparent
```

Hover:

```text
Background: #FFF7ED
Text: #C2410C
Icon: #EA580C
```

Active:

```text
Background: #EA580C
Text: #FFFFFF
Icon: #FFFFFF
Border radius: 10–12px
```

The active navigation state should look like the orange Dashboard item in the supplied screenshot.

## 11.4 Active State Rule

Do not use:

- blue active backgrounds
- purple active backgrounds
- gradients

Use the DIME orange.

---

# 12. Existing Navigation Tabs — Preserve Them

The current navigation structure shown in the website must remain the foundation.

## Main Navigation

1. Dashboard
2. Idea Analysis
3. Market Analysis
4. Opportunity Matrix
5. Dataset Explorer

## Workspace

6. Idea Workspace
7. Notes

## Bottom

8. Settings

These should not be removed merely because new AI functionality is being introduced.

Instead, their functionality should evolve.

---

# 13. Navigation-to-PRD Mapping

| Existing Tab | New Product Responsibility |
|---|---|
| Dashboard | Overall product intelligence overview |
| Idea Analysis | Full AI idea validation workflow |
| Market Analysis | Market pain, demand, trends, user signals |
| Opportunity Matrix | Novelty × competition × demand opportunity |
| Dataset Explorer | Sources, documents, reviews, repositories, indexed evidence |
| Idea Workspace | Idea/project organization and analysis history |
| Notes | User research notes and analyst annotations |
| Settings | Profile, data sources, preferences, integrations |

This preserves the existing mental model while implementing the PRD.

---

# 14. Dashboard — Redesigned According to PRD

The existing Dashboard is already visually close to the desired direction.

Keep:

- "Idea Validation Overview"
- metric cards
- Opportunity Mix Analytics
- Recent Activity
- Market Trends
- Quick Insights
- New Idea Analysis CTA

But make the data dynamic.

## Dashboard Header

Title:

```text
Idea Validation Overview
```

Subtitle:

```text
Monitor novelty, market pain, competition, and problem signals across analyzed ideas.
```

Primary CTA:

```text
+ New Idea Analysis
```

CTA:

```text
#EA580C
```

---

# 15. Dashboard KPI Cards

Replace static values with live values from the backend.

Recommended cards:

### Average Novelty Score

Icon:

```text
Lightbulb
```

Value:

```text
0.54
```

Secondary text:

```text
Based on validated analyses in your workspace
```

### Average Market Pain

Icon:

```text
TrendingUp
```

### Top Problem Keywords

Display:

- chips
- keyword frequency
- source count

### Ideas Analyzed

Display:

- total analyses
- date range
- completion status

Additional optional KPI cards:

- Direct Competitors Found
- Evidence Items
- High-Risk Ideas
- Research Confidence

---

# 16. KPI Card Design

```text
Background: #FFFFFF
Border: 1px solid #E5E7EB
Radius: 16px
Padding: 22–24px
```

Icon container:

```text
32–40px
Radius: 10px
```

Use a very light semantic background.

Examples:

```text
Orange → #FFF7ED
Purple → #F5F3FF
Cyan → #ECFEFF
Green → #F0FDF4
```

Do not make entire cards saturated.

---

# 17. Dashboard Analytics

## Opportunity Mix Analytics

Preserve the existing donut chart pattern.

Categories:

```text
High Potential
Promising
Needs Validation
```

Add:

- percentage
- number of ideas
- trend vs previous period
- clickable category

Clicking a category filters the idea list.

---

# 18. Market Trends Card

Existing right-side card should evolve from static:

```text
AI/ML opportunity landscape
Growth: 71%
Sample: 2 ideas
```

to dynamic:

```text
AI/ML opportunity landscape

Demand momentum        71%
Trend                   Rising
Evidence                 42 sources
Updated                  18 min ago
```

Include:

- trend line
- source count
- freshness
- confidence

---

# 19. Quick Insights

Keep the orange "PRO TIP" card style because it strongly belongs to the existing website visual language.

Use it for:

- actionable insight
- recommendation
- market signal
- differentiation opportunity

Example:

```text
PRO TIP

Competitors strongly cover generic AI interview
coaching, but engineering-specific system design
feedback remains less saturated.

Read Insight →
```

Use:

```text
Background: #EA580C
Text: #FFFFFF
```

Do not use purple for this card.

---

# 20. Recent Activity

The current activity timeline should become connected to actual analysis jobs.

Example:

```text
✓ Idea Validated
DIME · AI Interview Coach
2 minutes ago

✓ Analysis Completed
AI Resume Analyzer
8 minutes ago

! Competition Analysis Partial
Market Intelligence Platform
12 minutes ago
```

Activity types:

- Analysis Started
- Planning Completed
- Research Completed
- Competition Completed
- Market Analysis Completed
- Report Generated
- Analysis Partial
- Analysis Failed
- Note Updated

---

# 21. Idea Analysis — Primary Product Screen

This is the most important new screen because the PRD defines idea validation as the core product workflow.

## Page Structure

```text
Idea Analysis
────────────────────────────────────────────────────────

Idea Header
[Idea Name]
[Domain] [Target Users] [Status]

Overall Assessment
[Novelty] [Competition] [Demand] [Feasibility] [Risk]

AI Executive Summary
────────────────────────────────────────────────────────

Novelty Analysis
Competition Analysis
Market Pain
Technical Feasibility
Risk Analysis
Recommendations
Suggested MVP
Evidence

Agent Activity
```

---

# 22. Idea Header

Display:

```text
Idea name
Short description
Domain
Target users
Created date
Last analyzed
Analysis status
```

Actions:

```text
Re-analyze
Compare
Export Report
Add Note
```

Primary action:

```text
#EA580C
```

---

# 23. Overall Assessment

Use a five-dimension score grid:

```text
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│ Novelty    │ Competition│ Demand     │ Feasibility│ Risk       │
│ 0.72       │ Medium     │ High       │ High       │ Low        │
│ Good       │ 0.41       │ 0.78       │ 0.83       │ 0.22       │
└────────────┴────────────┴────────────┴────────────┴────────────┘
```

Each dimension must include:

- score
- interpretation
- confidence
- evidence count
- last updated

Do not show an unsupported "probability of success."

---

# 24. Score Visualization

Use a combination of:

- numeric score
- horizontal progress bar
- label
- confidence indicator

Example:

```text
Novelty
0.72  ━━━━━━━━━━━━━━━░░░
High
Confidence: 0.81
18 evidence items
```

Brand orange should represent the user's/product assessment.

Semantic colors should represent meaning where appropriate.

---

# 25. AI Executive Summary

The AI summary should not look like a chatbot.

It should look like an analyst's decision brief.

Structure:

```text
AI Assessment

The idea addresses a validated pain point in...
Existing solutions primarily focus on...
The strongest differentiation opportunity is...

Confidence: High
Evidence: 27 sources
```

AI activity indicator:

```text
#8B5CF6
```

Evidence/citation actions:

```text
#EA580C
```

---

# 26. Novelty Analysis

The PRD requires semantic novelty rather than basic text overlap.

UI sections:

### Semantic Similarity

```text
Closest existing concepts
```

### Differentiation

```text
Existing feature
Your idea
Difference
```

### Novelty interpretation

```text
High / Medium / Low
```

### Evidence

Show source cards.

---

# 27. Competitor Analysis

## Competitor Cards

Each card:

```text
Competitor Logo / Icon
Name
Type
Description

Feature overlap      68%
Semantic relevance    82%
Activity              High

Key features
• ...
• ...
• ...

Source
Open →
```

Competitor type:

- Direct
- Indirect
- Related
- Research implementation

Use small badges.

---

# 28. Competition Matrix

Recommended matrix:

```text
                   User Idea   Competitor A   Competitor B
AI Research             ✓           ✓              ✓
Market Signals          ✓           ✕              ✓
Evidence Citations      ✓           ✕              ✕
MVP Recommendations     ✓           ✕              ✕
```

User idea column:

```text
#EA580C
```

Competitor columns use secondary visualization colors.

---

# 29. Market Analysis

This tab should directly implement the PRD's market pain requirements.

Sections:

1. Market demand
2. User pain signals
3. Feature requests
4. Sentiment
5. Topic clusters
6. Trend direction
7. Evidence volume
8. Market gaps

---

# 30. Market Pain Visualization

Use topic cards:

```text
Pricing                 28%
Performance             21%
Missing Feature         18%
Support                 13%
Privacy                  9%
Other                   11%
```

Clicking a topic opens evidence.

Do not present topic percentages without source/sample context.

---

# 31. Sentiment Visualization

Use:

```text
Positive     54%
Neutral      27%
Negative     19%
```

Add:

```text
Sample size
Source
Date range
Model
Confidence
```

The interface must make it clear that sentiment is an analytical model output.

---

# 32. Market Trend Visualization

Display:

```text
Interest
│             ╭───╮
│        ╭────╯   ╰──
│   ╭────╯
│───╯
└──────────────────── Time
```

Metadata:

```text
Trend: Rising
Confidence: Medium
Data freshness: 2h
```

V2 can expand this into forecasting.

---

# 33. Opportunity Matrix

The existing Opportunity Matrix should become one of DIME's signature views.

Axes:

```text
Y = Market Demand
X = Competitive Saturation
```

Bubble size:

```text
Evidence Volume
```

Bubble color:

```text
Opportunity Category
```

User idea:

```text
Orange #EA580C
```

Competitors:

```text
Purple/Cyan/Blue
```

Quadrants:

```text
High Demand + Low Competition = High Opportunity
High Demand + High Competition = Crowded
Low Demand + Low Competition = Emerging
Low Demand + High Competition = Avoid
```

---

# 34. Dataset Explorer

The current Dataset Explorer should evolve into the evidence/data hub.

Sources can include:

### V1

- GitHub
- legitimate app-review data
- controlled public web sources
- existing benchmark datasets

### V2

- Product Hunt
- arXiv
- Reddit where authorized
- Google Trends / appropriate trend source

---

# 35. Dataset Explorer UI

Use tabs:

```text
All
GitHub
Reviews
Web
Research
Benchmark
```

Table columns:

```text
Source
Type
Records
Last Updated
Status
Coverage
```

Example:

```text
GitHub
Repository
12,482
8 min ago
Healthy
92%
```

---

# 36. Source Freshness

Every source card should expose:

```text
Last successful ingestion
Last attempt
Record count
Error count
Status
```

Status:

```text
Healthy
Refreshing
Partial
Failed
Stale
```

Use semantic colors.

---

# 37. Evidence Viewer

Evidence must be a first-class experience.

Evidence card:

```text
GitHub
Repository: example/project

Relevant evidence

"...relevant excerpt..."

Retrieved:
14 Sep 2026, 13:42

Evidence type:
Competitor feature

Confidence:
High

[Open Source]
```

Use orange for actions, not for the entire card.

---

# 38. Evidence Drawer

Clicking an evidence item opens a right drawer.

Drawer contents:

```text
Evidence Details

Source
Title
URL
Source type
Published date
Retrieved date
Content excerpt
Relevance score
Confidence
Associated finding
Associated score
```

This reinforces provenance.

---

# 39. AI Agent Activity

The PRD requires a small multi-agent system.

Do not expose agents as independent "characters."

Instead show them as an execution pipeline.

```text
Planner
   ↓
Research
   ↓
Competition
   ↓
Synthesis / Report
```

---

# 40. Agent Activity Component

Example:

```text
AI Analysis

● Planner                 Completed
● Research                Completed
● Competition             Running
○ Report                  Waiting
```

Agent identity:

```text
Planner        #8B5CF6
Research       #2563EB
Competition    #06B6D4
Report         #16A34A
```

The overall AI processing indicator remains purple.

---

# 41. Analysis Progress Screen

When a user starts analysis, show a progress page instead of a blank spinner.

```text
Analyzing your idea

✓ Understanding idea
✓ Building research plan
✓ Retrieving evidence
● Finding competitors
○ Evaluating market pain
○ Assessing feasibility
○ Generating report
```

Show:

```text
Evidence retrieved: 42
Sources checked: 18
Elapsed: 01:24
```

Do not expose chain-of-thought or hidden reasoning.

Only expose safe execution status and concise findings.

---

# 42. Analysis States

Required UI states:

```text
Submitted
Planning
Researching
Retrieving
Analyzing
Generating Report
Completed
Partial
Failed
```

Each state must have:

- label
- icon
- short explanation
- timestamp

---

# 43. Partial Failure UI

If one source fails:

```text
Analysis completed with limited evidence

Competition analysis could not retrieve GitHub
results at this time.

Other analysis sections are available.

[View completed analysis]
[Retry competition]
```

Do not display a generic red "Analysis Failed" if the report is partially usable.

---

# 44. Suggested MVP Screen

The PRD explicitly requires an MVP recommendation.

Show:

```text
Recommended MVP

Build first
✓ Core idea workflow
✓ Evidence retrieval
✓ Primary differentiating feature
✓ Basic analytics

Defer
○ Advanced automation
○ Complex integrations
○ Secondary features

Why?
Based on competitor coverage and technical feasibility.
```

This should be one of the strongest action-oriented cards.

---

# 45. Differentiation Recommendations

Display:

```text
Top Differentiation Opportunities

01  Evidence-backed recommendations
    High opportunity
    12 supporting sources

02  Engineering-specific workflow
    Medium competition
    8 supporting sources

03  Explainable market scoring
    High differentiation
    6 supporting sources
```

Primary action:

```text
Add to MVP
```

---

# 46. Reports

Reports should be accessible from Idea Analysis.

Report structure:

```text
Executive Summary
Idea Understanding
Novelty
Competition
Market Pain
Technical Feasibility
Risk
Differentiation
Recommended MVP
Evidence
Confidence
```

Actions:

```text
Export
Share
Save Version
Compare Versions
```

---

# 47. Report Visual Design

Reports should remain visually consistent with DIME.

Header:

```text
DIME
Idea Validation Report
```

Use:

```text
Orange #EA580C
Navy/black #0F172B
White #FFFFFF
```

Use light gray section separators.

Avoid making the report look like a completely different application.

---

# 48. Idea Workspace

The existing Idea Workspace should become the user's central project organization area.

Show:

```text
My Ideas

+ New Idea

Idea cards
- status
- last analysis
- novelty
- demand
- competition
- feasibility
```

Filters:

```text
All
In Progress
Analyzed
High Potential
Needs Validation
Archived
```

---

# 49. Notes

Notes remain a lightweight research workspace.

Features:

- create note
- edit note
- pin note
- link note to idea
- link note to evidence
- add tags
- search notes

Example:

```text
Market observation

Several competitors solve discovery,
but few provide evidence-backed validation.

Linked to:
AI Product Intelligence Platform
```

---

# 50. Search

Keep the existing global search from the screenshot:

```text
Search ideas, markets or datasets...
```

Expand it to search:

- ideas
- analyses
- competitors
- evidence
- datasets
- reports
- notes

Results should be grouped:

```text
Ideas
Analyses
Evidence
Competitors
Datasets
Notes
```

Keyboard:

```text
Ctrl+K / Cmd+K
```

---

# 51. Notifications

Header notification icon should remain in the existing location.

Notifications:

- analysis completed
- analysis partial
- report ready
- source ingestion failed
- dataset refreshed
- note updated
- workspace event

Use small semantic badges.

Do not use large notification banners for ordinary events.

---

# 52. User Menu

Preserve the current top-right profile pattern.

Show:

```text
Name
Email
Profile
Preferences
Settings
Sign out
```

Keep the profile compact.

---

# 53. Settings

Settings should include:

## Account

- name
- email
- password
- profile

## Workspace

- default workspace
- analysis preferences

## Data Sources

- GitHub connection
- source permissions
- refresh settings

## AI

- model configuration where applicable
- analysis preferences

## Notifications

- analysis completion
- failures
- source updates

---

# 54. Landing Page

The landing page should introduce DIME as an AI product-intelligence platform without abandoning the existing orange/white identity.

## Hero

Headline:

```text
Validate your product idea before you build it.
```

Supporting text:

```text
DIME combines market signals, competitors, technical evidence,
and AI analysis to help you decide what is worth building.
```

Primary CTA:

```text
Start Idea Analysis
```

Secondary:

```text
Explore How It Works
```

---

# 55. Landing Page Color

Use:

```text
Background: #FFFFFF
Primary CTA: #EA580C
Text: #0F172B
Secondary text: #64748B
Soft orange: #FFF7ED
Borders: #E5E7EB
```

The landing page should not become a dark neon AI landing page.

---

# 56. Landing Page Sections

Recommended:

1. Hero
2. Product workflow
3. Intelligence dimensions
4. Interactive dashboard preview
5. Evidence-backed AI explanation
6. Opportunity matrix
7. Example report
8. How it works
9. FAQ
10. CTA
11. Footer

---

# 57. Product Workflow Visual

```text
Your Idea
    ↓
AI Understanding
    ↓
Evidence Retrieval
    ↓
Competition
    ↓
Market Pain
    ↓
Technical Feasibility
    ↓
Evidence-backed Recommendation
```

Each step should use a small icon.

Primary workflow connector:

```text
#EA580C
```

AI step may use:

```text
#8B5CF6
```

---

# 58. Responsive Design

## Desktop

```text
1440px+
```

Use:

- full sidebar
- multi-column dashboard
- right insight rail
- dense analytical tables

## Tablet

```text
768–1439px
```

Use:

- collapsible sidebar
- 2-column cards
- stacked right rail

## Mobile

```text
360–767px
```

Use:

- top compact header
- drawer navigation
- one-column cards
- horizontally scrollable charts/tables
- sticky primary action

---

# 59. Mobile Navigation

Mobile navigation:

```text
Dashboard
Ideas
Market
Opportunity
More
```

"More" opens:

- Dataset Explorer
- Workspace
- Notes
- Settings

Do not attempt to display the complete desktop sidebar on mobile.

---

# 60. Card System

## Standard Card

```text
Background: #FFFFFF
Border: 1px solid #E5E7EB
Radius: 14–16px
Padding: 20–24px
```

## Compact Card

```text
Radius: 12px
Padding: 16px
```

## Insight Card

```text
Orange: #EA580C
Text: #FFFFFF
Radius: 16px
```

## AI Card

```text
Background: #FFFFFF
Border: 1px solid #DDD6FE
AI marker: #8B5CF6
```

---

# 61. Borders and Shadows

Use borders more than shadows.

Default:

```text
1px #E5E7EB
```

Hover:

```text
1px #CBD5E1
```

Shadow:

```text
0 1px 2px rgba(15, 23, 42, 0.04)
```

Elevated modal:

```text
0 12px 40px rgba(15, 23, 42, 0.12)
```

Avoid heavy floating shadows.

---

# 62. Border Radius

Recommended:

```text
Buttons: 8–10px
Inputs: 8–10px
Cards: 14–16px
Modal: 16px
Badges: 9999px
```

The screenshot's rounded-card appearance should remain.

---

# 63. Buttons

## Primary

```text
Background: #EA580C
Text: #FFFFFF
Radius: 8–10px
Height: 40–44px
```

Hover:

```text
#C2410C
```

## Secondary

```text
Background: #FFFFFF
Border: #E5E7EB
Text: #334155
```

## Ghost

```text
Background: transparent
Text: #64748B
```

Hover:

```text
#FFF7ED
Text: #C2410C
```

## Destructive

```text
#DC2626
```

Use only for destructive operations.

---

# 64. Inputs

```text
Background: #FFFFFF
Border: #E2E8F0
Radius: 9px
Height: 42px
```

Focus:

```text
Border: #EA580C
Ring: rgba(234, 88, 12, 0.15)
```

Placeholder:

```text
#94A3B8
```

Error:

```text
Border: #DC2626
```

---

# 65. Badges

Use pill badges.

Examples:

```text
Trending
AI/ML
Direct Competitor
High Potential
Needs Validation
Research
GitHub
Web
```

Default:

```text
Background: #F1F5F9
Text: #475569
```

Brand:

```text
Background: #FFF7ED
Text: #C2410C
```

AI:

```text
Background: #F5F3FF
Text: #7C3AED
```

---

# 66. Tables

Tables must support analytical scanning.

Header:

```text
Background: #F8FAFC
Text: #475569
```

Rows:

```text
Background: #FFFFFF
Border-bottom: #E5E7EB
```

Hover:

```text
#FFF7ED
```

Numbers:

```text
IBM Plex Mono
tabular-nums
```

---

# 67. Charts

Charts should look analytical rather than decorative.

Preferred:

- line chart
- bar chart
- donut chart
- scatter/bubble chart
- radar only when it improves comparison
- heatmap for feature matrices

Avoid 3D charts for core analytics.

The existing screenshot's flat donut chart is preferred.

---

# 68. Loading States

Use skeletons.

Example:

```text
████████████████
██████████
████████████████████
```

Skeleton background:

```text
#E2E8F0
```

AI processing:

```text
small purple activity indicator
```

Do not use an oversized animated AI robot as the primary loading state.

---

# 69. Empty States

Example:

```text
No ideas analyzed yet

Start your first idea analysis to see
novelty, market pain, competition,
and feasibility insights.

[ + New Idea Analysis ]
```

Primary action remains orange.

---

# 70. Error States

Example:

```text
We couldn't retrieve market evidence.

Your other analysis sections are still available.

[Retry]
[Continue with available evidence]
```

Use red only for the error indicator.

---

# 71. Accessibility

Required:

- WCAG-aware contrast
- keyboard navigation
- visible focus states
- semantic HTML
- accessible labels
- tooltip alternatives
- screen-reader status updates
- non-color status indicators

Orange text should not be used on white when contrast is insufficient. Use dark orange or dark text for small text where necessary.

---

# 72. Motion

Keep motion restrained.

Recommended:

```text
Hover: 120–160ms
Panel: 180–220ms
Modal: 200–250ms
Chart: 300–500ms
```

Use motion for:

- state transition
- analysis progress
- chart update
- hover feedback

Do not use constant decorative animation.

---

# 73. Iconography

Use:

```text
Lucide Icons
```

Recommended sizes:

```text
16px → dense controls
18px → navigation
20px → standard UI
24px → major actions
```

Navigation icons should use the same stroke weight.

---

# 74. Recommended Icon Mapping

| Feature | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Idea Analysis | `Lightbulb` |
| Market Analysis | `TrendingUp` |
| Opportunity Matrix | `Grid2X2` |
| Dataset Explorer | `Database` |
| Idea Workspace | `FolderKanban` |
| Notes | `FileText` |
| Settings | `Settings` |
| Search | `Search` |
| Notifications | `Bell` |
| Evidence | `Quote` |
| Competitors | `Users` |
| Research | `BookOpen` |
| Feasibility | `Wrench` |
| Risk | `ShieldAlert` |
| Report | `FileBarChart` |
| AI | `Sparkles` |

---

# 75. Design Tokens

Use a single token source.

```css
:root {
  --dime-brand: #EA580C;
  --dime-brand-dark: #C2410C;
  --dime-brand-light: #F97316;
  --dime-brand-soft: #FFF7ED;
  --dime-brand-pale: #FFEDD5;

  --text-strong: #0F172B;
  --text-primary: #111827;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;

  --border: #E5E7EB;
  --border-strong: #CBD5E1;

  --background: #F8FAFC;
  --surface: #FFFFFF;

  --success: #16A34A;
  --warning: #D97706;
  --danger: #DC2626;
  --info: #2563EB;

  --ai: #8B5CF6;
  --data-cyan: #06B6D4;

  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 16px;
  --radius-pill: 9999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 64px;
}
```

---

# 76. Tailwind Color Mapping

If Tailwind is used:

```js
colors: {
  dime: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    900: "#9A3412"
  },

  ink: {
    950: "#0F172B",
    900: "#111827",
    700: "#334155",
    600: "#64748B",
    500: "#94A3B8"
  },

  ai: "#8B5CF6",
  cyan: "#06B6D4",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#2563EB",

  surface: "#FFFFFF",
  background: "#F8FAFC",
  border: "#E5E7EB"
}
```

Prefer semantic classes:

```text
bg-dime-600
text-dime-700
bg-dime-50
border-border
text-ink-600
bg-ai
```

Do not scatter arbitrary hex values through JSX.

---

# 77. Component Architecture

Recommended frontend component structure:

```text
components/
├── layout/
│   ├── AppShell
│   ├── Sidebar
│   ├── TopNavbar
│   ├── Breadcrumbs
│   └── MobileNavigation
│
├── dashboard/
│   ├── KPIGrid
│   ├── OpportunityMix
│   ├── MarketTrendCard
│   ├── QuickInsight
│   └── RecentActivity
│
├── idea/
│   ├── IdeaHeader
│   ├── IdeaScoreGrid
│   ├── ExecutiveSummary
│   ├── NoveltyAnalysis
│   ├── CompetitorGrid
│   ├── MarketPain
│   ├── Feasibility
│   ├── RiskAnalysis
│   ├── Differentiation
│   └── MVPRecommendation
│
├── evidence/
│   ├── EvidenceCard
│   ├── EvidenceDrawer
│   └── SourceBadge
│
├── agents/
│   ├── AgentPipeline
│   ├── AgentStatus
│   └── AnalysisProgress
│
├── market/
│   ├── TrendChart
│   ├── PainCluster
│   ├── SentimentChart
│   └── MarketSignal
│
├── competition/
│   ├── CompetitorCard
│   ├── FeatureMatrix
│   └── OpportunityMatrix
│
├── data/
│   ├── DatasetTable
│   ├── SourceStatus
│   └── FreshnessBadge
│
└── ui/
    ├── Button
    ├── Card
    ├── Badge
    ├── Input
    ├── Dialog
    ├── Drawer
    ├── Tabs
    ├── Tooltip
    └── Skeleton
```

---

# 78. Existing Tabs — Detailed UX

## Dashboard

Purpose:

> Answer "What is happening across my ideas?"

Primary content:

- KPIs
- opportunity mix
- market trends
- recent activity
- quick insights

## Idea Analysis

Purpose:

> Answer "Should I build this idea?"

Primary content:

- idea understanding
- novelty
- competition
- market pain
- feasibility
- risk
- differentiation
- MVP
- evidence

## Market Analysis

Purpose:

> Answer "Is there evidence that people need this?"

Primary content:

- pain signals
- sentiment
- trends
- topic clusters
- feature requests
- demand evidence

## Opportunity Matrix

Purpose:

> Answer "Where is the best opportunity?"

Primary content:

- competition saturation
- demand
- opportunity bubbles
- quadrant interpretation

## Dataset Explorer

Purpose:

> Answer "Where does DIME's evidence come from?"

Primary content:

- sources
- datasets
- records
- freshness
- ingestion status
- evidence coverage

## Idea Workspace

Purpose:

> Organize ideas and analysis history.

## Notes

Purpose:

> Capture human research and decisions alongside AI findings.

## Settings

Purpose:

> Manage account, workspace, integrations, and preferences.

---

# 79. V1 Design Scope

Version 1 must visually support:

- authentication
- workspace
- idea submission
- dynamic analysis
- GitHub research
- legitimate app-review data
- controlled web evidence
- semantic retrieval
- RAG
- Planner
- Research
- Competition
- Report/Synthesis
- scoring
- evidence
- analysis history

The UI should not imply capabilities that are not implemented.

For example:

If V1 does not yet have Google Trends:

```text
Do not show a fake Google Trends dashboard.
```

Instead show:

```text
Coming in V2
```

only if the roadmap needs to be communicated.

---

# 80. V2 Design Scope

The same visual system should extend to:

- Product Hunt
- arXiv
- Reddit where authorized
- trend data
- automated ingestion
- knowledge graph
- forecasting
- market saturation
- feature-gap detection
- recommendation engine

No new visual theme should be introduced for V2.

---

# 81. V2 Knowledge Graph UI

When Neo4j is introduced, use a dedicated relationship visualization.

Example:

```text
                    ┌───────────────┐
                    │    Research   │
                    └───────┬───────┘
                            │
                            ▼
┌───────────┐       ┌───────────────┐       ┌──────────────┐
│   Idea    │──────▶│  Technology   │──────▶│  Competitor  │
└─────┬─────┘       └───────────────┘       └──────────────┘
      │
      ▼
┌───────────────┐
│  Market Pain  │
└───────────────┘
```

Use:

```text
Idea → Orange
AI/research → Purple
Market → Cyan
Competitor → Blue
Risk → Red
```

Graph nodes should remain visually restrained.

---

# 82. AI Assistant

If a floating AI assistant is introduced:

- keep it small
- use AI violet
- position it away from important dashboard controls
- make it collapsible
- never allow it to cover charts

Example:

```text
        ┌───────────────────────┐
        │ ✦ Ask DIME            │
        │                       │
        │ What should I build?  │
        │                       │
        │ [Ask]                 │
        └───────────────────────┘
```

Use AI violet as the identity marker, while maintaining DIME orange for product actions.

---

# 83. Prompt-Injection / Untrusted Evidence UX

Retrieved web content must be treated as untrusted data.

If suspicious content is detected, the UI may show:

```text
Source contains untrusted instructions

DIME ignored instructions embedded in the source
and used the page only as evidence.
```

Do not expose hidden system prompts or chain-of-thought.

---

# 84. Confidence UI

Every major analytical section should be able to communicate confidence.

Example:

```text
Confidence
High

27 evidence items
3 independent sources
Updated 12 minutes ago
```

Confidence must not be confused with probability of business success.

---

# 85. Data Freshness UI

Every dynamic insight should expose freshness where useful.

Example:

```text
Updated 18 min ago
```

For detailed views:

```text
Last retrieved
14 Sep 2026 · 13:42

Source
GitHub

Status
Healthy
```

---

# 86. Evidence Density

The UI should make evidence easy to inspect without overwhelming the user.

Default:

```text
3–5 strongest evidence items
```

Then:

```text
View all 27 evidence items →
```

Do not put dozens of source cards on the main page.

---

# 87. Information Hierarchy

Every screen follows:

```text
1. What is this page?
2. What is the important conclusion?
3. What evidence supports it?
4. What should the user do next?
5. What additional detail is available?
```

This is especially important for AI-generated reports.

---

# 88. Design Rules for AI Content

AI-generated content should always communicate:

- that it is an analysis
- what evidence supports it
- confidence
- timestamp
- source availability

Avoid:

```text
AI says this is definitely a great idea.
```

Prefer:

```text
Assessment: Promising

The available evidence suggests...
Confidence: Medium
Evidence: 18 items
Updated: 14 Sep 2026
```

---

# 89. Design Rules for Scores

Never display a score without context.

Bad:

```text
0.73
```

Good:

```text
Novelty
0.73
High

Based on semantic comparison with
42 related products/projects.

Confidence: 0.81
```

---

# 90. Design Rules for Recommendations

Recommendations should be actionable.

Bad:

```text
Improve differentiation.
```

Good:

```text
Differentiate through engineering-specific
workflow support.

Why:
8 competing products focus on generic coaching.

Opportunity:
High

[Add to MVP]
```

---

# 91. Design Rules for External Sources

Every external source should have:

```text
Source name
Source type
Timestamp
URL/action
Evidence relevance
```

Examples:

```text
GitHub
Repository

Web
Product page

Reviews
App feedback

Research
Paper
```

---

# 92. Design Rules for Long-Running Jobs

Do not make users wait on a frozen page.

Show:

```text
Current stage
Progress
Elapsed time
Evidence count
Completed agents
Failed sources
```

Allow users to navigate away and return to the analysis.

---

# 93. Design Rules for Partial Data

If data is missing:

```text
Insufficient evidence
```

not:

```text
0 demand
```

This distinction is critical.

A missing dataset does not mean zero market demand.

---

# 94. Design Rules for Empty/Insufficient Evidence

Example:

```text
Not enough evidence yet

DIME found only 3 relevant sources for this
dimension. Treat this assessment as low confidence.

[View Sources]
```

Use neutral information styling.

Do not make insufficient evidence look like a negative result.

---

# 95. Design Rules for Source Failure

Example:

```text
GitHub temporarily unavailable

Competition analysis may be incomplete.

[Retry]
```

Use warning or danger depending on severity.

---

# 96. Design QA Checklist

Before shipping any screen:

## Existing Theme

- [ ] White shell preserved
- [ ] Orange `#EA580C` remains primary brand color
- [ ] Existing sidebar pattern preserved
- [ ] Existing top search/header pattern preserved
- [ ] Existing navigation labels preserved
- [ ] Existing card language preserved

## Color

- [ ] No generic blue-first theme
- [ ] No neon AI palette
- [ ] Purple used primarily for AI
- [ ] Cyan used primarily for data visualization
- [ ] Red reserved for risk/error
- [ ] Green reserved for success/positive meaning

## Typography

- [ ] Inter
- [ ] Clear hierarchy
- [ ] Readable body text
- [ ] Tabular financial numbers where needed

## UX

- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Partial state
- [ ] Evidence state
- [ ] Confidence state

## Product Alignment

- [ ] Screen maps to PRD requirement
- [ ] No fake capabilities
- [ ] Dynamic data is visibly distinguishable from static benchmark data
- [ ] Scores include context
- [ ] AI output includes evidence
- [ ] Important findings have provenance

---

# 97. Do Not Do These Things

Never redesign DIME into:

### Generic Purple AI SaaS

```text
Purple background
Purple buttons
Purple gradients everywhere
```

### Generic Dark AI Dashboard

```text
Black background
Neon green
Glowing cards
```

### Generic Fintech Blue

```text
Blue primary buttons
Blue active navigation
Blue everything
```

### Excessive Glassmorphism

```text
Blurred cards
Transparent panels
Large shadows
```

The supplied screenshot already has a strong visual identity. The correct direction is **evolution, not replacement**.

---

# 98. Final Visual Principle

The product should feel like:

> **DIME became significantly smarter without becoming visually unfamiliar.**

A user who already knows the current Dashboard should immediately recognize:

- the sidebar
- the orange active state
- the white cards
- the search header
- the orange CTA
- the analytics layout
- the Opportunity Matrix
- the Dataset Explorer
- the Workspace
- the Notes area

The new functionality should appear through richer data, evidence, analysis, AI status, and recommendations — not through a completely new visual language.

---

# 99. Final Design Architecture

```text
                         DIME
                          │
             Existing Orange + White UI
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    Dashboard        Idea Analysis     Market Analysis
        │                 │                 │
        │                 │                 │
 Opportunity         AI Validation       Market Pain
   Matrix                  │              Trends
        │                  │              Sentiment
        │             ┌────┼────┐
 Dataset Explorer      │    │    │
        │           Novelty Market Competition
        │             │    │    │
        └─────────────┼────┼────┘
                      │
                Evidence / RAG
                      │
               AI Agent Pipeline
                      │
          ┌───────────┼───────────┐
          │           │           │
       Planner     Research   Competition
          │           │           │
          └───────────┼───────────┘
                      │
                  Synthesis
                      │
                Final Report
                      │
             Recommendations
                      │
                 Suggested MVP
```

---

# 100. Final Color Decision

## PRIMARY

```text
DIME ORANGE
#EA580C
```

## BACKGROUND

```text
WHITE
#FFFFFF

PAGE BACKGROUND
#F8FAFC
```

## TEXT

```text
DARK
#0F172B

SECONDARY
#64748B
```

## BORDER

```text
#E5E7EB
```

## AI

```text
#8B5CF6
```

## DATA

```text
#06B6D4
```

## SUCCESS

```text
#16A34A
```

## WARNING

```text
#D97706
```

## DANGER

```text
#DC2626
```

---

# 101. Implementation Priority

Implement the visual changes in this order:

```text
1. Design tokens
        ↓
2. App shell
        ↓
3. Sidebar/navigation
        ↓
4. Header/search
        ↓
5. Buttons/inputs/cards
        ↓
6. Dashboard
        ↓
7. Idea Analysis
        ↓
8. Market Analysis
        ↓
9. Opportunity Matrix
        ↓
10. Dataset Explorer
        ↓
11. Evidence UI
        ↓
12. Agent activity
        ↓
13. Reports
        ↓
14. Workspace/Notes
        ↓
15. Responsive/mobile
        ↓
16. Accessibility
        ↓
17. V1 polish
        ↓
18. V2 extensions
```

---

# 102. Acceptance Criteria

The redesign is visually complete when:

- [ ] A current DIME user immediately recognizes the application.
- [ ] Orange is the dominant brand/interaction color.
- [ ] White remains the dominant surface color.
- [ ] Existing navigation labels remain available.
- [ ] Dashboard retains the visual structure of the supplied screenshot.
- [ ] New PRD features are integrated into the existing tabs.
- [ ] Idea Analysis becomes the primary validation workflow.
- [ ] Market Analysis exposes actual evidence-backed market signals.
- [ ] Opportunity Matrix visualizes demand versus competition.
- [ ] Dataset Explorer exposes data provenance and freshness.
- [ ] AI activity is visually distinct but not allowed to overpower DIME branding.
- [ ] Evidence is accessible from important findings.
- [ ] Scores show interpretation, confidence, and evidence context.
- [ ] Partial analysis failures are represented clearly.
- [ ] V2 features can be added without changing the visual system.
- [ ] No screen introduces an unrelated color palette.
- [ ] No placeholder/static metrics are presented as live intelligence.
- [ ] Desktop, tablet, and mobile layouts remain coherent.
- [ ] Accessibility and keyboard states are implemented.

---

# 103. Final Instruction to the Development Team

**Treat the supplied DIME screenshot as the visual baseline.**

The goal is not:

> "Design a beautiful new AI dashboard."

The goal is:

> **"Transform the existing DIME dashboard into the product described by the PRD while preserving the orange-and-white DIME identity, existing tabs, navigation model, card language, and analytics visual style."**

The final product should look like the **same DIME product at a much more mature stage**:

```text
CURRENT DIME
Static analytics
      ↓
Dynamic data
      ↓
Semantic retrieval
      ↓
Evidence
      ↓
AI agents
      ↓
Market intelligence
      ↓
Recommendations
      ↓
PRODUCT INTELLIGENCE DIME
```

**Orange + White remains the brand.  
Evidence + AI becomes the intelligence layer.  
The existing navigation remains the product's mental model.**
