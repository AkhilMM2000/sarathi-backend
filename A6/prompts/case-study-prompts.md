# A6 Case Study: Master Prompts Ledger & Traceable Prompt Engineering

This document records the exact sequence of engineering directives and prompts executed across all three phases of Team A6's design pattern case study for the Sarathi Ride-Sharing Backend.

---

## Phase 1: Repository Reconnaissance & Baseline Study
* **Prompt Type:** Architectural Discovery & Pattern Evidence
* **Directive:**
  * Perform read-only reconnaissance of Sarathi backend repository.
  * Map the 7 required subsystems: Rider, Driver, Trip/Booking lifecycle, Payment, Driver Matching, Location, Notifications.
  * Verify whether candidate patterns exist or are absent with exact line references.
  * Ban hallucinated pattern claims (e.g. enum != State, switch != Strategy, callback != Observer).
* **Target Outputs:**
  * `A6/Part1/application-study.md`
  * `A6/Part1/pattern-identification.md`
  * `A6/Part1/source-evidence.md`
  * `A6/Part1/diagrams/original-architecture.puml`
  * `A6/Part1/diagrams/booking-sequence.puml`
  * `A6/data/patterns.csv`, `A6/data/pattern-counts.csv`

---

## Phase 2: Targeted Change Scenarios (CH01, CH02, CH03)

### CH01: Driver Status Management & State Pattern
* **Directive:** Introduce `SUSPENDED` status, enforce transition invariants, prevent suspended drivers from receiving new assignments, and validate whether explicit State pattern behavior is justified.
* **Target Outputs:**
  * `A6/Part2/changes/CH01/requirements.md`
  * `A6/Part2/changes/CH01/patch.diff`
  * `A6/Part2/changes/CH01/test-results.txt`
  * `A6/Part2/changes/CH01/source-evidence.md`
  * `A6/Part2/diagrams/driver-state-before-after.puml`

### CH02: Safe Ride Cancellation & Observer Pattern
* **Directive:** Resolve actor permissions, cutoff validation, conflict prevention against completed trips, wallet refunds, and decoupled event dispatch via an in-memory event bus.
* **Target Outputs:**
  * `A6/Part2/changes/CH02/requirements.md`
  * `A6/Part2/changes/CH02/patch.diff`
  * `A6/Part2/changes/CH02/test-results.txt`
  * `A6/Part2/changes/CH02/source-evidence.md`
  * `A6/Part2/diagrams/cancellation-sequence.puml`
  * `A6/Part2/diagrams/ride-lifecycle-before-after.puml`

### CH03: Multiple Ride Types & Dynamic Pricing (Strategy Pattern)
* **Directive:** Support `ECONOMY`, `PREMIUM`, `XL` service tiers, configurable base/distance/time rates, and dynamic surge pricing with strict clamping boundaries ($1.0\times$ to $2.5\times$).
* **Target Outputs:**
  * `A6/Part2/changes/CH03/requirements.md`
  * `A6/Part2/changes/CH03/patch.diff`
  * `A6/Part2/changes/CH03/test-results.txt`
  * `A6/Part2/changes/CH03/source-evidence.md`
  * `A6/Part2/diagrams/pricing-strategy.puml`
  * `A6/Part2/diagrams/ride-type-selection.puml`

---

## Phase 3: Cross-Language Comparison
* **Directive:** Implement equivalent State, Strategy, and Observer pattern architectures in Java, Python, JavaScript, and C++, accompanied by automated deterministic test suites.
* **Target Outputs:**
  * `A6/Part3/state/` (Java, Python, JS, C++)
  * `A6/Part3/strategy/` (Java, Python, JS, C++)
  * `A6/Part3/observer/` (Java, Python, JS, C++)
  * `A6/Part3/test-cases/` (`test_patterns.js`, `test_patterns.py`)
  * `A6/Part3/evidence/test-results.txt`
  * `A6/data/cross-language-comparison.csv`
