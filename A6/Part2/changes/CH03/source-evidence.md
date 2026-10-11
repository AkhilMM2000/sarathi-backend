# CH03 Source Evidence: Multiple Ride Types & Strategy Pattern

## 1. Baseline Evidence vs. Refactored Evidence

### A. Fare Calculator Implementation
* **Baseline File:** [`src/infrastructure/services/FareCalculatorService.ts:20-34`](file:///d:/design-patterns-case-study/src/infrastructure/services/FareCalculatorService.ts#L20-L34)
  ```typescript
  if (bookingType === BookingType.ONE_WAY) {
    if (!estimatedKm) throw new Error("Estimated KM is required for ONE_WAY booking");
    fare = estimatedKm * this.PER_KM_RATE;
    return fare < 450 ? 450 : fare;
  }
  if (bookingType === BookingType.ROUND_TRIP) {
    ...
    return dayCount * this.PER_DAY_RATE;
  }
  ```
  *Observed:* Violates Open/Closed Principle. Hardcoded flat rates (`PER_KM_RATE = 10`, `PER_DAY_RATE = 1000`). No ride service tiers or surge multipliers.
* **Refactored File:** `A6/Part2/changes/CH03/patch.diff`
  ```typescript
  const strategy = this._pricingStrategyFactory.getStrategy(pricingContext);
  const fareBreakdown = strategy.calculateFare(pricingContext);
  return fareBreakdown;
  ```
  *Evolution:* Delegates calculation to interchangeable strategy instances (`StandardPricingStrategy`, `SurgeDynamicPricingStrategy`, `RentalDailyPricingStrategy`) resolved via `PricingStrategyFactory`.

---

### B. Trip Finalization Consistency
* **Baseline File:** [`src/application/use_cases/Driver/UpdateBookingstatus.ts:50-53`](file:///d:/design-patterns-case-study/src/application/use_cases/Driver/UpdateBookingstatus.ts#L50-L53)
  ```typescript
  const estimated = booking.estimatedFare || 0;
  const ratePerKm = 10;
  finalFare = estimated + finalKm * ratePerKm;
  ```
  *Observed:* Hardcodes `ratePerKm = 10`, ignoring vehicle category, duration, or dynamic pricing multiplier applied at booking time.
* **Refactored File:** `A6/Part2/changes/CH03/patch.diff`
  ```typescript
  const pricingStrategy = this._pricingStrategyFactory.getStrategy({
    rideType: booking.rideType || RideType.ECONOMY,
    bookingType: booking.bookingType,
    surgeMultiplier: booking.surgeMultiplier || 1.0,
    distanceKm: finalKm
  });
  finalFare = pricingStrategy.calculateFare(...).totalFare;
  ```
  *Evolution:* Guarantees that quoted, stored, and charged amounts use the exact same strategy parameters.
