# Part 1: Design Pattern Identification & Architectural Inventory

This document evaluates candidate software design patterns in the baseline Sarathi ride-sharing backend. Each pattern is classified as **Existing**, **Partial**, **Absent**, or **Proposed (Part 2 Target)** based strictly on verified source-code evidence.

---

## Pattern Summary Inventory

| Pattern | Category | Classification | Confidence | Primary Source Location |
|---|---|:---:|:---:|---|
| **Dependency Injection (IoC)** | Structural / Architectural | **Existing** | High (100%) | `src/infrastructure/config/container.ts` |
| **Repository Pattern** | Architectural / Data Access | **Existing** | High (100%) | `src/domain/repositories/`, `src/infrastructure/database/` |
| **Adapter Pattern** | Structural (GoF) | **Existing** | High (100%) | `src/infrastructure/services/StripeService.ts`, `cloudstorageservice.ts` |
| **Data Mapper / DTO** | Architectural / Enterprise | **Existing** | High (95%) | `src/infrastructure/database/mappers/DriverReviewMapper.ts` |
| **Singleton Pattern** | Creational (GoF) | **Existing** | High (100%) | Container singletons (`container.registerSingleton`) |
| **Middleware Chain (CoR)** | Behavioral (GoF) | **Existing** | High (95%) | `src/middleware/authMiddleware.ts`, `checkBlocked.ts` |
| **Observer / Pub-Sub** | Behavioral (GoF) | **Partial** | Medium (60%) | `src/infrastructure/services/SocketNotification.ts` (coupled socket calls) |
| **State Pattern** | Behavioral (GoF) | **Absent** | High (100%) | Driver status & Booking lifecycle use raw string enums and procedural `if` |
| **Strategy Pattern** | Behavioral (GoF) | **Absent** | High (100%) | `FareCalculatorService.ts` hardcodes if-else branches |
| **Factory Pattern** | Creational (GoF) | **Absent** | High (100%) | No polymorphic factory classes; direct container instantiation |

---

## Detailed Pattern Analyses

### 1. Dependency Injection & Inversion of Control (IoC)
* **Classification:** **Existing** (Confidence: 100%)
* **Intent:** Decouple high-level business use cases from low-level database, cache, and cloud communication infrastructure by injecting abstract dependencies at runtime.
* **Source Evidence:**
  * [`src/infrastructure/config/container.ts:45-101`](file:///d:/design-patterns-case-study/src/infrastructure/config/container.ts#L45-L101) configures the TSyringe IoC container, binding interfaces (`IBookingRepository`, `IUserRepository`, `IStripeService`) to concrete classes (`MongoBookingRepository`, `MongoUserRepository`, `PaymentService`).
  * [`src/application/use_cases/User/BookDriver.ts:28-35`](file:///d:/design-patterns-case-study/src/application/use_cases/User/BookDriver.ts#L28-L35) uses `@injectable()` and `@inject(TOKENS.IBOOKING_REPO)`.
* **Alternatives Considered:** Manual dependency instantiation in route files or Service Locator pattern.
* **Consequences:** Excellent modularity and unit-testability; facilitates mocking database repositories during tests.

---

### 2. Repository Pattern
* **Classification:** **Existing** (Confidence: 100%)
* **Intent:** Mediate between the domain logic and data mapping layers using a collection-like interface for accessing domain objects.
* **Source Evidence:**
  * Domain interfaces: [`src/domain/repositories/IBaseRepository.ts`](file:///d:/design-patterns-case-study/src/domain/repositories/IBaseRepository.ts), [`IBookingrepository.ts`](file:///d:/design-patterns-case-study/src/domain/repositories/IBookingrepository.ts), [`IDriverepository.ts`](file:///d:/design-patterns-case-study/src/domain/repositories/IDriverepository.ts).
  * Infrastructure implementations: [`src/infrastructure/database/BaseRepository.ts`](file:///d:/design-patterns-case-study/src/infrastructure/database/BaseRepository.ts), [`MongoBookingRepository.ts`](file:///d:/design-patterns-case-study/src/infrastructure/database/MongoBookingRepository.ts), [`MongodriverRepository.ts`](file:///d:/design-patterns-case-study/src/infrastructure/database/MongodriverRepository.ts).
* **Consequences:** Completely shields use cases from Mongoose database queries, allowing underlying database engines to be substituted without altering domain logic.

---

### 3. Adapter Pattern (Anti-Corruption Layer)
* **Classification:** **Existing** (Confidence: 100%)
* **Intent:** Convert the interface of third-party SDKs into an interface that domain use cases expect.
* **Source Evidence:**
  * **Stripe Adapter:** [`src/domain/services/IStripeService.ts`](file:///d:/design-patterns-case-study/src/domain/services/IStripeService.ts) adapted by [`src/infrastructure/services/StripeService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/StripeService.ts).
  * **Cloudinary Adapter:** [`src/domain/services/IFileStorageService.ts`](file:///d:/design-patterns-case-study/src/domain/services/IFileStorageService.ts) adapted by [`src/infrastructure/services/cloudstorageservice.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/cloudstorageservice.ts).
  * **Twilio Adapter:** `SMSService` adapted by [`src/infrastructure/services/TwilioSMSService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/TwilioSMSService.ts).
* **Consequences:** Domain use cases remain pristine and free from third-party vendor SDK coupling.

---

### 4. Observer / Pub-Sub Pattern
* **Classification:** **Partial** (Confidence: 60%)
* **Intent:** Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically.
* **Baseline Status:** While Socket.io is used for network-level push notifications (`SocketNotificationService.ts`), there is **no domain-level in-process event bus**. Use cases call `notificationService.cancelBookingNotification` directly. Secondary side effects (wallet refunds, audit logging) cannot subscribe independently.
* **Proposed Target (CH02):** Implement a decoupled in-memory `IBookingEventBus` and `BookingCancelledEvent` with independent subscriber handlers (`NotificationSubscriber`, `PaymentRefundSubscriber`, `AuditLogSubscriber`).

---

### 5. State Pattern
* **Classification:** **Absent** (Confidence: 100%)
* **Intent:** Allow an object to alter its behavior when its internal state changes.
* **Baseline Reality:**
  * An enum or status string alone (`"pending" | "approved" | "rejected"` in `Driver.ts`; `BookingStatus` in `Booking.ts`) does **not** constitute the State pattern.
  * Transitions are handled via procedural `if-else` branching in [`AdminChangeDriverStatus.ts`](file:///d:/design-patterns-case-study/src/application/use_cases/Admin/AdminChangeDriverStatus.ts) and [`UpdateBookingstatus.ts`](file:///d:/design-patterns-case-study/src/application/use_cases/Driver/UpdateBookingstatus.ts).
  * There are no polymorphic state classes, no encapsulated transition guards, and no state-specific capabilities.
* **Proposed Target (CH01 & CH02):** Encapsulate driver lifecycle states (`PendingDriverState`, `ApprovedDriverState`, `SuspendedDriverState`, `RejectedDriverState`) and booking lifecycle states using the GoF State pattern.

---

### 6. Strategy Pattern
* **Classification:** **Absent** (Confidence: 100%)
* **Intent:** Define a family of algorithms, encapsulate each one, and make them interchangeable.
* **Baseline Reality:**
  * Fare calculation in [`FareCalculatorService.ts:20-34`](file:///d:/design-patterns-case-study/src/infrastructure/services/FareCalculatorService.ts#L20-L34) directly uses procedural `if (bookingType === BookingType.ONE_WAY)` and `if (bookingType === BookingType.ROUND_TRIP)`.
  * Multipliers are hardcoded (`PER_KM_RATE = 10`, `PER_DAY_RATE = 1000`).
  * There is no interchangeable strategy hierarchy or strategy contract.
* **Proposed Target (CH03):** Implement `IPricingStrategy` with concrete strategies (`StandardPricingStrategy`, `SurgeDynamicPricingStrategy`, `RentalDailyPricingStrategy`) and a `PricingStrategyFactory`.
