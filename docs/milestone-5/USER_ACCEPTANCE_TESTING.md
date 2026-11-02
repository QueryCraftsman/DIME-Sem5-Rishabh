# DIME — Milestone 5: User Acceptance Testing (UAT) Protocol & Usability Study
## Phase 13 Deliverable — Formative Human Testing Protocol, Task Sheets & SUS Evaluation Framework

---

### Document Control & UAT Metadata

| Attribute | Specification Details |
| :--- | :--- |
| **Project Title** | **DIME** (Data-Driven Idea Exploration & Market Analysis Platform) |
| **Milestone Identifier** | **Milestone 5: Testing, Deployment & Performance Evaluation** |
| **Deliverable Identifier** | Phase 13: User Acceptance Testing Protocol & Study Design |
| **Lead UX Researcher** | **Vivek Chaurasiya** |
| **Target Study Size** | 5–8 Formative Usability Participants (Startup Founders / Engineering Students) |
| **Evaluation Framework** | 9 Task-Based Scenarios + Standard 10-Question System Usability Scale (SUS) |
| **Execution Status** | **Protocol Fully Designed & Approved; Human Sessions Pending Participant Execution** |

---

## 1. Study Objectives & Methodology

The User Acceptance Testing (UAT) protocol evaluates whether target users can intuitively navigate DIME, understand complex market and feasibility metrics, explore supporting research evidence, and derive actionable strategic insights for their startup ideas.

> [!IMPORTANT]
> **Academic Integrity & Participant Availability Disclosure**:  
> *Human user acceptance testing was prepared in full detail but was not executed with human subjects during this evaluation period because actual participants were not available. The complete testing protocol, task scenarios, consent forms, observation sheets, and standard SUS calculation templates are provided below and in the supporting materials directory for immediate subsequent execution.*

---

## 2. Participant Recruitment & Profile Criteria

### 2.1 Target Demographics
- **Target Audience Cohort**:
  - Engineering and computer science students developing capstone projects or startup ideas.
  - Early-stage founders exploring venture concept feasibility.
  - Product managers conducting competitive landscape analysis.
- **Sample Size**: Proposed formative cohort of 5 to 8 participants.
- **Anonymization Scheme**: Participants are assigned unique codes (`P01`, `P02`, `P03`, `P04`, `P05`) to safeguard personal privacy.

### 2.2 Ethics, Consent & Data Privacy Protocol
- Prior to testing, participants receive a formal Consent Form detailing the study's purpose, voluntary nature, and confidentiality.
- No personal passwords, confidential proprietary business data, or personally identifying details are collected.
- Participants may terminate the session at any point without penalty.

---

## 3. The 9 Core Usability Tasks

Participants are guided through realistic, unassisted workflows:

| Task ID | Task Name & Instruction | Key Usability Focus Areas | Success Criteria |
| :--- | :--- | :--- | :--- |
| **TASK-01** | **Registration & Workspace Access**<br>*"Sign in to DIME and navigate to your main dashboard."* | Clarity of authentication portal; dashboard entry visibility. | Participant reaches `/dashboard` within 60 seconds without errors. |
| **TASK-02** | **Product-Idea Submission**<br>*"Submit a novel product idea using the Guided Form."* | Comprehension of input fields (Problem, Audience, Tech Stack). | Form successfully submits; idea staged in database with status `ANALYZING`. |
| **TASK-03** | **Monitor Live Validation Telemetry**<br>*"Observe the progress of your submitted idea's validation."* | Understanding of progress milestones (Planning, Research, Scoring). | Participant recognizes what analytical operations the system is performing. |
| **TASK-04** | **Market Intelligence & Competitor Discovery**<br>*"Explore the Market tab and identify 2 existing competitors."* | Readability of 4-tier competitor matrix; comprehension of TAM/SAM. | Participant locates competitor cards and explains direct vs. indirect moats. |
| **TASK-05** | **Evaluate Technical Feasibility**<br>*"Inspect the Technical tab and determine implementation risks."* | Distinction between architectural complexity and ecosystem readiness. | Participant locates recommended tech stack and identifies key bottlenecks. |
| **TASK-06** | **Review Risks & Strategic Recommendations**<br>*"Identify the highest priority risk and its recommended mitigation."* | Clarity of risk severity categorization and actionable next steps. | Participant identifies High-priority risk card and reads mitigation advice. |
| **TASK-07** | **Evidence Explorer & Provenance Verification**<br>*"Locate the primary research paper supporting your market score."* | Auditability of ingested chunks, DOIs, and GitHub repository links. | Participant opens Evidence Explorer and clicks an external source URL. |
| **TASK-08** | **Detailed Report Preview & Export**<br>*"Generate and download the complete executive summary report."* | Discoverability of export triggers; layout readability of CSV/PDF. | Participant successfully downloads export file and verifies content. |
| **TASK-09** | **Overall Usability Interview & Debrief**<br>*"Complete the System Usability Scale questionnaire."* | Subjective usability scoring; qualitative friction points. | Participant submits 10-question SUS questionnaire and qualitative feedback. |

---

## 4. System Usability Scale (SUS) Framework

Following task completion, participants evaluate DIME using the industry-standard 10-item System Usability Scale (Brooke, 1996), scored on a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree):

1. *I think that I would like to use DIME frequently.*
2. *I found DIME unnecessarily complex.*
3. *I thought DIME was easy to use.*
4. *I think that I would need the support of a technical person to be able to use DIME.*
5. *I found the various functions in DIME were well integrated.*
6. *I thought there was too much inconsistency in DIME.*
7. *I would imagine that most people would learn to use DIME very quickly.*
8. *I found DIME very cumbersome to use.*
9. *I felt very confident using DIME.*
10. *I needed to learn a lot of things before I could get going with DIME.*

### Mathematical Scoring Methodology:
$$\text{Item Contribution}_i = \begin{cases} 
R_i - 1 & \text{for odd items } (1, 3, 5, 7, 9) \\
5 - R_i & \text{for even items } (2, 4, 6, 8, 10) 
\end{cases}$$

$$\text{Composite SUS Score} = 2.5 \times \sum_{i=1}^{10} \text{Item Contribution}_i$$

The resulting score ranges from $0$ to $100$, where scores above **68.0** represent above-average usability and scores above **80.3** represent top-decile ("Grade A") software ergonomics.

---

## 5. Supporting UAT Deliverables Created

The following ready-to-administer testing instruments have been generated in the project documentation:
1. [`docs/milestone-5/user-testing/CONSENT_FORM.md`](file:///d:/Projects/DIME-Sem5/docs/milestone-5/user-testing/CONSENT_FORM.md) — Participant informed consent and voluntary agreement.
2. [`docs/milestone-5/user-testing/TASK_SHEET.md`](file:///d:/Projects/DIME-Sem5/docs/milestone-5/user-testing/TASK_SHEET.md) — Step-by-step participant instructional guide.
3. [`docs/milestone-5/user-testing/OBSERVATION_SHEET.md`](file:///d:/Projects/DIME-Sem5/docs/milestone-5/user-testing/OBSERVATION_SHEET.md) — Moderator logging sheet for time-on-task, errors, and assistance requests.
4. [`docs/milestone-5/user-testing/SUS_QUESTIONNAIRE.md`](file:///d:/Projects/DIME-Sem5/docs/milestone-5/user-testing/SUS_QUESTIONNAIRE.md) — Standard 10-item questionnaire and scoring worksheet.

