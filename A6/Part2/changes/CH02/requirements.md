# CH02: Ride Cancellation & Observer Pattern Requirements

## 1. Context and Objective
In the baseline Sarathi backend, `CancelBooking.ts` allows booking status to be updated to `CANCELLED`, but couples directly to socket notifications and lacks automated refunding, actor authorization checks, and audit logging.

The objective of CH02 is to introduce a safe cancellation workflow enforcing timezone cutoffs and actor roles, decoupled via the Observer / Domain Event Bus pattern.

## 2. Functional Requirements
1. **Permitted States for Cancellation:**
   - `PENDING` bookings may be cancelled at any time before driver acceptance.
   - `CONFIRMED` bookings may be cancelled by the user up until 9:00 PM IST of the day prior to the scheduled booking.
   - `CONFIRMED` bookings may be cancelled by administrators at any time prior to trip start.
   - `COMPLETED` bookings can NEVER be cancelled (reject with HTTP 409 Conflict).
   - Duplicate cancellation on `CANCELLED` bookings must be rejected with HTTP 409 Conflict.
2. **Actor Authorization:**
   - Only the booking owner (User) or an authenticated Admin may initiate cancellation.
   - Unauthorized attempts by non-owners must return HTTP 403 Forbidden.
3. **Decoupled Side Effects:**
   - Publish a `BookingCancelledEvent` containing `bookingId`, `userId`, `driverId`, `reason`, `cancelledBy`, and `refundAmount`.
   - **NotificationSubscriber:** Emits real-time socket events alerting the assigned driver.
   - **PaymentRefundSubscriber:** Credits rider wallet or issues Stripe refund if payment was already captured.
   - **AuditLogSubscriber:** Persists immutable cancellation telemetry.
4. **Resilience:** Notification dispatch or audit errors must not abort the atomic database cancellation update.

## 3. Pattern Implementation: Observer / Domain Event Bus
- **Event:** `BookingCancelledEvent`.
- **Bus Interface:** `IBookingEventBus` (`subscribe(eventName, handler)`, `publish(event)`).
- **Subscribers:** `NotificationSubscriber`, `PaymentRefundSubscriber`, `AuditLogSubscriber`.

## 4. Verification and Acceptance Criteria
- Unit tests verify cutoff validation (before 9:00 PM IST passes; after 9:00 PM IST rejected for users).
- Authorization tests confirm non-owners cannot cancel.
- Event dispatch tests verify all subscribers execute when a booking is cancelled.
