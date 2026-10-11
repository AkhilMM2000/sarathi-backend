"""
Part 3: Observer Pattern Implementation in Python
Dispatches Ride Cancellation Domain Events to multiple independent subscribers:
1. NotificationSubscriber (Push/Socket alert to driver)
2. PaymentRefundSubscriber (Automatic wallet refund credit)
3. AuditLogSubscriber (Immutable audit record)
"""

from abc import ABC, abstractmethod
from typing import List, NamedTuple
import time

class BookingCancelledEvent(NamedTuple):
    booking_id: str
    user_id: str
    driver_id: str
    reason: str
    refund_amount: float
    timestamp: float = time.time()

class ICancellationSubscriber(ABC):
    @property
    @abstractmethod
    def subscriber_name(self) -> str:
        pass

    @abstractmethod
    def on_booking_cancelled(self, event: BookingCancelledEvent) -> None:
        pass

class NotificationSubscriber(ICancellationSubscriber):
    @property
    def subscriber_name(self) -> str:
        return "NotificationSubscriber"

    def on_booking_cancelled(self, event: BookingCancelledEvent) -> None:
        print(f"[NotificationSubscriber] Driver {event.driver_id} notified: Ride {event.booking_id} cancelled.")

class PaymentRefundSubscriber(ICancellationSubscriber):
    @property
    def subscriber_name(self) -> str:
        return "PaymentRefundSubscriber"

    def on_booking_cancelled(self, event: BookingCancelledEvent) -> None:
        if event.refund_amount > 0:
            print(f"[PaymentRefundSubscriber] Credited INR {event.refund_amount} to user {event.user_id}.")

class AuditLogSubscriber(ICancellationSubscriber):
    def __init__(self):
        self.logs: List[str] = []

    @property
    def subscriber_name(self) -> str:
        return "AuditLogSubscriber"

    def on_booking_cancelled(self, event: BookingCancelledEvent) -> None:
        log_entry = f"AUDIT: Booking {event.booking_id} cancelled at {event.timestamp}"
        self.logs.append(log_entry)
        print(f"[AuditLogSubscriber] {log_entry}")

class RideCancellationEventBus:
    def __init__(self):
        self._subscribers: List[ICancellationSubscriber] = []

    def subscribe(self, subscriber: ICancellationSubscriber) -> None:
        self._subscribers.append(subscriber)

    def publish(self, event: BookingCancelledEvent) -> None:
        for subscriber in self._subscribers:
            try:
                subscriber.on_booking_cancelled(event)
            except Exception as ex:
                print(f"Error in {subscriber.subscriber_name}: {ex}")
