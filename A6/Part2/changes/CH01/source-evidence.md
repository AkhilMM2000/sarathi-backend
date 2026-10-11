# CH01 Source Evidence: Driver Status Management & State Pattern

## 1. Baseline Evidence vs. Refactored Evidence

### A. Driver Status Enum & Model
* **Baseline File:** [`src/domain/models/Driver.ts:25`](file:///d:/design-patterns-case-study/src/domain/models/Driver.ts#L25)
  ```typescript
  status: "pending" | "approved" | "rejected";
  ```
  *Observed:* Primitive string literal union; lacks `SUSPENDED` status.
* **Refactored File:** `A6/Part2/changes/CH01/DriverState.ts` & evolved model
  ```typescript
  export enum DriverStatus {
    PENDING = "pending",
    APPROVED = "approved",
    SUSPENDED = "suspended",
    REJECTED = "rejected"
  }
  ```
  *Evolution:* Introduces `SUSPENDED` with `IDriverState` polymorphic capabilities.

---

### B. Admin Status Mutation Guard
* **Baseline File:** [`src/application/use_cases/Admin/AdminChangeDriverStatus.ts:24-30`](file:///d:/design-patterns-case-study/src/application/use_cases/Admin/AdminChangeDriverStatus.ts#L24-L30)
  ```typescript
  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new AuthError("Invalid status value.", HTTP_STATUS_CODES.BAD_REQUEST);
  }
  if (status === "rejected" && !reason) {
    throw new AuthError("Rejection reason is required.", HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
  }
  ```
  *Observed:* No prior-state inspection; transitions are completely unconstrained.
* **Refactored File:** `A6/Part2/changes/CH01/patch.diff`
  ```typescript
  const currentState = DriverStateFactory.create(driver.status, driver.reason);
  const nextState = currentState.transitionTo(targetStatus, reason);
  await this._driverRepository.updateStatus(driverId, nextState.status, reason);
  ```
  *Evolution:* Replaces procedural branching with `currentState.transitionTo(...)`, enforcing transition matrix invariants.

---

### C. Driver Dispatch & Matchmaking Guard
* **Baseline File:** [`src/infrastructure/database/MongodriverRepository.ts:268-270`](file:///d:/design-patterns-case-study/src/infrastructure/database/MongodriverRepository.ts#L268-L270)
  ```typescript
  query: {
    _id: { $nin: excludedObjectIds },
    isBlock: false,
    status: 'approved',
    activePayment: true,
  }
  ```
  *Observed:* MongoDB aggregate query filters for `status: 'approved'`. Suspended drivers (`status: 'suspended'`) are automatically excluded from geospatial radius queries.
* **Targeted Booking Vulnerability in Baseline:** [`src/application/use_cases/User/BookDriver.ts:46-49`](file:///d:/design-patterns-case-study/src/application/use_cases/User/BookDriver.ts#L46-L49)
  ```typescript
  const isBooked = await this._bookingRepo.checkDriverAvailability(driverId, startDate, endDate);
  ```
  *Observed:* Targeted booking checks calendar slots but ignores whether targeted driver is approved or suspended.
* **Refactored Guard:**
  ```typescript
  const targetDriver = await this._driverRepo.findDriverById(driverId);
  const targetState = DriverStateFactory.create(targetDriver.status);
  if (!targetState.canReceiveNewBookings()) {
    throw new AuthError("The requested driver is suspended or not approved to take rides.", 400);
  }
  ```
