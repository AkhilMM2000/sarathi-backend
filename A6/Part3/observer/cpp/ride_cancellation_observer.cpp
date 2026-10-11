/**
 * Part 3: Observer Pattern Implementation in C++ (C++17)
 * Dispatches Ride Cancellation Domain Events to multiple independent subscribers:
 * 1. NotificationSubscriber (Push/Socket alert to driver)
 * 2. PaymentRefundSubscriber (Automatic wallet refund credit)
 * 3. AuditLogSubscriber (Immutable audit record)
 */

#include <iostream>
#include <memory>
#include <vector>
#include <string>
#include <chrono>

struct BookingCancelledEvent {
    std::string bookingId;
    std::string userId;
    std::string driverId;
    std::string reason;
    double refundAmount;
    int64_t timestamp;

    BookingCancelledEvent(std::string bId, std::string uId, std::string dId, std::string r, double refund)
        : bookingId(std::move(bId)),
          userId(std::move(uId)),
          driverId(std::move(dId)),
          reason(std::move(r)),
          refundAmount(refund),
          timestamp(std::chrono::duration_cast<std::chrono::milliseconds>(
              std::chrono::system_clock::now().time_since_epoch()).count()) {}
};

class ICancellationSubscriber {
public:
    virtual ~ICancellationSubscriber() = default;
    virtual std::string getSubscriberName() const = 0;
    virtual void onBookingCancelled(const BookingCancelledEvent& event) = 0;
};

class NotificationSubscriber : public ICancellationSubscriber {
public:
    std::string getSubscriberName() const override { return "NotificationSubscriber"; }
    void onBookingCancelled(const BookingCancelledEvent& event) override {
        std::cout << "[NotificationSubscriber] Driver " << event.driverId 
                  << " notified: Ride " << event.bookingId << " cancelled. Reason: " << event.reason << "\n";
    }
};

class PaymentRefundSubscriber : public ICancellationSubscriber {
public:
    std::string getSubscriberName() const override { return "PaymentRefundSubscriber"; }
    void onBookingCancelled(const BookingCancelledEvent& event) override {
        if (event.refundAmount > 0.0) {
            std::cout << "[PaymentRefundSubscriber] Credited INR " << event.refundAmount 
                      << " to user " << event.userId << ".\n";
        }
    }
};

class AuditLogSubscriber : public ICancellationSubscriber {
    std::vector<std::string> logs_;
public:
    std::string getSubscriberName() const override { return "AuditLogSubscriber"; }
    void onBookingCancelled(const BookingCancelledEvent& event) override {
        std::string entry = "AUDIT: Booking " + event.bookingId + " cancelled at " + std::to_string(event.timestamp);
        logs_.push_back(entry);
        std::cout << "[AuditLogSubscriber] " << entry << "\n";
    }
};

class RideCancellationEventBus {
    std::vector<std::shared_ptr<ICancellationSubscriber>> subscribers_;
public:
    void subscribe(std::shared_ptr<ICancellationSubscriber> sub) {
        subscribers_.push_back(std::move(sub));
    }

    void publish(const BookingCancelledEvent& event) {
        for (const auto& sub : subscribers_) {
            try {
                sub->onBookingCancelled(event);
            } catch (const std::exception& e) {
                std::cerr << "Error in subscriber " << sub->getSubscriberName() << ": " << e.what() << "\n";
            }
        }
    }
};
