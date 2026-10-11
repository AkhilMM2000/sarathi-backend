export interface BookingCancelledEventPayload {
  bookingId: string;
  userId: string;
  driverId?: string;
  actorId: string;
  actorRole: "user" | "driver" | "admin";
  reason: string;
  cancelledAt: Date;
  walletDeduction?: number;
  paymentIntentId?: string;
}

export interface IBookingEventSubscriber<T> {
  handle(event: T): Promise<void>;
}

export interface IBookingEventBus {
  subscribe<T>(eventType: string, subscriber: IBookingEventSubscriber<T>): void;
  publish<T>(eventType: string, payload: T): Promise<void>;
}
