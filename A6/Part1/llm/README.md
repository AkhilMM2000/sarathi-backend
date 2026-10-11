# Part 1 LLM Workflow: Baseline Reconnaissance & Pattern Identification

## 1. Overview
In Part 1 of the A6 Case Study, Large Language Models (LLMs) were investigated as architectural reconnaissance assistants for the Sarathi backend repository. The primary challenge during baseline exploration is **hallucination risk**: LLMs frequently over-identify design patterns, attributing GoF patterns to simple enums or procedural utility functions based purely on surface keywords.

**Workstream Lead:** Harish  
**Reviewer:** Sai Sameer  

---

## 2. Reconnaissance Prompts & Empirical Guardrails
Prompts utilized during Part 1 adhere to strict **ground-truth anchoring**:
1. **Source Inspection Grounding:** Models are provided with exact file paths and line ranges from baseline commit `c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a`.
2. **Negative Evidence Verification:** Prompts explicitly demand verification of whether a pattern is absent or only partially implemented (e.g., distinguishing state variables from polymorphic State objects).
3. **Reference Links:** All prompt records and evaluation tasks link directly to the centralized evaluation suite:
   * Evaluation Dataset: [`A6/data/evaluation-dataset.jsonl`](file:///d:/design-patterns-case-study/A6/data/evaluation-dataset.jsonl)
   * Task Rubric: [`A6/data/evaluation-rubric.md`](file:///d:/design-patterns-case-study/A6/data/evaluation-rubric.md)
   * Reference Answers: [`A6/data/reference-answers.md`](file:///d:/design-patterns-case-study/A6/data/reference-answers.md)

---

## 3. Part 1 Evaluation Dataset Mapping

| Dataset ID | Task Category | Target Subsystem / File | Key Discrimination Tested |
|---|---|---|---|
| `A6-EVAL-001` | Pattern Identification from Excerpt | `src/infrastructure/config/container.ts` | Identifies DI container and Repository binding |
| `A6-EVAL-002` | Explaining Claims with Evidence | `StripeService.ts`, `cloudstorageservice.ts` | Grounding Adapter pattern claims with concrete code |
| `A6-EVAL-003` | Distinguishing Real Pattern from Resemblance | `src/domain/models/Driver.ts` | Refuting GoF State pattern claim on string enum |
| `A6-EVAL-004` | Recognizing Absent/Partial Patterns | `FareCalculatorService.ts`, `SocketNotification.ts` | Identifying procedural fare and socket push limits |

---

## 4. Evaluation Policy
In accordance with team integrity rules, no synthetic historical scores are claimed. Unbenchmarked records remain pending until empirical benchmarking runs are conducted under the standardized protocol defined in [`A6/data/evaluation-methodology.md`](file:///d:/design-patterns-case-study/A6/data/evaluation-methodology.md).
