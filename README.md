# Sarathi Backend (Driver-on-Demand Platform)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-grey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Active-red.svg)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Signaling-orange.svg)](https://webrtc.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Connected%20Accounts-indigo.svg)](https://stripe.com/)

**Sarathi** (meaning *charioteer*) is a high-performance, real-time driver-on-demand platform. This repository contains the backend codebase—engineered using **TypeScript, Clean Architecture, and SOLID principles**. 

It handles automated driver matchmaking, WebRTC video calling & chat signaling, secure Stripe-split payment operations, and robust timezone-aware ride schedule management.

---

## 🎓 Design Pattern Case Study (Team A6)

This repository hosts the empirical software engineering deliverables for the **Team A6 Case Study**: *“Design Pattern Analysis in a Node.js/Express Ride-Sharing Application”*.

### 📌 Quick Navigation & Deliverables
* 📄 **Academic Report:** [`A6/A6_Report.tex`](A6/A6_Report.tex) *(IEEE conference format; ready for TeXLive / Overleaf compilation)*
* 📋 **Audit & Sign-Off:** [`A6/HUMAN_VERIFICATION.md`](A6/HUMAN_VERIFICATION.md) *(Empirical verification protocol and team sign-offs)*
* 📊 **Empirical Datasets:**
  * [`A6/data/patterns.csv`](A6/data/patterns.csv) *(Ground-truth baseline pattern catalog)*
  * [`A6/data/pattern-counts.csv`](A6/data/pattern-counts.csv) *(Pattern frequencies and architectural density)*
  * [`A6/data/cross-language-comparison.csv`](A6/data/cross-language-comparison.csv) *(Idiomatic parity across Java, Python, JS, and C++)*
  * [`A6/data/evaluation-dataset.jsonl`](A6/data/evaluation-dataset.jsonl) *(8-task reproducible LLM benchmark dataset)*
* 🔍 **Part 1 — Baseline Application Analysis:** [`A6/Part1/README.md`](A6/Part1/README.md) *(7 Subsystems, ground-truth pattern identification, code snapshot)*
* ⚙️ **Part 2 — Architectural Evolution Scenarios:** [`A6/Part2/README.md`](A6/Part2/README.md)
  * **CH01:** Driver Status Management & State Pattern ([`A6/Part2/changes/CH01/`](A6/Part2/changes/CH01/))
  * **CH02:** Ride Cancellation & Observer Event Bus ([`A6/Part2/changes/CH02/`](A6/Part2/changes/CH02/))
  * **CH03:** Multi-Tier Ride Types & Dynamic Pricing Strategy ([`A6/Part2/changes/CH03/`](A6/Part2/changes/CH03/))
* 🌐 **Part 3 — Cross-Language Implementations:** [`A6/Part3/README.md`](A6/Part3/README.md) *(Java, Python, JS, C++ implementations for State, Strategy, and Observer)*
* 🤖 **LLM Evaluation Framework:**
  * Workflows: [`A6/Part1/llm/README.md`](A6/Part1/llm/README.md) & [`A6/Part2/llm/README.md`](A6/Part2/llm/README.md)
  * Evaluation Methodology: [`A6/data/evaluation-methodology.md`](A6/data/evaluation-methodology.md)
  * Standardized Rubric: [`A6/data/evaluation-rubric.md`](A6/data/evaluation-rubric.md)
  * Ground-Truth Answers: [`A6/data/reference-answers.md`](A6/data/reference-answers.md)

### 🧪 Executing Case Study Tests & Validation
```bash
# 1. Run Part 3 JavaScript pattern test suite (8/8 pass)
node A6/Part3/test-cases/test_patterns.js

# 2. Run Part 3 Python pattern test suite (8/8 pass)
python A6/Part3/test-cases/test_patterns.py

# 3. Validate LLM evaluation dataset schema, provenance & grounding (8/8 valid)
python A6/tools/validate_dataset.py

# 4. Run polyglot cross-language runner (skips uninstalled toolchains)
bash A6/Part3/tools/run_all.sh
```

---

## 🔑 Demo Credentials

For testing and evaluation purposes, you can log in to the application using the following pre-configured test credentials:

| Account Type | Email Address | Password |
| :--- | :--- | :--- |
| **👤 User Account** | `manojakhil36@gmail.com` | `Amm@12345` |
| **🚗 Driver Account** | `manojakhil36@gmail.com` | `Amm@1234` |

---

## 📸 Core Features in Action

* **Real-time Matchmaking & Broadcast:**
  
  ![Real-time Booking Request Broadcasting](Screenshot%202026-06-16%20124019.png)
  *Example of a user booking request dynamically broadcasting to active drivers' screens in real-time.*

* **Driver Selection & Proximity Telemetry:**
  
  ![Driver Selection UI](driver_list.png)
  *Users can view available drivers sorted and filtered by exact road-wise distance calculated via Google Maps APIs (with custom formatting for close proximity, e.g. "0 m away" / "Nearby").*

* **MongoDB Database Schema:**
  
  ![MongoDB Atlas Data Explorer](image.png)
  *MongoDB Atlas view showing the database collections and a sample booking document schema.*
---

## 🏗️ Architecture & Design Patterns

The backend is built following **Clean Architecture** boundaries and **Dependency Injection (DI)** using **Tsyringe** to decouple the layers and keep components isolated, testable, and maintainable.

### 1. Clean Architecture Layers

```mermaid
graph TD
    subgraph Presentation ["1. Presentation Layer (Controllers & Routes)"]
        Routes[Routes / Express] --> Controllers[Controllers / catchAsync]
        Controllers --> DTOs[DTO & Schema Validation / Zod]
    end

    subgraph Application ["2. Application Layer (Business Cases)"]
        Controllers --> UseCases[Use Cases / UseCaseInterfaces]
        UseCases --> Services[External Services Interfaces]
    end

    subgraph Domain ["3. Domain Layer (Entities & Rules)"]
        UseCases --> Entities[Domain Models / Entities]
        UseCases --> RepositoriesInterfaces[Repository Interfaces]
    end

    subgraph Infrastructure ["4. Infrastructure Layer (Data & Tools)"]
        RepositoriesInterfaces --> MongoRepos[MongoDB Repositories / Mongoose]
        Services --> SocketService[Socket Notification Service]
        Services --> StripeService[Stripe Payment Service]
    end
```

### 2. Real-Time Broadcast & Connection Flow

When a user requests a ride, the backend calculates distance telemetry and uses a Redis-backed Socket mapping system to locate active drivers:

```mermaid
sequenceDiagram
    autonumber
    actor User as User Client
    participant Server as Express Server
    participant Redis as Redis Cache
    actor Driver as Driver Client

    User->>Server: HTTP POST /bookslot (Request Booking)
    activate Server
    Server->>Server: Calculate road distance & estimate fare
    Server->>Server: Write Booking (Status: PENDING)
    Server-->>User: Booking Confirmation & Room ID
    deactivate Server
    
    Server->>Redis: Fetch Active Socket IDs for nearby drivers
    activate Redis
    Redis-->>Server: List of active driver sockets
    deactivate Redis
    
    Server->>Driver: Socket.io Emit "ridepaidNotification" / "bookingRequest"
    activate Driver
    Driver->>Server: Socket.io Emit "booking:accept" (Accept Ride)
    deactivate Driver
    
    Server->>Server: Update Booking Status (Status: CONFIRMED)
    Server->>User: Socket.io Emit "booking:confirmed" (Notify User)
```

---

## 🚀 Key Technical Highlights & Implementation Details

### ⚡ Redis-Backed Socket.io & Raw WebRTC Signaling
* **Redis State Storage:** To maintain seamless real-time connections, the server maps active socket connections to user and driver IDs using Redis (e.g. `driver:socket:<driverId>`).
* **Bi-directional WebRTC Handshake:** Handles SDP offer, answer, and ICE candidate distribution between user and driver namespaces safely resolving runtime ID representation discrepancies.

### 📅 Timezone-Aware Business Logic (IST Cutoff)
* To protect driver schedules, the platform restricts ride cancellations using a strict timezone-aware engine:
  * Cancellations are only permitted until **9:00 PM IST of the day prior** to the scheduled booking.
  * Employs UTC date shifts matched with UTC offset math (UTC+5:30) to guarantee consistency regardless of server runtime environment timezones.

### 💳 Stripe Split Payments
* Integrated **Stripe Connect Accounts** allowing drivers to register as connected merchants.
* Employs Stripe Payment Intents to authorize rides and automatically handles split fee distribution between the platform and the driver upon ride completion.

### 🗺️ Geotargeting & Location Telemetry
* Integrates Google Maps APIs (Autocomplete, Distance Matrix) to find nearest drivers and compute road travel metrics.
* Dynamic telemetry formatting converts raw float values to user-friendly UI readings (meters, rounded kilometers, or `"Nearby"` indicator labels).

---

## 📂 Directory Structure

```directory
sarathi-backend/
├── src/
│   ├── application/            # Business Logic & Use Cases
│   │   ├── dto/                # Data Transfer Objects (Validation types)
│   │   ├── services/           # Service Interfaces (Mail, Stripe, Sockets)
│   │   └── use_cases/          # Independent Use Case Implementations
│   ├── domain/                 # Core Entities & Interfaces
│   │   ├── errors/             # Domain Error Abstractions
│   │   ├── models/             # Domain Model Blueprints
│   │   └── repositories/       # Core Repository Interfaces
│   ├── infrastructure/         # Frameworks, Database, Sockets & APIs
│   │   ├── config/             # DI Containers (Tsyringe) & Config
│   │   ├── database/           # Mongoose Models & MongoDB Repositories
│   │   ├── services/           # Concrete Service Implementations
│   │   └── socket/             # Socket.IO Listeners & Redis Mappings
│   ├── presentation/           # HTTP Routing & Controller Layer
│   │   ├── controllers/        # catchAsync Express Controllers
│   │   ├── routes/             # Express Router Declarations
│   │   └── schemas/            # Zod validation schemas
│   └── index.ts                # Application Bootstrap File
```

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js** (v18+)
* **MongoDB** (Local instance or MongoDB Atlas URL)
* **Redis Server** (Active on local/remote port)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root folder using this schema:
```env
# Application Server Config
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/sarathi

# Cache Server Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT Secrets
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Third-Party Integrations
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Geolocation API
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Running Locally
Run the development server with live reload:
```bash
npm run dev
```

Run compilation build:
```bash
npm run build
```

---

## 🌐 Production Infrastructure & Deployment

The production environment is hosted on a secure **AWS EC2** instance, utilizing a reverse proxy and daemon process management:
* **NGINX:** Serves as the primary reverse proxy handling SSL certificates, cookie security settings (for secure cross-site Google Auth session management), and rate-limiting.
* **PM2:** Manages the application lifecycle, supporting clustering and automatic recovery on runtime failures.