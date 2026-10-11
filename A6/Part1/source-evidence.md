# Part 1: Source-Code Ground Truth & Evidence Ledger

This document compiles line-by-line evidence from the unchanged Sarathi backend baseline (`commit c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a`), documenting why each pattern claim is supported or rejected.

---

## 1. Verified Existing Design Patterns

### Pattern: Dependency Injection (IoC)
* **Exact Path:** [`src/infrastructure/config/container.ts`](file:///d:/design-patterns-case-study/src/infrastructure/config/container.ts)
* **Relevant Symbol:** `container.registerSingleton`, `container.register`
* **Verifiable Line Range:** Lines 45–101
* **Observed Behavior:**
  * Binds `TOKENS.IUSER_REPO` to `MongoUserRepository` (Line 45).
  * Binds `TOKENS.IDRIVER_REPO` to `MongoDriverRepository` (Line 46).
  * Binds `TOKENS.IBOOKING_REPO` to `MongoBookingRepository` (Line 48).
  * Binds `TOKENS.PAYMENT_SERVICE` to `PaymentService` (Line 75).
* **Explanation:** TSyringe manages lifecycle and object construction. Controllers and use cases declare dependencies through constructor parameter injection without ever constructing concrete implementations directly. **Supports claim (Existing).**

---

### Pattern: Repository Pattern
* **Exact Path:** [`src/domain/repositories/IBookingrepository.ts`](file:///d:/design-patterns-case-study/src/domain/repositories/IBookingrepository.ts) and [`src/infrastructure/database/MongoBookingRepository.ts`](file:///d:/design-patterns-case-study/src/infrastructure/database/MongoBookingRepository.ts)
* **Relevant Symbol:** `IBookingRepository`, `MongoBookingRepository`
* **Verifiable Line Range:** Lines 1–30 (interface), Lines 15–120 (class)
* **Observed Behavior:**
  * Interface defines abstract domain CRUD methods: `createBooking`, `findBookingById`, `updateBooking`, `checkDriverAvailability`.
  * Concrete class implements these using Mongoose model methods (`BookingModel.create`, `BookingModel.findById`).
* **Explanation:** Encapsulates persistence operations behind an intention-revealing domain interface. Use cases never touch Mongoose queries directly. **Supports claim (Existing).**

---

### Pattern: Adapter Pattern (Anti-Corruption Layer)
* **Exact Path:** [`src/domain/services/IStripeService.ts`](file:///d:/design-patterns-case-study/src/domain/services/IStripeService.ts) and [`src/infrastructure/services/StripeService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/StripeService.ts)
* **Relevant Symbol:** `IStripeService`, `PaymentService`
* **Verifiable Line Range:** Lines 1–15 (interface), Lines 10–55 (implementation)
* **Observed Behavior:**
  * Defines domain payment contract `createPaymentIntent` and `transferToDriverFromWallet`.
  * Implements contract by translating calls to the official Stripe SDK: `stripe.paymentIntents.create` and `stripe.transfers.create`.
* **Explanation:** Adapts third-party external SDK interfaces to the domain interface expected by application use cases. **Supports claim (Existing).**

---

### Pattern: Data Mapper Pattern
* **Exact Path:** [`src/infrastructure/database/mappers/DriverReviewMapper.ts`](file:///d:/design-patterns-case-study/src/infrastructure/database/mappers/DriverReviewMapper.ts)
* **Relevant Symbol:** `toDomain`, `toPersistence`
* **Verifiable Line Range:** Lines 6–28
* **Observed Behavior:**
  * `toDomain(doc: any): DriverReview` converts MongoDB document with `Types.ObjectId` to clean domain entity with string IDs.
  * `toPersistence(review)` converts pure domain entity into Mongoose document payload.
* **Explanation:** Separates persistence data representation from domain entities. **Supports claim (Existing).**

---

## 2. Verified Absent Patterns (Procedural Anti-Patterns)

### Pattern: State Pattern (Evaluated & Disproven in Baseline)
* **Exact Path:** [`src/domain/models/Driver.ts`](file:///d:/design-patterns-case-study/src/domain/models/Driver.ts) and [`src/application/use_cases/Admin/AdminChangeDriverStatus.ts`](file:///d:/design-patterns-case-study/src/application/use_cases/Admin/AdminChangeDriverStatus.ts)
* **Relevant Symbol:** `status: "pending" | "approved" | "rejected"`, `AdminChangeDriverStatus.execute`
* **Verifiable Line Range:** `Driver.ts` line 25; `AdminChangeDriverStatus.ts` lines 24–33
* **Observed Behavior:**
  ```typescript
  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new AuthError("Invalid status value.", HTTP_STATUS_CODES.BAD_REQUEST);
  }
  await this._driverRepository.updateStatus(driverId, status, reason);
  ```
* **Explanation:**
  * **Does NOT support State pattern claim.**
  * Only a primitive string literal union is present.
  * Transitions are evaluated via procedural if-else branching.
  * No polymorphic state classes exist.
  * No encapsulated transition guards exist.
  * Confirms State pattern is **Absent** in baseline.

---

### Pattern: Strategy Pattern (Evaluated & Disproven in Baseline)
* **Exact Path:** [`src/infrastructure/services/FareCalculatorService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/FareCalculatorService.ts)
* **Relevant Symbol:** `FareCalculatorService.calculate`
* **Verifiable Line Range:** Lines 20–34
* **Observed Behavior:**
  ```typescript
  if (bookingType === BookingType.ONE_WAY) {
    if (!estimatedKm) throw new Error("Estimated KM is required for ONE_WAY booking");
    fare = estimatedKm * this.PER_KM_RATE;
    return fare < 450 ? 450 : fare;
  }
  if (bookingType === BookingType.ROUND_TRIP) {
    if (!endDate) throw new Error("End date is required for ROUND_TRIP booking");
    ...
    return dayCount * this.PER_DAY_RATE;
  }
  ```
* **Explanation:**
  * **Does NOT support Strategy pattern claim.**
  * Calculation logic is hardcoded in a single class using conditional branches.
  * Rates (`PER_KM_RATE = 10`, `PER_DAY_RATE = 1000`) are fixed private constants.
  * No strategy interface, no polymorphic pricing classes, and no runtime interchangeable algorithm hierarchy exist.
  * Confirms Strategy pattern is **Absent** in baseline.

---

### Pattern: Observer / Pub-Sub Pattern (Evaluated & Partially Disproven)
* **Exact Path:** [`src/application/use_cases/User/CancelBooking.ts`](file:///d:/design-patterns-case-study/src/application/use_cases/User/CancelBooking.ts)
* **Relevant Symbol:** `CancelBookingInputUseCase.execute`
* **Verifiable Line Range:** Lines 52–54
* **Observed Behavior:**
  ```typescript
  if (bookingdriverId) {
    await this._notificationService.cancelBookingNotification(booking.driverId.toString(), { status, reason, startDate: booking.startDate, bookingId })
  }
  ```
* **Explanation:**
  * **Does NOT support domain-level Observer / Pub-Sub claim.**
  * The use case makes a direct, tightly coupled function call to a notification adapter.
  * No independent subscribers can register to observe ride cancellation events.
  * Confirms domain Observer pattern is **Absent/Partial** in baseline.
