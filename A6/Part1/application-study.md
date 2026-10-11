# Part 1: Baseline Application Study — Sarathi Ride-Sharing Backend

## 1. Application Purpose & Domain Context
**Sarathi** is a specialized ride-sharing and driver-on-demand backend platform designed for Indian urban and peri-urban transport. The application connects riders (users seeking point-to-point transportation or designated drivers for their own vehicles) with verified drivers.

### Core Business Functions
1. **On-Demand Driver & Ride Booking:** Supports one-way trips (`ONE_WAY`) and multi-day round-trip bookings (`ROUND_TRIP`).
2. **Two-Stage Geospatial Matchmaking:** Combines MongoDB spherical geospatial radius search (`$geoNear`) within 30 km with real-world road-distance filtering (Google Maps Distance Matrix API) within 20 km.
3. **Dual Payment Modalities:** Stripe Connect integration for direct credit/debit card processing and an internal digital wallet system (`Wallet`) with credit/debit transaction history.
4. **Real-Time Dispatch & Telemetry:** WebSocket-based live driver broadcast notifications (`Socket.io`) backed by Upstash Redis for socket ID mapping.
5. **Administrative Governance:** Identity document vetting (Aadhaar, driving license), driver onboarding approval/rejection, account blocking, and system-wide telemetry.

---

## 2. Actual Technology Stack

| Layer / Concern | Technology & Library | Version | File Evidence |
|---|---|---|---|
| **Runtime & Language** | Node.js (LTS), TypeScript | `^5.7.3` | [`package.json:44`](file:///d:/design-patterns-case-study/package.json#L44), [`tsconfig.json`](file:///d:/design-patterns-case-study/tsconfig.json) |
| **HTTP Web Framework** | Express.js | `^4.21.2` | [`package.json:22`](file:///d:/design-patterns-case-study/package.json#L22), [`src/index.ts`](file:///d:/design-patterns-case-study/src/index.ts) |
| **Database & ODM** | MongoDB, Mongoose | `^8.10.0` | [`package.json:25`](file:///d:/design-patterns-case-study/package.json#L25), [`src/config/database.ts`](file:///d:/design-patterns-case-study/src/config/database.ts) |
| **In-Memory Cache** | Upstash Redis | `^1.34.5` | [`package.json:15`](file:///d:/design-patterns-case-study/package.json#L15), [`src/config/redisconfig.ts`](file:///d:/design-patterns-case-study/src/config/redisconfig.ts) |
| **Dependency Injection** | TSyringe | `^4.8.0` | [`package.json:30`](file:///d:/design-patterns-case-study/package.json#L30), [`src/infrastructure/config/container.ts`](file:///d:/design-patterns-case-study/src/infrastructure/config/container.ts) |
| **Real-time WebSockets** | Socket.io | `^4.8.1` | [`package.json:28`](file:///d:/design-patterns-case-study/package.json#L28), [`src/infrastructure/socket/socket.ts`](file:///d:/design-patterns-case-study/src/infrastructure/socket/socket.ts) |
| **Payment Gateway** | Stripe SDK (Connect & PaymentIntents) | `^18.0.0` | [`package.json:29`](file:///d:/design-patterns-case-study/package.json#L29), [`src/infrastructure/services/StripeService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/StripeService.ts) |
| **Cloud File Storage** | Cloudinary | `^2.5.1` | [`package.json:18`](file:///d:/design-patterns-case-study/package.json#L18), [`src/infrastructure/services/cloudstorageservice.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/cloudstorageservice.ts) |
| **SMS / Communication** | Twilio SDK | `^5.5.1` | [`package.json:31`](file:///d:/design-patterns-case-study/package.json#L31), [`src/infrastructure/services/TwilioSMSService.ts`](file:///d:/design-patterns-case-study/src/infrastructure/services/TwilioSMSService.ts) |
| **Email Service** | Nodemailer | `^6.10.0` | [`package.json:26`](file:///d:/design-patterns-case-study/package.json#L26), [`src/application/services/Emailservice.ts`](file:///d:/design-patterns-case-study/src/application/services/Emailservice.ts) |
| **Validation** | Zod | `^4.3.6` | [`package.json:33`](file:///d:/design-patterns-case-study/package.json#L33), [`src/presentation/schemas/common/ZodHelper.ts`](file:///d:/design-patterns-case-study/src/presentation/schemas/common/ZodHelper.ts) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | `^9.0.2`, `^2.4.3` | [`package.json:24`](file:///d:/design-patterns-case-study/package.json#L24), [`src/middleware/authMiddleware.ts`](file:///d:/design-patterns-case-study/src/middleware/authMiddleware.ts) |

---

## 3. Important Modules & Responsibilities

The codebase adheres strictly to **Clean Architecture** (Onion / Hexagonal), separating enterprise logic from framework adapters:

```
src/
├── domain/                      # Enterprise Business Rules (Pure TypeScript)
│   ├── errors/                  # BaseError, AuthError, ConflictError, NotFoundError
│   ├── models/                  # User, Driver, Booking, Vehicle, Wallet, Chat
│   ├── repositories/            # IUserRepository, IDriverRepository, IBookingRepository...
│   └── services/                # IStripeService, IFileStorageService, IGoogleMapService
├── application/                 # Application Business Rules (Use Cases & DTOs)
│   ├── dto/                     # Data Transfer Objects
│   ├── services/                # Domain orchestration services (Email, Hash, Notification)
│   └── use_cases/               # User, Driver, Admin use cases
├── infrastructure/              # Frameworks, Drivers, DB & External Adapters
│   ├── config/                  # TSyringe DI Container registrations
│   ├── database/                # Mongoose Models, Schemas, and Mongo Repositories
│   ├── services/                # Concrete SDK Adapters (Stripe, Twilio, Cloudinary, Maps)
│   ├── socket/                  # Socket.io handlers & Redis-backed notification service
│   └── store/                   # Redis caches
└── presentation/                # Interface Adapters
    ├── controllers/             # Express controllers resolving DI use cases
    ├── routes/                  # Express route routers
    └── schemas/                 # Zod validation schemas
```

---

## 4. Verified Application Flows

### Flow 1: Authentication & Authorization
* **Registration & OTP:** User registers via `POST /api/auth/register`. A hash of password and payload is temporarily stored in Upstash Redis (`UserRegisterStore`). OTP is dispatched via Twilio SMS (`TwilioSMSService`).
* **Verification:** `POST /api/auth/verify-otp` verifies OTP from Redis and persists the `User` entity to MongoDB via `MongoUserRepository`.
* **Tokens:** Access token (JWT, short-lived) and Refresh Token (HTTP-only cookie) are issued.
* **Role-Based Guards:** `protectRoute(["admin"])` and `protectRoute(["driver"])` in `src/middleware/authMiddleware.ts` enforce role permissions. `checkBlocked` middleware checks `isBlock: true` on every authenticated request.

### Flow 2: Driver Onboarding & Status Management
* **Registration:** Driver registers with license and Aadhaar numbers.
* **Document Upload:** Aadhaar and driving license photos are uploaded to Cloudinary via `CloudinaryFileStorageService`.
* **State at Registration:** Driver status defaults to `"pending"`, with `onlineStatus: 'offline'`, `activePayment: false`, and `isBlock: false`.
* **Admin Review:** Admin inspects documents and hits `PATCH /api/admin/driver/status/:driverId`. Status transitions to `"approved"` or `"rejected"`.
* **Stripe Onboarding:** Approved driver creates a connected Stripe account via `Accountservice.ts` to receive payouts (`activePayment: true`).

### Flow 3: Trip Booking, Matchmaking & Dispatch
* **Quote Calculation:** User requests fare estimate via `POST /api/user/estimate-fare` (`FareCalculatorService`).
* **Ride Booking:** User initiates `POST /api/user/book-driver` (`BookDriver.ts`):
  1. Validates inputs via `BookDriverSchema` (Zod).
  2. If specific `driverId` requested: checks availability via `checkDriverAvailability`.
  3. If broadcast: queries `findNearbyDriversWithinRadius` (MongoDB `$geoNear` within 30 km).
  4. Filters driver locations through `GoogleDistanceService` to enforce road distance $\le 20$ km.
  5. Saves `Booking` entity with `status: PENDING`.
  6. Dispatches real-time popup via `SocketNotificationService.broadcastBookingNotification` to targeted drivers.
* **Expiration Sweeper:** `CronScheduler.ts` runs every 30 seconds. If no driver accepts within 3 minutes, booking transitions to `EXPIRED` and drivers are notified to dismiss popups.

### Flow 4: Trip Fulfillment & Payment
* **Acceptance:** First available driver hits `POST /api/driver/accept-booking` (`AcceptBooking.ts`). Atomic `findOneAndUpdate` transitions booking from `PENDING` to `CONFIRMED`.
* **Ride Completion:** Driver completes ride via `PATCH /api/driver/booking/update-status` (`UpdateBookingstatus.ts`) with `finalKm`. Status updates to `COMPLETED`.
* **Payment Processing:** User pays via Stripe PaymentIntent or Wallet (`WalletRidePayment.ts`). Platform fee (10%) is retained, and driver fee (90%) is transferred to the driver's Stripe Connect account or credited to driver balance.

---

## 5. Limitations & Technical Debt in Baseline

1. **Missing Test Harness:** The original repository contains **zero unit or integration tests**, no test framework configuration (Jest/Vitest), and no mocks.
2. **Procedural Driver State Management:** Driver status is handled as a primitive string union (`"pending" | "approved" | "rejected"`). Invariant checks are absent, and temporary suspension (`SUSPENDED`) does not exist.
3. **Unprotected Ride Cancellation:** `CancelBooking.ts` does not verify actor authorization (`req.user.id === booking.userId`), does not refund wallet debits, and does not block cancelling `COMPLETED` rides.
4. **Hardcoded Pricing:** `FareCalculatorService.ts` contains hardcoded rates (`PER_KM_RATE = 10`, `PER_DAY_RATE = 1000`) and lacks vehicle service tiers (Economy, Premium, XL) and dynamic surge pricing.
5. **Coupled Side Effects:** Domain use cases call socket notification adapters directly rather than using an in-process domain event bus (Observer / Pub-Sub).
