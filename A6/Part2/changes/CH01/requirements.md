# CH01: Driver Status Management & State Pattern Requirements

## 1. Context and Objective
In the baseline Sarathi application, driver status is represented as a primitive string union (`"pending" | "approved" | "rejected"`). Administrative status changes in `AdminChangeDriverStatus.ts` permit arbitrary mutations without checking the prior state or enforcing capability invariants.

The objective of CH01 is to introduce a formal `SUSPENDED` status, enforce strict legal state transitions, and govern driver capabilities via the GoF State Pattern.

## 2. Functional Requirements
1. **Status Definition:** Introduce `SUSPENDED` alongside existing `PENDING`, `APPROVED`, and `REJECTED` states.
2. **Transition Rules:**
   - `PENDING` -> `APPROVED` (Admin approval)
   - `PENDING` -> `REJECTED` (Admin rejection; mandatory reason)
   - `APPROVED` -> `SUSPENDED` (Admin disciplinary action; mandatory reason)
   - `APPROVED` -> `REJECTED` (Admin revocation; mandatory reason)
   - `SUSPENDED` -> `APPROVED` (Admin reinstatement)
   - `REJECTED` -> `PENDING` (Driver re-application)
   - Any other transition must be rejected with an `InvalidDriverStateTransitionError` / HTTP 400.
3. **Capability Guards:**
   - `canLogin`: Only `APPROVED` drivers can authenticate.
   - `canAcceptRides`: Only `APPROVED` drivers can be matched with new booking requests.
   - `canReceiveNewBookings`: Suspended and rejected drivers are strictly excluded from matchmaking queries.
4. **Audit and Reasons:** Rejection and suspension transitions must require non-empty explanatory reasons stored on the driver document.

## 3. Pattern Implementation: GoF State Pattern
- **Interface:** `IDriverState` (`getStatus()`, `canLogin()`, `canAcceptRides()`, `canReceiveNewBookings()`, `transitionTo(targetStatus, reason)`).
- **Concrete States:** `PendingState`, `ApprovedState`, `SuspendedState`, `RejectedState`.
- **Context/Factory:** `DriverStateFactory` to instantiate concrete state objects from stored state strings.

## 4. Verification and Acceptance Criteria
- Unit tests verify all valid transitions succeed and update driver state.
- Negative tests verify all illegal transitions throw `InvalidDriverStateTransitionError`.
- Integration tests confirm suspended drivers cannot accept rides in `BookDriver` use cases.
