# Part 3: State Pattern Cross-Language Comparison

## Overview
This directory contains equivalent implementations of the **State Pattern** across four programming languages:
* **Java:** [`DriverState.java`](file:///d:/design-patterns-case-study/A6/Part3/state/DriverState.java)
* **Python:** [`driver_state.py`](file:///d:/design-patterns-case-study/A6/Part3/state/driver_state.py)
* **JavaScript (Node.js):** [`driver_state.js`](file:///d:/design-patterns-case-study/A6/Part3/state/driver_state.js)
* **C++ (C++17):** [`driver_state.cpp`](file:///d:/design-patterns-case-study/A6/Part3/state/driver_state.cpp)

---

## Domain Behavioral Invariants (Equivalent Across All 4 Languages)
1. **States:** `PENDING`, `APPROVED`, `SUSPENDED`, `REJECTED`.
2. **Initial State:** Newly instantiated driver begins in `PENDING`.
3. **Capabilities:**
   * Only `APPROVED` drivers can log in (`canLogin() == true`), accept rides (`canAcceptRides() == true`), and receive bookings (`canReceiveNewBookings() == true`).
   * `SUSPENDED`, `PENDING`, and `REJECTED` drivers return `false` for all capability methods.
4. **Transition Rules:**
   * `PENDING -> APPROVED`: Allowed (Admin approval).
   * `PENDING -> REJECTED`: Allowed (Reason mandatory).
   * `PENDING -> SUSPENDED`: **Forbidden** (Throws InvalidStateTransitionException).
   * `APPROVED -> SUSPENDED`: Allowed (Reason mandatory).
   * `APPROVED -> REJECTED`: Allowed (Reason mandatory).
   * `SUSPENDED -> APPROVED`: Allowed (Reinstatement).
   * `SUSPENDED -> REJECTED`: Allowed (Permanent termination).
   * `REJECTED -> PENDING`: Allowed (Re-application with updated documents).

---

## Language Idiom Comparison & Tradeoffs

| Language | Memory & State Management | Error Handling Mechanism | Verbosity & Lines of Code (LOC) |
|---|---|---|---|
| **Java** | Strong static typing; class hierarchy implementing `IDriverState` interface | Checked/Unchecked `RuntimeException` | ~120 LOC; high ceremony, high type safety |
| **Python** | Dynamic typing; `abc.ABC` abstract base class with `@property` | `InvalidStateTransitionError(Exception)` | ~100 LOC; concise, pythonic syntax |
| **JavaScript** | Dynamic typing; ES6 classes with prototype inheritance | Custom `Error` subclasses | ~95 LOC; clean, native Node.js support |
| **C++ (C++17)** | Explicit memory management; polymorphic state via `std::unique_ptr<IDriverState>` | `std::runtime_error` exception hierarchy | ~130 LOC; zero runtime overhead, RAII safety |
