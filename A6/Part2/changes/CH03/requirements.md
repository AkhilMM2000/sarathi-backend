# CH03: Multiple Ride Types & Dynamic Pricing Strategy Requirements

## 1. Context and Objective
In the baseline Sarathi backend, fare calculation is hardcoded in `FareCalculatorService.ts` using a single procedural formula (`distanceInKm * 10`). The system lacks support for vehicle/ride tiers and dynamic surge pricing, violating the Open/Closed Principle (OCP).

The objective of CH03 is to introduce multiple ride tiers (`ECONOMY`, `PREMIUM`, `XL`) and dynamic pricing algorithms encapsulated behind the Strategy and Factory patterns.

## 2. Functional Requirements
1. **Ride Tier Definitions:**
   - `ECONOMY`: Base fare ₹50, ₹12/km, ₹2/min.
   - `PREMIUM`: Base fare ₹100, ₹20/km, ₹3.5/min.
   - `XL`: Base fare ₹120, ₹25/km, ₹4/min.
   - Default fallback: If ride type is unspecified, default to `ECONOMY` for backward compatibility.
2. **Pricing Formulas and Validation:**
   - Total fare formula: `Math.round((baseFare + distanceKm * perKmRate + durationMinutes * perMinRate) * clampedSurge)`.
   - Validate distance and duration: negative distance must throw a validation error.
   - Enforce minimum fare threshold: calculated fare must never fall below tier base fare.
3. **Surge Pricing and Regulatory Clamping:**
   - Dynamic surge multipliers must be strictly clamped:
     - Minimum ceiling: $1.0\times$ (multiplier cannot discount below standard fare).
     - Maximum cap: $2.5\times$ (regulatory cap on maximum surge pricing).
4. **Consistency:**
   - Quoted fare at booking request and final fare stored in database upon trip completion must follow identical strategy rules.

## 3. Pattern Implementation: Strategy & Factory
- **Strategy Interface:** `IPricingStrategy` (`calculateFare(context: PricingContext): FareBreakdown`).
- **Concrete Strategies:**
  - `StandardRidePricingStrategy`: Standard distance and time pricing.
  - `SurgeDynamicPricingStrategy`: Dynamic surge multiplier applied to base and distance rates.
  - `MultiDayRentalPricingStrategy`: Flat daily rates for multi-day rental / round-trip bookings.
- **Factory:** `PricingStrategyFactory` resolves the appropriate strategy based on booking parameters.

## 4. Verification and Acceptance Criteria
- Unit tests verify calculations across all three tiers with standard and surge multipliers.
- Surge bounds tests confirm clamp behavior at $0.8\times \to 1.0\times$ and $3.0\times \to 2.5\times$.
- Backward-compatibility tests confirm missing ride types default safely to `ECONOMY`.
