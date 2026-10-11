# Part 1: Baseline Application Study

## Overview
Part 1 documents the baseline architecture, subsystem decomposition, and existing design patterns of the **Sarathi Backend** ride-sharing application at baseline commit `c8766f4c88b9f36235d5f4399ef9b4cf20df3c8a`.

**Lead Investigator:** Sai Sameer  
**Reviewers:** Dilip, Harish

---

## Directory Organization
* `code/`: Architectural extracts, interface contracts, and standalone inspection harnesses for the baseline application.
* `diagrams/`: UML class diagrams, Clean Architecture layer diagrams, and interaction sequence diagrams.
* `evidence/`: Source code inspection logs, execution traces, dependency graphs, and Git logs verifying baseline claims.
* `llm/`: Prompts, raw model responses, and evaluations used during architectural reconnaissance.

---

## 7 Core Subsystems Analysis Summary

| Subsystem | Primary Domain Entities | Application Use Cases | Infrastructure & Presentation Evidence |
|---|---|---|---|
| **1. Rider (User)** | `User`, `Vehicle` | `RegisterUser`, `GetUserData`, `UpdateUserData`, `AddVehicle` | `MongoUserRepository.ts`, `UserController.ts`, `userRoutes.ts` |
| **2. Driver** | `Driver` | `RegisterDriver`, `DriverOnboarding`, `Getdriverprofile`, `VerifyAccountStatus` | `MongodriverRepository.ts`, `DriverControler.ts`, `driverRoutes.ts` |
| **3. Trip & Booking Lifecycle** | `Booking` (`BookingStatus`, `BookingType`) | `BookDriver`, `AcceptBooking`, `UpdateBookingstatus`, `CancelBooking` | `MongoBookingRepository.ts`, `BookingController.ts`, `CronScheduler.ts` |
| **4. Payment** | `Wallet`, `WalletTransaction` | `CreatePaymentIntent`, `WalletRidePayment`, `AttachPaymentIntentIdToBooking` | `StripeService.ts`, `WalletRepository.ts`, `Accountservice.ts` |
| **5. Driver Matching** | Geospatial queries (`Point`, 2dsphere) | `BookDriver` (2-stage proximity + road distance filtering), `FindNearbyDrivers` | `findNearbyDriversWithinRadius` in `MongodriverRepository.ts`, `GoogleDistanceService.ts` |
| **6. Location** | `IGoogleMapService`, GeoJSON coords | Geocoding, road distance matrix computation | `GoogleMapService.ts`, `GoogleDistanceService.ts`, `Driverschema.ts` |
| **7. Notifications** | `INotificationService` | Socket-based driver dispatch, trip confirmation, cancellation notices | `SocketNotification.ts`, `TwilioSMSService.ts`, `Emailservice.ts` |

---

## Existing Design Patterns in Baseline

1. **Dependency Injection (DI / IoC):**
   * Configured using `tsyringe` across `src/infrastructure/config/container.ts`, `useCaseContainer.ts`, and `controllerContainer.ts`.
   * Enforces loose coupling between HTTP controllers, application use cases, and database repositories.
2. **Repository Pattern:**
   * Pure TypeScript contracts in `src/domain/repositories/` (`IBookingRepository`, `IDriverRepository`, `IUserRepository`, etc.) implemented by Mongoose-backed repositories in `src/infrastructure/database/`.
3. **Adapter Pattern:**
   * Encapsulates third-party infrastructure SDKs behind internal service interfaces:
     * Stripe: `IStripeService` -> `PaymentService` (`StripeService.ts`)
     * Cloudinary: `IFileStorageService` -> `CloudinaryFileStorageService` (`cloudstorageservice.ts`)
     * Twilio: `SMSService` -> `TwilioSMSService` (`TwilioSMSService.ts`)
     * Upstash Redis: `IRedisrepository` -> `RedisUserRegistrationStore` (`UserRegisterStore.ts`)
4. **Data Mapper / DTO:**
   * Document-to-Domain mappers such as `DriverReviewMapper.ts` ensuring persistence entities do not leak into business domains.
