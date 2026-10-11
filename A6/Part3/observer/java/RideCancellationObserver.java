/**
 * Part 3: Observer Pattern Implementation in Java
 * Dispatches Ride Cancellation Domain Events to multiple independent subscribers:
 * 1. NotificationSubscriber (Push/Socket alert to driver)
 * 2. PaymentRefundSubscriber (Automatic wallet refund credit)
 * 3. AuditLogSubscriber (Immutable audit record)
 */

import java.util.*;


class BookingCancelledEvent {
    private final String bookingId;
    private final String userId;
    private final String driverId;
    private final String reason;
    private final double refundAmount;
    private final long timestamp;

    public BookingCancelledEvent(String bookingId, String userId, String driverId, String reason, double refundAmount) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.driverId = driverId;
        this.reason = reason;
        this.refundAmount = refundAmount;
        this.timestamp = System.currentTimeMillis();
    }

    public String getBookingId() { return bookingId; }
    public String getUserId() { return userId; }
    public String getDriverId() { return driverId; }
    public String getReason() { return reason; }
    public double getRefundAmount() { return refundAmount; }
    public long getTimestamp() { return timestamp; }
}

interface ICancellationSubscriber {
    String getSubscriberName();
    void onBookingCancelled(BookingCancelledEvent event);
}

class NotificationSubscriber implements ICancellationSubscriber {
    @Override
    public String getSubscriberName() { return "NotificationSubscriber"; }

    @Override
    public void onBookingCancelled(BookingCancelledEvent event) {
        System.out.println("[NotificationSubscriber] Driver " + event.getDriverId() + 
            " notified: Ride " + event.getBookingId() + " was cancelled. Reason: " + event.getReason());
    }
}

class PaymentRefundSubscriber implements ICancellationSubscriber {
    @Override
    public String getSubscriberName() { return "PaymentRefundSubscriber"; }

    @Override
    public void onBookingCancelled(BookingCancelledEvent event) {
        if (event.getRefundAmount() > 0) {
            System.out.println("[PaymentRefundSubscriber] Credited INR " + event.getRefundAmount() + 
                " to user " + event.getUserId() + " for cancelled ride " + event.getBookingId());
        }
    }
}

class AuditLogSubscriber implements ICancellationSubscriber {
    private final List<String> auditLogs = new ArrayList<>();

    @Override
    public String getSubscriberName() { return "AuditLogSubscriber"; }

    @Override
    public void onBookingCancelled(BookingCancelledEvent event) {
        String log = "AUDIT: Booking " + event.getBookingId() + " cancelled at " + event.getTimestamp();
        auditLogs.add(log);
        System.out.println("[AuditLogSubscriber] " + log);
    }

    public List<String> getAuditLogs() { return Collections.unmodifiableList(auditLogs); }
}

class RideCancellationEventBus {
    private final List<ICancellationSubscriber> subscribers = new ArrayList<>();

    public void subscribe(ICancellationSubscriber subscriber) {
        subscribers.add(Objects.requireNonNull(subscriber));
    }

    public void publish(BookingCancelledEvent event) {
        for (ICancellationSubscriber sub : subscribers) {
            try {
                sub.onBookingCancelled(event);
            } catch (Exception e) {
                System.err.println("Subscriber " + sub.getSubscriberName() + " failed: " + e.getMessage());
            }
        }
    }
}

public class RideCancellationObserver {
    public static void main(String[] args) {
        RideCancellationEventBus bus = new RideCancellationEventBus();
        bus.subscribe(new NotificationSubscriber());
        bus.subscribe(new PaymentRefundSubscriber());
        bus.subscribe(new AuditLogSubscriber());

        BookingCancelledEvent event = new BookingCancelledEvent(
            "B-9901", "U-12", "D-55", "Rider change of plans", 450.0
        );

        bus.publish(event);
    }
}
