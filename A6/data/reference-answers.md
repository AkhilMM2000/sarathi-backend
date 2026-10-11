# A6 LLM Evaluation Dataset: Reference Answers & Detailed Grading Guides

This document provides complete, ground-truth reference answers and scoring criteria for each evaluation record in [`A6/data/evaluation-dataset.jsonl`](file:///d:/design-patterns-case-study/A6/data/evaluation-dataset.jsonl).

---

## Record A6-EVAL-001: Pattern Identification from Source Excerpt
* **Task Category:** 1. Identifying patterns from actual source-code excerpts
* **Difficulty:** Easy
* **Provenance:** `reconstructed_workflow_prompt`
* **Evidence References:**
  * [`src/infrastructure/config/container.ts`](file:///d:/design-patterns-case-study/src/infrastructure/config/container.ts)
  * [`src/domain/repositories/IBookingrepository.ts`](file:///d:/design-patterns-case-study/src/domain/repositories/IBookingrepository.ts)

### Prompt
> Analyze the following TypeScript source excerpt from Sarathi's IoC container:
> ```typescript
> import { container } from "tsyringe";
> import { MongoBookingRepository } from "../database/MongoBookingRepository";
> import { StripeService } from "../services/StripeService";
>
> container.registerSingleton<IBookingRepository>("IBookingRepository", MongoBookingRepository);
> container.registerSingleton<IStripeService>("IStripeService", StripeService);
> ```
> Which software design and architectural patterns are directly instantiated by this code, and what role do they play in maintaining architectural boundaries?

### Ground-Truth Reference Answer
1. **Dependency Injection (DI) / Inversion of Control (IoC):** Instantiated via Microsoft TSyringe's `container.registerSingleton`. Registers concrete implementations against tokenized abstractions so use cases receive dependencies via constructor injection rather than direct instantiation (`new`).
2. **Repository Pattern:** Represented by `IBookingRepository` and `MongoBookingRepository`. Mediates between domain use cases and the data mapping layer (Mongoose/MongoDB), keeping business rules agnostic of persistence.
3. **Adapter Pattern:** Represented by `IStripeService` and `StripeService`. Encapsulates third-party Stripe SDK calls within a domain-compatible interface contract.
4. **Architectural Role:** Enforces Clean Architecture's **Dependency Inversion Principle (DIP)**: source-code dependencies point inward toward domain abstractions.

### Grading Criteria
* **Full Credit (5/5):** Identifies DI/IoC, Repository pattern, and Adapter pattern; explains DIP / layer boundary decoupling.
* **Partial Credit (3/5):** Identifies DI and Repository, but omits Adapter or architectural role.
* **No Credit (0-1/5):** Fails to identify DI or hallucinates patterns not present in the excerpt (e.g., claiming Factory or Observer).

---

## Record A6-EVAL-002: Explaining Pattern Claims with Source Evidence
* **Task Category:** 2. Explaining pattern claims with precise source evidence
* **Difficulty:** Medium
* **Provenance:** `reconstructed_workflow_prompt`
* **Evidence References:**
  * [`src/infrastructure/services/StripeService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/StripeService.ts)
  * [`src/infrastructure/services/cloudstorageservice.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/cloudstorageservice.ts)
  * [`src/infrastructure/services/TwilioSMSService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/TwilioSMSService.ts)
  * [`src/infrastructure/store/UserRegisterStore.ts`](file:///d:/design-patterns-case-study/src/infrastructure/store/UserRegisterStore.ts)

### Prompt
> Substantiate or refute the following architectural claim using specific source files and interfaces from the Sarathi backend repository: 'The system utilizes the GoF Adapter pattern to encapsulate third-party infrastructure dependencies.'

### Ground-Truth Reference Answer
The claim is **SUBSTANTIATED**. The repository employs GoF Object Adapters across several external SDKs:
1. **Payment Adapter:** `StripeService.ts` implements `IStripeService`, converting domain payment calls into Stripe Node SDK operations (`stripe.paymentIntents.create`, `stripe.accounts.create`).
2. **Cloud Storage Adapter:** `cloudstorageservice.ts` implements `IFileStorageService`, wrapping Cloudinary API methods (`cloudinary.uploader.upload_stream`).
3. **SMS Communication Adapter:** `TwilioSMSService.ts` implements domain SMS interfaces, wrapping the Twilio Client SDK (`twilioClient.messages.create`).
4. **Cache/Storage Adapter:** `UserRegisterStore.ts` implements `IRedisrepository`, wrapping Upstash Redis HTTP/REST client calls into standard key-value storage methods.

### Grading Criteria
* **Full Credit (5/5):** Confirms claim as substantiated; cites at least 2 authentic adapter files with their corresponding interface; explains how external SDKs are wrapped.
* **Partial Credit (3/5):** Affirms claim but only provides 1 file reference or lacks interface names.
* **No Credit (0-1/5):** Refutes claim or cites non-existent files.

---

## Record A6-EVAL-003: Distinguishing Real Pattern Structure from Superficial Resemblance
* **Task Category:** 3. Distinguishing real pattern structure from superficial resemblance
* **Difficulty:** Medium
* **Provenance:** `reconstructed_workflow_prompt`
* **Evidence References:**
  * [`src/domain/models/Driver.ts`](file:///d:/design-patterns-case-study/src/domain/models/Driver.ts)
  * [`src/presentation/controllers/AdminController.ts`](file:///d:/design-patterns-case-study/src/presentation/controllers/AdminController.ts)

### Prompt
> In the baseline Sarathi application, the Driver domain model includes: `status: "pending" | "approved" | "rejected"`. An engineer claims: 'The baseline codebase implements the GoF State Pattern to manage driver lifecycles.' Evaluate whether this claim is true or false, explaining the architectural difference between state representation and the GoF State Pattern.

### Ground-Truth Reference Answer
The claim is **FALSE**.
* **State Data vs. GoF State Pattern:** A string union or enumeration (`"pending" | "approved" | "rejected"`) simply represents an entity's current state attribute (data). It does not constitute the GoF State Pattern.
* **GoF State Pattern Requirements:** Requires encapsulating state-dependent behavior and transitions inside polymorphic state subclasses conforming to a common interface (e.g., `IDriverState`).
* **Baseline Reality:** In baseline Sarathi, status mutations occur via procedural assignments and `if-else` branching in `AdminChangeDriverStatus.ts`. Drivers have no polymorphic state classes, no capability encapsulation (`canLogin`, `canAcceptRides`), and no transition guards.

### Grading Criteria
* **Full Credit (5/5):** Evaluates claim as FALSE; articulates difference between state data (enum/string) and GoF State pattern (polymorphic classes delegating behavior); cites procedural baseline mutations.
* **Partial Credit (3/5):** States claim is false but provides vague reasoning without contrasting polymorphic delegation and enum fields.
* **No Credit (0-1/5):** Evaluates claim as TRUE based on enum presence alone.

---

## Record A6-EVAL-004: Recognizing When State, Strategy, or Observer is Absent or Partial
* **Task Category:** 4. Recognizing when State, Strategy, or Observer is absent or only partial
* **Difficulty:** Medium
* **Provenance:** `reconstructed_workflow_prompt`
* **Evidence References:**
  * [`src/infrastructure/services/FareCalculatorService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/FareCalculatorService.ts)
  * [`src/infrastructure/services/SocketNotification.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/SocketNotification.ts)

### Prompt
> Evaluate the baseline implementation of fare calculation in `FareCalculatorService.ts` and driver notifications in `SocketNotification.ts`. Classify each pattern (Strategy Pattern and Observer Pattern) as Present, Partial, or Absent, providing architectural justifications.

### Ground-Truth Reference Answer
1. **Strategy Pattern in Fare Calculation: ABSENT (Confidence 1.0).**
   * *Justification:* `FareCalculatorService.ts` uses hardcoded procedural calculation (`distanceInKm * 10`) and inline `if-else` statements. There is no `IPricingStrategy` interface, no polymorphic concrete strategy classes, and no mechanism to inject alternative pricing algorithms at runtime.
2. **Observer Pattern in Driver Notifications: PARTIAL (Confidence 0.60).**
   * *Justification:* `SocketNotification.ts` implements real-time push messaging via Socket.io to specific sockets. However, from an architectural domain perspective, it is only a raw network messaging utility. It lacks an in-memory or message-queue domain event bus where decoupled subscribers can listen for domain lifecycle events (e.g., `BookingCancelledEvent`).

### Grading Criteria
* **Full Credit (5/5):** Correctly classifies Strategy as Absent and Observer as Partial/Absent as a domain pattern; provides accurate architectural reasoning for both.
* **Partial Credit (3/5):** Classifies correctly but gives weak reasoning (e.g., confuses network sockets with domain observers).
* **No Credit (0-1/5):** Claims Strategy is Present in baseline or fails to understand domain event decoupling.

---

## Record A6-EVAL-005: Recommending Minimal Refactoring with Tradeoffs
* **Task Category:** 5. Recommending minimal refactoring with tradeoffs
* **Difficulty:** Hard
* **Provenance:** `reconstructed_workflow_prompt`
* **Evidence References:**
  * [`src/domain/models/Driver.ts`](file:///d:/design-patterns-case-study/src/domain/models/Driver.ts)
  * [`A6/Part2/changes/CH01/requirements.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH01/requirements.md)

### Prompt
> In scenario CH01, the system requires a new SUSPENDED status for drivers that disallows logins and ride matchmaking while allowing reinstatement. Propose a minimal refactoring plan introducing the State Pattern. Compare the tradeoffs between: (A) Explicit GoF State Pattern classes, (B) A transition-table state machine library (e.g., XState), and (C) Database-level validation checks.

### Ground-Truth Reference Answer
* **Minimal Refactoring Plan:**
  1. Define `IDriverState` with methods `getStatus()`, `canLogin()`, `canAcceptRides()`, `canReceiveNewBookings()`, `transitionTo(targetStatus, reason)`.
  2. Implement concrete classes: `PendingState`, `ApprovedState`, `SuspendedState`, `RejectedState`.
  3. Create `DriverStateFactory` to instantiate state objects from persisted database strings.
  4. Refactor `AdminChangeDriverStatus` and `BookDriver` to invoke state capabilities rather than raw string comparisons.
* **Tradeoff Analysis:**
  * **Option A (GoF State Classes):** Clean OOP, zero external npm dependencies, strictly typed in TypeScript. Adds slight file overhead (4 classes). Best fit for domain logic within Clean Architecture.
  * **Option B (XState / State Machine Library):** Declarative, visualizable statecharts, handles complex parallel states. Overhead: heavy npm runtime dependency and steep learning curve for a simple 4-state lifecycle.
  * **Option C (DB-level enum/constraints):** Enforces column values at storage layer. Does not encapsulate capability logic (`canLogin`, `canAcceptRides`) or domain exceptions in the application layer.

### Grading Criteria
* **Full Credit (5/5):** Proposes `IDriverState` and concrete state classes; details capability guards; provides balanced pros and cons across all 3 options.
* **Partial Credit (3/5):** Proposes valid refactoring but omits one tradeoff comparison or fails to address capability guards.
* **No Credit (0-1/5):** Recommends adding more `if-else` branches or fails to explain GoF State architecture.

---

## Record A6-EVAL-006: Generating Code from Acceptance Criteria
* **Task Category:** 6. Generating code from acceptance criteria
* **Difficulty:** Hard
* **Provenance:** `reconstructed_workflow_prompt`
* **Evidence References:**
  * [`A6/Part2/code/src/domain/strategies/pricing/IPricingStrategy.ts`](file:///d:/design-patterns-case-study/A6/Part2/code/src/domain/strategies/pricing/IPricingStrategy.ts)
  * [`A6/Part2/changes/CH03/requirements.md`](file:///d:/design-patterns-case-study/A6/Part2/changes/CH03/requirements.md)

### Ground-Truth Reference Answer
```typescript
export enum RideType {
  ECONOMY = "ECONOMY",
  PREMIUM = "PREMIUM",
}

export interface PricingContext {
  rideType: RideType;
  distanceKm: number;
  durationMinutes: number;
  surgeMultiplier: number;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  totalFare: number;
}

export interface IPricingStrategy {
  calculateFare(context: PricingContext): FareBreakdown;
}

export class StandardPricingStrategy implements IPricingStrategy {
  calculateFare(ctx: PricingContext): FareBreakdown {
    if (ctx.distanceKm < 0) {
      throw new Error("Distance cannot be negative");
    }
    const clampedSurge = Math.min(2.5, Math.max(1.0, ctx.surgeMultiplier || 1.0));
    const rates = ctx.rideType === RideType.PREMIUM
      ? { base: 100, perKm: 20, perMin: 3.5 }
      : { base: 50, perKm: 12, perMin: 2.0 };

    const distFare = ctx.distanceKm * rates.perKm;
    const timeFare = (ctx.durationMinutes || 0) * rates.perMin;
    const total = Math.round((rates.base + distFare + timeFare) * clampedSurge);

    return {
      baseFare: rates.base,
      distanceFare: distFare,
      timeFare,
      surgeMultiplier: clampedSurge,
      totalFare: total,
    };
  }
}
```

### Grading Criteria
* **Full Credit (5/5):** Valid TypeScript syntax; validates negative distance; clamps surge between 1.0x and 2.5x; implements exact rates specified for ECONOMY and PREMIUM; calculates total correctly.
* **Partial Credit (3/5):** Code functions but misses surge clamping or negative distance validation.
* **No Credit (0-1/5):** Non-functional code, syntax errors, or ignores interface structure.

---

## Record A6-EVAL-007: Cross-Language Semantic Equivalence Comparison
* **Task Category:** 7. Comparing semantically equivalent implementations across Java, Python, JavaScript, and C++
* **Difficulty:** Hard
* **Provenance:** `reconstructed_workflow_prompt`
* **Evidence References:**
  * [`A6/Part3/state/java/DriverState.java`](file:///d:/design-patterns-case-study/A6/Part3/state/java/DriverState.java)
  * [`A6/Part3/state/cpp/driver_state.cpp`](file:///d:/design-patterns-case-study/A6/Part3/state/cpp/driver_state.cpp)
  * [`A6/Part3/state/python/driver_state.py`](file:///d:/design-patterns-case-study/A6/Part3/state/python/driver_state.py)
  * [`A6/Part3/state/javascript/driver_state.js`](file:///d:/design-patterns-case-study/A6/Part3/state/javascript/driver_state.js)

### Ground-Truth Reference Answer
1. **Interface Contracts:**
   * **Java:** Uses standard `interface IDriverState` with compile-time checked method signatures.
   * **C++17:** Uses an abstract base class `class IDriverState` with pure virtual methods (`= 0`) and a virtual destructor (`virtual ~IDriverState() = default`).
   * **Python:** Uses `abc.ABC` base class with `@abstractmethod` decorators enforcing subclass adherence at instantiation.
   * **JavaScript:** Implements a base class with methods throwing `Error('Not implemented')` or class inheritance without static interface types.
2. **Error Handling:**
   * All four implementations enforce illegal transitions by throwing domain-specific exceptions (`InvalidStateTransitionException` in Java/C++, `InvalidStateTransitionError` in JS/Python).
3. **Memory and Lifecycle Management:**
   * **Java, Python, JavaScript:** Depend entirely on automatic runtime garbage collection to reclaim discarded state instances upon transitions.
   * **C++17:** Requires explicit ownership semantics via `std::unique_ptr<IDriverState>`. Transition methods return `std::unique_ptr<IDriverState>`, ensuring deterministic deallocation (RAII) and eliminating memory leaks without garbage collection pauses.

### Grading Criteria
* **Full Credit (5/5):** Accurately contrasts interface mechanisms across all 4 languages; mentions exception throwing; details C++ RAII / `std::unique_ptr` vs garbage collection in Java/Python/JS.
* **Partial Credit (3/5):** Covers 2 or 3 languages accurately but misses C++ memory semantics or Python ABC details.
* **No Credit (0-1/5):** Fails to distinguish static typing vs dynamic typing, or makes inaccurate claims about C++ garbage collection.

---

## Record A6-EVAL-008: Detecting Unsupported Claims / Hallucinations
* **Task Category:** 8. Detecting unsupported claims about tests, payments, notifications, or pricing
* **Difficulty:** Medium
* **Provenance:** `illustrative_synthetic_test`
* **Evidence References:**
  * [`src/application/use_cases/User/CancelBooking.ts`](file:///d:/design-patterns-case-study/src/application/use_cases/User/CancelBooking.ts)
  * [`src/infrastructure/services/FareCalculatorService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/FareCalculatorService.ts)
  * [`src/infrastructure/services/StripeService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/StripeService.ts)

### Ground-Truth Reference Answer
* **Statement 1:** *'The repository contains a complete Jest test suite with 85% code coverage for the ride booking lifecycle.'* -> **UNSUPPORTED.** The baseline upstream repository contains zero unit test files and no Jest/Vitest configuration.
* **Statement 2:** *'The baseline cancellation use case automatically calls Stripe to refund the rider\'s credit card.'* -> **UNSUPPORTED.** In `src/application/use_cases/User/CancelBooking.ts`, the use case only mutates the booking status to `CANCELLED` and emits a socket event; it contains zero payment or refund logic.
* **Statement 3:** *'The dynamic pricing engine uses an online reinforcement learning model to adjust surges in real time.'* -> **UNSUPPORTED.** `FareCalculatorService.ts` contains a single hardcoded calculation (`distanceInKm * 10`) with no machine learning models.
* **Statement 4:** *'The application integrates Stripe Connect to manage driver payout accounts.'* -> **SUPPORTED.** `StripeService.ts` contains concrete implementations for `stripe.accounts.create` and driver connected account setup.

### Grading Criteria
* **Full Credit (5/5):** Correctly classifies all 4 statements (Statements 1, 2, 3 as UNSUPPORTED; Statement 4 as SUPPORTED) and provides factual citations for each.
* **Partial Credit (3/5):** Correctly classifies 3 of the 4 statements.
* **No Credit (0-1/5):** Classifies 2 or more statements incorrectly.
