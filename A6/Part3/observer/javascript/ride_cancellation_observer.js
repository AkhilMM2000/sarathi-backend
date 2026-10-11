/**
 * Part 3: Observer Pattern Implementation in JavaScript (Node.js)
 * Dispatches Ride Cancellation Domain Events to multiple independent subscribers:
 * 1. NotificationSubscriber (Push/Socket alert to driver)
 * 2. PaymentRefundSubscriber (Automatic wallet refund credit)
 * 3. AuditLogSubscriber (Immutable audit record)
 */

class BookingCancelledEvent {
  constructor({ bookingId, userId, driverId, reason, refundAmount }) {
    this.bookingId = bookingId;
    this.userId = userId;
    this.driverId = driverId;
    this.reason = reason;
    this.refundAmount = refundAmount || 0;
    this.timestamp = Date.now();
  }
}

class ICancellationSubscriber {
  get subscriberName() { throw new Error("Must implement subscriberName"); }
  async onBookingCancelled(event) { throw new Error("Must implement onBookingCancelled"); }
}

class NotificationSubscriber extends ICancellationSubscriber {
  get subscriberName() { return "NotificationSubscriber"; }

  async onBookingCancelled(event) {
    console.log(`[NotificationSubscriber] Driver ${event.driverId} notified: Ride ${event.bookingId} cancelled. Reason: ${event.reason}`);
  }
}

class PaymentRefundSubscriber extends ICancellationSubscriber {
  get subscriberName() { return "PaymentRefundSubscriber"; }

  async onBookingCancelled(event) {
    if (event.refundAmount > 0) {
      console.log(`[PaymentRefundSubscriber] Credited INR ${event.refundAmount} to user ${event.userId}.`);
    }
  }
}

class AuditLogSubscriber extends ICancellationSubscriber {
  constructor() {
    super();
    this.logs = [];
  }

  get subscriberName() { return "AuditLogSubscriber"; }

  async onBookingCancelled(event) {
    const entry = `AUDIT: Booking ${event.bookingId} cancelled at ${event.timestamp}`;
    this.logs.push(entry);
    console.log(`[AuditLogSubscriber] ${entry}`);
  }
}

class RideCancellationEventBus {
  constructor() {
    this.subscribers = [];
  }

  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  async publish(event) {
    for (const sub of this.subscribers) {
      try {
        await sub.onBookingCancelled(event);
      } catch (err) {
        console.error(`Error in subscriber ${sub.subscriberName}:`, err.message);
      }
    }
  }
}

module.exports = {
  BookingCancelledEvent,
  ICancellationSubscriber,
  NotificationSubscriber,
  PaymentRefundSubscriber,
  AuditLogSubscriber,
  RideCancellationEventBus
};
