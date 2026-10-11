import { BookingType } from "../../../domain/models/Booking";
import { IPricingStrategy, PricingContext, FareBreakdown, RideType } from "../../../domain/strategies/pricing/IPricingStrategy";

export class StandardPricingStrategy implements IPricingStrategy {
  readonly strategyName = "StandardPricingStrategy";

  private rates = {
    [RideType.ECONOMY]: { base: 50, perKm: 12, perMin: 2.0, minFare: 150 },
    [RideType.PREMIUM]: { base: 100, perKm: 20, perMin: 3.5, minFare: 250 },
    [RideType.XL]: { base: 120, perKm: 25, perMin: 4.0, minFare: 300 }
  };

  calculateFare(context: PricingContext): FareBreakdown {
    const rate = this.rates[context.rideType] || this.rates[RideType.ECONOMY];
    const distanceKm = Math.max(0, context.distanceKm);
    const durationMinutes = context.durationMinutes !== undefined ? Math.max(0, context.durationMinutes) : distanceKm * 2;
    
    const baseFare = rate.base;
    const distanceFare = distanceKm * rate.perKm;
    const timeFare = durationMinutes * rate.perMin;
    const rawTotal = baseFare + distanceFare + timeFare;
    const totalFare = Math.max(rate.minFare, Math.round(rawTotal));

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

export class SurgeDynamicPricingStrategy implements IPricingStrategy {
  readonly strategyName = "SurgeDynamicPricingStrategy";

  constructor(
    private innerStrategy: IPricingStrategy,
    private rawSurge: number
  ) {}

  calculateFare(context: PricingContext): FareBreakdown {
    const clampedSurge = Math.min(2.5, Math.max(1.0, this.rawSurge));
    const baseBreakdown = this.innerStrategy.calculateFare(context);
    const dynamicTotal = Math.round(baseBreakdown.totalFare * clampedSurge);

    return {
      ...baseBreakdown,
      surgeMultiplier: clampedSurge,
      totalFare: dynamicTotal
    };
  }
}

export class RentalDailyPricingStrategy implements IPricingStrategy {
  readonly strategyName = "RentalDailyPricingStrategy";

  private dailyRates = {
    [RideType.ECONOMY]: 1200,
    [RideType.PREMIUM]: 2000,
    [RideType.XL]: 2500
  };

  calculateFare(context: PricingContext): FareBreakdown {
    const rate = this.dailyRates[context.rideType] || this.dailyRates[RideType.ECONOMY];
    let days = 1;
    if (context.endDate && context.startDate) {
      const diffTime = Math.abs(new Date(context.endDate).getTime() - new Date(context.startDate).getTime());
      days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    const total = days * rate;

    return {
      baseFare: total,
      distanceFare: 0,
      timeFare: 0,
      surgeMultiplier: 1.0,
      totalFare: total,
      rideType: context.rideType
    };
  }
}

export class PricingStrategyFactory {
  getStrategy(context: PricingContext): IPricingStrategy {
    if (context.bookingType === BookingType.ROUND_TRIP) {
      return new RentalDailyPricingStrategy();
    }
    const standard = new StandardPricingStrategy();
    if (context.surgeMultiplier && context.surgeMultiplier > 1.0) {
      return new SurgeDynamicPricingStrategy(standard, context.surgeMultiplier);
    }
    return standard;
  }
}
