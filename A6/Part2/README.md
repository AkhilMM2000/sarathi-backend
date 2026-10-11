# Part 2: Three Change Scenarios — Architectural Evolution & Design Patterns

## Overview
Part 2 introduces three targeted architectural evolutions into the Sarathi ride-sharing application. Each change scenario addresses a specific design smell identified during the Part 1 baseline reconnaissance and implements a Gang of Four (GoF) design pattern backed by unit/integration tests and verifiable execution logs.

---

## Change Scenarios Summary

### CH01: Driver Status Lifecycle Management (State Pattern)
* **Assigned Lead:** Dilip
* **Reviewer:** Sai Sameer
* **Problem Addressed:** Baseline status represented as a primitive string literal union (`"pending" | "approved" | "rejected"`) with procedural `if-else` updates and missing `SUSPENDED` status.
* **Pattern Applied:** **State Pattern (GoF Behavioral)**
* **Deliverables:**
  * [`changes/CH01/requirements.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH01/requirements.md)
  * [`changes/CH01/patch.diff`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH01/patch.diff)
  * [`changes/CH01/test-results.txt`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH01/test-results.txt)
  * [`changes/CH01/source-evidence.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH01/source-evidence.md)
  * [`diagrams/driver-state-before-after.puml`](file:///d:/design-patterns-case-study/A6/Part2/diagrams/driver-state-before-after.puml)

---

### CH02: Safe Ride Cancellation (State & Observer / Pub-Sub Pattern)
* **Assigned Lead:** Leela Shankar
* **Reviewer:** Kumar
* **Problem Addressed:** Lack of actor authorization checks, lack of conflict prevention against `COMPLETED` rides, absence of refund logic, and tight coupling to WebSocket emitters.
* **Patterns Applied:** **State Pattern** (booking lifecycle) & **Observer / Pub-Sub Pattern** (domain event bus).
* **Deliverables:**
  * [`changes/CH02/requirements.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH02/requirements.md)
  * [`changes/CH02/patch.diff`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH02/patch.diff)
  * [`changes/CH02/test-results.txt`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH02/test-results.txt)
  * [`changes/CH02/source-evidence.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH02/source-evidence.md)
  * [`diagrams/cancellation-sequence.puml`](file:///d:/design-patterns-case-study/A6/Part2/diagrams/cancellation-sequence.puml)
  * [`diagrams/ride-lifecycle-before-after.puml`](file:///d:/design-patterns-case-study/A6/Part2/diagrams/ride-lifecycle-before-after.puml)

---

### CH03: Multiple Ride Types & Dynamic Pricing (Strategy & Factory Patterns)
* **Assigned Lead:** Kumar
* **Reviewer:** Leela Shankar
* **Problem Addressed:** Hardcoded fare calculator (`PER_KM_RATE = 10`), violation of Open/Closed Principle (OCP), absence of ride categories (`ECONOMY`, `PREMIUM`, `XL`), and lack of dynamic surge pricing.
* **Patterns Applied:** **Strategy Pattern** (interchangeable pricing algorithms) & **Factory Pattern** (strategy resolution).
* **Deliverables:**
  * [`changes/CH03/requirements.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH03/requirements.md)
  * [`changes/CH03/patch.diff`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH03/patch.diff)
  * [`changes/CH03/test-results.txt`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH03/test-results.txt)
  * [`changes/CH03/source-evidence.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH03/source-evidence.md)
  * [`diagrams/pricing-strategy.puml`](file:///d:/design-patterns-case-study/A6/Part2/diagrams/pricing-strategy.puml)
  * [`diagrams/ride-type-selection.puml`](file:///d:/design-patterns-case-study/A6/Part2/diagrams/ride-type-selection.puml)

---

## Unified Evidence & Evolved Codebase
* **Code Snapshot:** [`code/`](file:///d:/design-patterns-case-study/A6/Part2/code) contains the clean, self-contained evolved application snapshot (229 files, complete with `package.json`, `tsconfig.json`).
* **Changed Files Ledger:** [`evidence/changed-files.md`](file:///d:/design-patterns-case-study/A6/Part2/evidence/changed-files.md)
* **Unified Git Diff Summary:** [`evidence/diff-summary.txt`](file:///d:/design-patterns-case-study/A6/Part2/evidence/diff-summary.txt) (+342 lines, -48 lines)
* **Consolidated Test Logs:** [`evidence/test-results.txt`](file:///d:/design-patterns-case-study/A6/Part2/evidence/test-results.txt) (36 tests executed across CH01, CH02, CH03; 100% pass rate)
* **Snapshot Manifest & Hashes:** [`evidence/snapshot-manifest.txt`](file:///d:/design-patterns-case-study/A6/Part2/evidence/snapshot-manifest.txt) and [`evidence/SHA256SUMS.txt`](file:///d:/design-patterns-case-study/A6/Part2/evidence/SHA256SUMS.txt)
