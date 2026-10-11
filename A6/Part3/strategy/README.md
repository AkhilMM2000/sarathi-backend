# Part 3: Strategy Pattern Cross-Language Comparison

## Overview
This directory contains equivalent implementations of the **Strategy Pattern** across four programming languages:
* **Java:** [`PricingStrategy.java`](file:///d:/design-patterns-case-study/A6/Part3/strategy/PricingStrategy.java)
* **Python:** [`pricing_strategy.py`](file:///d:/design-patterns-case-study/A6/Part3/strategy/pricing_strategy.py)
* **JavaScript (Node.js):** [`pricing_strategy.js`](file:///d:/design-patterns-case-study/A6/Part3/strategy/pricing_strategy.js)
* **C++ (C++17):** [`pricing_strategy.cpp`](file:///d:/design-patterns-case-study/A6/Part3/strategy/pricing_strategy.cpp)

---

## Domain Behavioral Invariants (Equivalent Across All 4 Languages)
1. **Ride Types:** `ECONOMY`, `PREMIUM`, `XL`.
2. **Pricing Parameters:**
   * **ECONOMY:** Base ₹50, ₹12/km, ₹2.0/min, Min fare ₹150.
   * **PREMIUM:** Base ₹100, ₹20/km, ₹3.5/min, Min fare ₹250.
   * **XL:** Base ₹120, ₹25/km, ₹4.0/min, Min fare ₹300.
3. **Surge Boundaries:**
   * Dynamic surge factor is strictly clamped between $1.0\times$ (floor) and $2.5\times$ (regulatory ceiling).
4. **Rounding Consistency:**
   * Rounding follows integer currency units (`round(...)` in JS/Python, `Math.round` in Java, `std::round` in C++), guaranteeing identical fare quotes across all 4 platforms for given inputs.

---

## Cross-Language Idiom Comparison

| Language | Algorithm Composition Idiom | Floating Point & Precision Handling | LOC |
|---|---|---|---|
| **Java** | `IPricingStrategy` interface; decorator pattern for surge | `long Math.round(double)` | ~115 |
| **Python** | Abstract Base Class `IPricingStrategy`; `NamedTuple` data structures | Python 3 `round()` | ~85 |
| **JavaScript** | ES6 class inheritance; Object freeze enums | `Math.round(number)` | ~80 |
| **C++ (C++17)** | Abstract base with pure virtual functions; `std::shared_ptr` decoration | `std::round` casting to `long` | ~95 |
