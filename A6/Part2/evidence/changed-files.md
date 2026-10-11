# Part 2 Changed Files Ledger

## Summary of Changes Across Scenarios

| Scenario | File Path | Layer | Nature of Change | Pattern Implemented |
|---|---|---|---|---|
| **CH01** | `src/domain/models/Driver.ts` | Domain | Extended status type with `suspended` | State Pattern |
| **CH01** | `src/domain/models/DriverState.ts` | Domain | Defined `IDriverState` & concrete state classes | State Pattern |
| **CH01** | `src/application/use_cases/Admin/AdminChangeDriverStatus.ts` | Application | Integrated state transition guards | State Pattern |
| **CH01** | `src/infrastructure/database/modals/Driverschema.ts` | Infrastructure | Added `"suspended"` to Mongoose enum | Persistence Schema |
| **CH02** | `src/domain/models/Booking.ts` | Domain | Added `cancelledAt`, `cancelledBy`, `cancelledByRole` | State & Observer |
| **CH02** | `src/domain/events/BookingEvents.ts` | Domain | Defined `BookingCancelledEvent`, `IBookingEventBus` | Observer / Pub-Sub |
| **CH02** | `src/application/use_cases/User/CancelBooking.ts` | Application | Added actor authorization, cutoff, and event bus | Observer / Pub-Sub |
| **CH02** | `src/infrastructure/database/modals/Bookingschema.ts` | Infrastructure | Schema fields for cancellation audit | Persistence Schema |
| **CH03** | `src/domain/models/Booking.ts` | Domain | Added `RideType` enum (`ECONOMY`, `PREMIUM`, `XL`) | Strategy Pattern |
| **CH03** | `src/domain/strategies/pricing/IPricingStrategy.ts` | Domain | Defined `IPricingStrategy`, `PricingContext`, `FareBreakdown` | Strategy Pattern |
| **CH03** | `src/infrastructure/services/pricing/PricingStrategyFactory.ts` | Infrastructure | Factory for resolving pricing strategies | Factory Pattern |
| **CH03** | `src/infrastructure/services/FareCalculatorService.ts` | Infrastructure | Refactored to delegate to `PricingStrategyFactory` | Strategy Pattern |
