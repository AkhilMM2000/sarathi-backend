/**
 * Part 3: Strategy Pattern Implementation in JavaScript (Node.js)
 * Calculates ride fares across multiple service tiers (ECONOMY, PREMIUM, XL)
 * and dynamic surge pricing.
 */

const RideType = Object.freeze({
  ECONOMY: "ECONOMY",
  PREMIUM: "PREMIUM",
  XL: "XL"
});

class IPricingStrategy {
  get strategyName() { throw new Error("Must implement strategyName"); }
  calculateFare(context) { throw new Error("Must implement calculateFare"); }
}

class StandardPricingStrategy extends IPricingStrategy {
  get strategyName() { return "StandardPricingStrategy"; }

  constructor() {
    super();
    this.rates = {
      [RideType.ECONOMY]: { base: 50, perKm: 12, perMin: 2.0, minFare: 150 },
      [RideType.PREMIUM]: { base: 100, perKm: 20, perMin: 3.5, minFare: 250 },
      [RideType.XL]: { base: 120, perKm: 25, perMin: 4.0, minFare: 300 }
    };
  }

  calculateFare(context) {
    const rate = this.rates[context.rideType] || this.rates[RideType.ECONOMY];
    const dist = Math.max(0, context.distanceKm);
    const duration = context.durationMinutes !== undefined ? Math.max(0, context.durationMinutes) : dist * 2;

    const baseFare = rate.base;
    const distanceFare = dist * rate.perKm;
    const timeFare = duration * rate.perMin;
    const subtotal = baseFare + distanceFare + timeFare;
    const totalFare = Math.max(rate.minFare, Math.round(subtotal));

    return {
      baseFare,
      distanceFare,
      timeFare,
      surgeMultiplier: 1.0,
      totalFare,
      rideType: context.rideType
    };
  }
}

class SurgeDynamicPricingStrategy extends IPricingStrategy {
  get strategyName() { return "SurgeDynamicPricingStrategy"; }

  constructor(baseStrategy) {
    super();
    this.baseStrategy = baseStrategy;
  }

  calculateFare(context) {
    const rawSurge = context.surgeMultiplier || 1.0;
    const clampedSurge = Math.min(2.5, Math.max(1.0, rawSurge));
    const base = this.baseStrategy.calculateFare(context);
    const surgedTotal = Math.round(base.totalFare * clampedSurge);

    return {
      ...base,
      surgeMultiplier: clampedSurge,
      totalFare: surgedTotal
    };
  }
}

module.exports = {
  RideType,
  IPricingStrategy,
  StandardPricingStrategy,
  SurgeDynamicPricingStrategy
};
