# A6 Case Study: Design Pattern Analysis in a Ride-Sharing Backend

## Project Information
* **Team:** A6
* **Application:** Sarathi Ride-Sharing Backend
* **Upstream Repository:** [https://github.com/AkhilMM2000/sarathi-backend](https://github.com/AkhilMM2000/sarathi-backend)
* **Local / Active Repository:** [https://github.com/sskb230506/design-patterns-case-study](https://github.com/sskb230506/design-patterns-case-study)
* **Reference Submission:** [23CSE455 DP Case Study Reference Submission](https://github.com/siddarth2304/23CSE455_DP_CaseStudy/tree/b4-final-submission)
* **Baseline Git Branch:** `baseline-analysis`
* **Baseline Commit SHA:** `c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a`

---

## Team Responsibilities

| Member | Assigned Responsibility | Primary Deliverables |
|---|---|---|
| **Sai Sameer** | Project Lead, Architecture & Integration | Part 1 baseline study, architecture integration, report synthesis, and LaTeX report |
| **Dilip** | Driver Status Management | Part 2 Change Scenario 1 (CH01) — State Pattern analysis and transition enforcement |
| **Leela Shankar** | Ride Cancellation & Notifications | Part 2 Change Scenario 2 (CH02) — Booking lifecycle, notification dispatch, and payment side effects |
| **Kumar** | Ride Types & Dynamic Pricing | Part 2 Change Scenario 3 (CH03) — Strategy Pattern implementation for dynamic fare calculation |
| **Harish** | Cross-Language Comparison & LLM Evaluation | Part 3 cross-language implementations (Java, Python, JS, C++), test suites, and LLM evaluation |

---

## Directory Manifest

The case-study deliverables are partitioned into structured modules following the reference submission conventions:

| Path | Purpose & Description |
|---|---|
| `A6/Part1/` | Baseline application analysis: 7 core subsystems, architecture mapping, and existing design pattern evidence. |
| `A6/Part1/code/` | Scripts, isolated domain extracts, and architectural verification harnesses for the baseline application. |
| `A6/Part1/diagrams/` | Baseline UML class diagrams, component architecture diagrams, and sequence diagrams. |
| `A6/Part1/evidence/` | Source-code inspection traces, baseline execution logs, and architectural evidence logs. |
| `A6/Part1/llm/` | LLM prompts, raw model outputs, and evaluation records for Part 1 baseline reconnaissance. |
| `A6/Part2/` | Evolution and change scenarios: CH01 (State), CH02 (Observer / Cancellation), CH03 (Strategy / Dynamic Fare). |
| `A6/Part2/changes/CH01/` | Driver status management refactoring: transition validation, State pattern code, tests, and documentation. |
| `A6/Part2/changes/CH02/` | Ride cancellation improvements: notification and refund side-effect coordination, Observer/Pub-Sub code, tests. |
| `A6/Part2/changes/CH03/` | Multiple ride types and dynamic pricing: Strategy pattern implementation, algorithms, tests, and documentation. |
| `A6/Part2/code/` | Evolved application source code or unified patch diffs incorporating all three change scenarios. |
| `A6/Part2/diagrams/` | Refactored UML class diagrams, statecharts, and sequence diagrams for CH01, CH02, and CH03. |
| `A6/Part2/evidence/` | Actual test execution logs, benchmark results, and regression test proofs for evolved behaviors. |
| `A6/Part2/llm/` | Prompts, outputs, and structured reviews for LLM-assisted refactoring in Part 2. |
| `A6/Part3/` | Cross-language design pattern implementations across Java, Python, JavaScript, and C++. |
| `A6/Part3/state/` | Equivalent State pattern implementations across Java, Python, JavaScript, and C++. |
| `A6/Part3/strategy/` | Equivalent Strategy pattern implementations across Java, Python, JavaScript, and C++. |
| `A6/Part3/observer/` | Equivalent Observer/Pub-Sub pattern implementations across Java, Python, JavaScript, and C++. |
| `A6/Part3/test-cases/` | Multi-language test suites verifying behavioral equivalence across all 4 implementations. |
| `A6/Part3/evidence/` | Terminal execution outputs, test runner logs, and benchmark evidence across all 4 languages. |
| `A6/prompts/` | Central repository of all prompts issued throughout the case study for reproducibility. |
| `A6/data/` | Structured datasets, evaluation rubrics, metrics, and quantitative analysis tables. |
| `A6/tools/` | Automation scripts, analysis utilities, diagram generators, and verification runners. |
| `A6/HUMAN_VERIFICATION.md` | Verification log auditing all code changes, test outputs, and human sign-offs. |

---

## Baseline Integrity & Preservation Rules
1. **Preserve Root Application:** The baseline application located at the repository root (`src/`, `package.json`, etc.) remains untouched and preserved at baseline commit `c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a`.
2. **Evidence-Based Claims:** No design pattern, test result, or performance metric may be claimed without concrete source file line references or execution logs.
3. **No Fabricated Data:** All LLM transcripts, human review logs, and cross-language tests must be authentic and verifiable.
