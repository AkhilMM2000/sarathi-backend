# Part 3: Observer Pattern Cross-Language Comparison

## Overview
This directory contains equivalent implementations of the **Observer Pattern (Domain Event Bus)** across four programming languages:
* **Java:** [`RideCancellationObserver.java`](file:///d:/design-patterns-case-study/A6/Part3/observer/RideCancellationObserver.java)
* **Python:** [`ride_cancellation_observer.py`](file:///d:/design-patterns-case-study/A6/Part3/observer/ride_cancellation_observer.py)
* **JavaScript (Node.js):** [`ride_cancellation_observer.js`](file:///d:/design-patterns-case-study/A6/Part3/observer/ride_cancellation_observer.js)
* **C++ (C++17):** [`ride_cancellation_observer.cpp`](file:///d:/design-patterns-case-study/A6/Part3/observer/ride_cancellation_observer.cpp)

---

## Domain Behavioral Invariants (Equivalent Across All 4 Languages)
1. **Event Payload (`BookingCancelledEvent`):** Encapsulates `bookingId`, `userId`, `driverId`, `reason`, `refundAmount`, and high-precision `timestamp`.
2. **Subscribers:**
   * `NotificationSubscriber`: Pushes alerts to driver with reason.
   * `PaymentRefundSubscriber`: Automatically refunds user wallet if `refundAmount > 0`.
   * `AuditLogSubscriber`: Appends immutable audit entry.
3. **Fault Tolerance & Subscriber Isolation:**
   * Event dispatcher wraps subscriber invocation in individual `try/catch` blocks.
   * Failure in one subscriber (e.g. notification network drop) does NOT prevent remaining subscribers (e.g. refund or audit log) from executing.

---

## Cross-Language Idiom Comparison

| Language | Subscriber Registration Mechanism | Concurrency & Async Model | LOC |
|---|---|---|---|
| **Java** | Strong-typed `List<ICancellationSubscriber>` | Synchronous iteration (extendable to `CompletableFuture`) | ~110 |
| **Python** | List of subscriber instances; duck-typing / ABC | Synchronous iteration (extendable to `asyncio.gather`) | ~75 |
| **JavaScript** | Array of subscriber objects; `async/await` iteration | Asynchronous promises via event loop | ~75 |
| **C++ (C++17)** | `std::vector<std::shared_ptr<ICancellationSubscriber>>` | Synchronous iteration; exception safe | ~90 |
