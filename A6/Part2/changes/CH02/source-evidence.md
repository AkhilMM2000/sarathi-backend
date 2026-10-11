# CH02 Source Evidence: Safe Ride Cancellation & Observer Pattern

## 1. Baseline Evidence vs. Refactored Evidence

### A. Actor Authorization Guard
* **Baseline File:** [`src/application/use_cases/User/CancelBooking.ts:26-33`](file:///d:/design-patterns-case-study/src/application/use_cases/User/CancelBooking.ts#L26-L33)
  ```typescript
  async execute(input: CancelBookingInput): Promise<void> {
    const { bookingId, status, reason } = input;
    const booking = await this._bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new AuthError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
  ```
  *Observed:* No comparison between authenticated user (`req.user.id`) and `booking.userId`.
* **Refactored File:** `A6/Part2/changes/CH02/patch.diff`
  ```typescript
  if (actorRole !== 'admin' && booking.userId.toString() !== actorId) {
    throw new AuthError("You are not authorized to cancel this booking.", HTTP_STATUS_CODES.FORBIDDEN);
  }
  ```
  *Evolution:* Enforces strict role-based authorization: only the booking owner or an administrator can cancel.

---

### B. Conflicting & Terminal State Invariants
* **Baseline File:** [`src/application/use_cases/User/CancelBooking.ts:35-46`](file:///d:/design-patterns-case-study/src/application/use_cases/User/CancelBooking.ts#L35-L46)
  ```typescript
  if (booking.status === BookingStatus.CONFIRMED) {
    ...
    if (Date.now() > cutoffTime) {
      throw new AuthError("Bookings can only be cancelled before 9:00 PM of the day before the ride.", HTTP_STATUS_CODES.BAD_REQUEST);
    }
  }
  await this._bookingRepo.updateBooking(bookingId, { status, reason });
  ```
  *Observed:* If `booking.status === BookingStatus.COMPLETED` or `CANCELLED`, code unconditionally overwrites the database with `status: CANCELLED`.
* **Refactored File:** `A6/Part2/changes/CH02/patch.diff`
  ```typescript
  const bookingState = BookingStateFactory.create(booking.status);
  const cancellationCheck = bookingState.canCancel(actorRole, booking.startDate);
  if (!cancellationCheck.allowed) {
    throw new InvalidBookingStateTransitionError(cancellationCheck.reason);
  }
  ```
  *Evolution:* `CompletedBookingState` and `CancelledBookingState` reject cancellation with HTTP 409 Conflict.

---

### C. Decoupled Observer / Pub-Sub Event Bus
* **Baseline File:** [`src/application/use_cases/User/CancelBooking.ts:52-54`](file:///d:/design-patterns-case-study/src/application/use_cases/User/CancelBooking.ts#L52-L54)
  ```typescript
  if (booking.driverId) {
    await this._notificationService.cancelBookingNotification(booking.driverId.toString(), { status, reason, startDate: booking.startDate, bookingId });
  }
  ```
  *Observed:* Procedural coupling directly to notification service; no refund logic exists.
* **Refactored File:** `A6/Part2/changes/CH02/patch.diff`
  ```typescript
  await this._eventBus.publish(new BookingCancelledEvent({
    bookingId,
    userId: booking.userId.toString(),
    driverId: booking.driverId?.toString(),
    actorId,
    actorRole,
    reason,
    walletDeduction: booking.walletDeduction,
    paymentIntentId: booking.paymentIntentId,
    cancelledAt: new Date()
  }));
  ```
  *Evolution:* Dispatches `BookingCancelledEvent`. `PaymentRefundSubscriber` automatically credits wallet or refunds Stripe, while `NotificationSubscriber` pushes socket alerts.
