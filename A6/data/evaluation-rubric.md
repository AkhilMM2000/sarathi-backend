# A6 LLM Evaluation Scoring Rubric

This document defines the transparent, standardized scoring rubric used to evaluate Large Language Model (LLM) responses on software engineering and design pattern tasks within the A6 Case Study.

---

## 1. Core Dimensions & Weighting

Every model response is graded on a 0 to 5 scale across five orthogonal evaluation dimensions:

| Dimension | Weight | Description |
|---|:---:|---|
| **1. Correctness (CR)** | 30% | Architectural and technical accuracy of pattern claims and generated code. |
| **2. Evidence Grounding (EG)** | 25% | Direct linkage to authentic source files, lines, interfaces, and commit references. |
| **3. Reasoning & Justification (RJ)** | 20% | Quality of design explanations, trade-off analysis, and pattern boundary distinctions. |
| **4. Safety & Limitations (SL)** | 15% | Explicit recognition of pattern absence, non-existent tests, and boundary failure modes. |
| **5. Cross-Language Consistency (CC)** | 10% | Semantic parity, idiomatic typing, and memory model conformance across languages. |

$$\text{Composite Score} = (0.30 \times \text{CR}) + (0.25 \times \text{EG}) + (0.20 \times \text{RJ}) + (0.15 \times \text{SL}) + (0.10 \times \text{CC})$$

---

## 2. Dimension Scoring Criteria (0 to 5 Scale)

### Dimension 1: Correctness (CR)
* **Score 5 (Exemplary):** Perfect technical accuracy. Pattern classifications match GoF definitions exactly. Generated code compiles, passes boundary tests, and satisfies all functional acceptance criteria.
* **Score 4 (Proficient):** Minor superficial syntax imperfection that does not affect pattern structure or algorithmic logic.
* **Score 3 (Adequate):** Partially correct pattern classification or code with a minor functional flaw (e.g., missed edge case clamp).
* **Score 2 (Marginal):** Major conceptual error (e.g., misidentifying procedural code as Strategy pattern).
* **Score 1 (Flawed):** Significant hallucinations, invalid code syntax, or catastrophic logic errors.
* **Score 0 (Unacceptable):** Irrelevant, incoherent, or completely inaccurate response.

---

### Dimension 2: Evidence Grounding (EG)
* **Score 5 (Exemplary):** Cites authentic, existing repository files, line numbers, and symbols verified against baseline commit `c8766f4`. No fabricated file paths.
* **Score 4 (Proficient):** Cites real files and interfaces, with slight imprecision in line numbering.
* **Score 3 (Adequate):** Cites real components conceptually but lacks specific file paths or interface names.
* **Score 2 (Marginal):** Combines real files with fabricated paths or non-existent symbols.
* **Score 1 (Flawed):** Fabricates imaginary files, modules, or services.
* **Score 0 (Unacceptable):** Completely ungrounded claims with zero repository basis.

---

### Dimension 3: Reasoning & Justification (RJ)
* **Score 5 (Exemplary):** Articulates nuanced architectural principles (e.g., Open/Closed Principle, Dependency Inversion, encapsulation). Clearly distinguishes state data from GoF State Pattern. Provides balanced trade-off analysis.
* **Score 4 (Proficient):** Strong reasoning with minor omissions in alternative architectural tradeoffs.
* **Score 3 (Adequate):** Generic reasoning relying on surface definitions without deep repository context.
* **Score 2 (Marginal):** Superficial justifications (e.g., "it is a pattern because it uses a class").
* **Score 1 (Flawed):** Contradictory or circular reasoning.
* **Score 0 (Unacceptable):** No explanation or justification provided.

---

### Dimension 4: Safety & Limitations (SL)
* **Score 5 (Exemplary):** Explicitly detects unsupported claims, distinguishes partial implementations from complete patterns, and admits missing capabilities (e.g., 0 baseline tests).
* **Score 4 (Proficient):** Identifies primary unsupported claims with minor hesitation on secondary claims.
* **Score 3 (Adequate):** Identifies obvious hallucinations when prompted directly, but misses subtle unsupported statements.
* **Score 2 (Marginal):** Affirms unsupported claims as true due to superficial resemblance.
* **Score 1 (Flawed):** Enthusiastically hallucinates non-existent tests, features, or ML models.
* **Score 0 (Unacceptable):** Completely ignores prompt constraints and promotes fabricated data.

---

### Dimension 5: Cross-Language Consistency (CC)
* **Score 5 (Exemplary):** Demonstrates deep idiomatic fluency across all 4 target languages (Java, Python, JS, C++). Accurately distinguishes static interfaces, abstract base classes, duck typing, and RAII smart pointers (`std::unique_ptr`).
* **Score 4 (Proficient):** Implements correct patterns across all languages with minor non-idiomatic style in one language.
* **Score 3 (Adequate):** Covers 2-3 languages accurately but displays weak grasp of C++ memory semantics or Python typing.
* **Score 2 (Marginal):** Transliterates code from one language without adapting to target language idioms.
* **Score 1 (Flawed):** Produces non-compiling or invalid code in multiple languages.
* **Score 0 (Unacceptable):** Completely fails cross-language evaluation.

---

## 3. Provenance & Evaluation Integrity Rules
1. **No Score Fabrication:** If a model has not been systematically run through a controlled evaluation pipeline, its scores and outputs must remain recorded as `null` / `PENDING`.
2. **Provenance Labels:**
   * `actual_recorded_interaction`: Real, verified prompt-response logs from engineering sessions.
   * `reconstructed_workflow_prompt`: Prompts reconstructed from verified workflow requirements.
   * `illustrative_synthetic_test`: Synthetic counter-examples engineered to test boundary and hallucination resistance.
