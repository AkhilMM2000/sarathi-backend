# Part 2 LLM Workflow: Refactoring, Code Generation & Hallucination Audits

## 1. Overview
Part 2 investigates the use of Large Language Models (LLMs) across three core software evolution activities:
1. **Refactoring Design:** Formulating minimal refactoring plans that introduce formal GoF patterns with balanced tradeoff analyses.
2. **Code Generation:** Generating strongly-typed TypeScript implementations from rigorous acceptance criteria (e.g., pricing calculations, domain event buses).
3. **Hallucination Audits:** Evaluating a model's ability to identify false or unsupported claims regarding codebase test coverage, third-party payment lifecycles, and machine-learning capabilities.

**Workstream Lead:** Harish  
**Reviewers:** Dilip (CH01), Leela Shankar (CH02), Kumar (CH03)  

---

## 2. Change Scenario Prompts & Acceptance Criteria
Prompts in Part 2 evaluate whether an LLM adheres to strict software constraints:
* **CH01 (State Pattern):** The model must introduce `SUSPENDED` status, guard capabilities (`canLogin()`, `canAcceptRides()`), and enforce valid transitions without relying on naive procedural switches.
* **CH02 (Observer Pattern):** The model must decouple side effects (socket notifications, wallet refunds, audit logging) behind a domain event bus (`BookingCancelledEvent`).
* **CH03 (Strategy Pattern):** The model must implement interchangeable pricing strategies with strict regulatory surge clamping ($1.0\times$ to $2.5\times$) and input validation.

---

## 3. Part 2 Evaluation Dataset Mapping

| Dataset ID | Task Category | Scenario / Focus | Key Capability Evaluated |
|---|---|---|---|
| `A6-EVAL-005` | Minimal Refactoring with Tradeoffs | CH01: Driver Status Management | Compares GoF State classes vs. XState library vs. DB constraints |
| `A6-EVAL-006` | Code Generation from Acceptance Criteria | CH03: Pricing Strategy Pattern | Compiling TypeScript code with surge clamp ($1.0\times$–$2.5\times$) |
| `A6-EVAL-008` | Detecting Unsupported Claims | Repository-wide sanity audit | Detects 0 baseline tests and missing cancellation refund calls |

---

## 4. Evaluation Protocol & Dataset Links
* All records are formally standardized in [`A6/data/evaluation-dataset.jsonl`](file:///d:/design-patterns-case-study/A6/data/evaluation-dataset.jsonl).
* Graded using the standardized rubric in [`A6/data/evaluation-rubric.md`](file:///d:/design-patterns-case-study/A6/data/evaluation-rubric.md).
* Ground-truth reference implementations and answers are detailed in [`A6/data/reference-answers.md`](file:///d:/design-patterns-case-study/A6/data/reference-answers.md).
* In accordance with anti-fabrication guidelines, model evaluation scores remain `null` / pending until actual multi-model benchmarking runs are executed under identical parameters.
