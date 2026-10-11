/**
 * Part 3: Strategy Pattern Implementation in Java
 * Calculates ride fares across multiple service tiers (ECONOMY, PREMIUM, XL)
 * and dynamic surge pricing.
 */

import java.util.Objects;


enum RideType {
    ECONOMY, PREMIUM, XL
}

class PricingContext {
    private final RideType rideType;
    private final double distanceKm;
    private final double durationMinutes;
    private final double surgeMultiplier;

    public PricingContext(RideType rideType, double distanceKm, double durationMinutes, double surgeMultiplier) {
        this.rideType = Objects.requireNonNull(rideType);
        this.distanceKm = Math.max(0, distanceKm);
        this.durationMinutes = durationMinutes >= 0 ? durationMinutes : distanceKm * 2;
        this.surgeMultiplier = Math.min(2.5, Math.max(1.0, surgeMultiplier));
    }

    public RideType getRideType() { return rideType; }
    public double getDistanceKm() { return distanceKm; }
    public double getDurationMinutes() { return durationMinutes; }
    public double getSurgeMultiplier() { return surgeMultiplier; }
}

class FareBreakdown {
    private final double baseFare;
    private final double distanceFare;
    private final double timeFare;
    private final double surgeMultiplier;
    private final long totalFare;
    private final RideType rideType;

    public FareBreakdown(double baseFare, double distanceFare, double timeFare, double surgeMultiplier, long totalFare, RideType rideType) {
        this.baseFare = baseFare;
        this.distanceFare = distanceFare;
        this.timeFare = timeFare;
        this.surgeMultiplier = surgeMultiplier;
        this.totalFare = totalFare;
        this.rideType = rideType;
    }

    public long getTotalFare() { return totalFare; }
    public double getSurgeMultiplier() { return surgeMultiplier; }
}

interface IPricingStrategy {
    String getStrategyName();
    FareBreakdown calculateFare(PricingContext context);
}

class StandardPricingStrategy implements IPricingStrategy {
    @Override
    public String getStrategyName() { return "StandardPricingStrategy"; }

    @Override
    public FareBreakdown calculateFare(PricingContext context) {
        double baseRate;
        double perKm;
        double perMin;
        long minFare;

        switch (context.getRideType()) {
            case PREMIUM:
                baseRate = 100.0; perKm = 20.0; perMin = 3.5; minFare = 250;
                break;
            case XL:
                baseRate = 120.0; perKm = 25.0; perMin = 4.0; minFare = 300;
                break;
            case ECONOMY:
            default:
                baseRate = 50.0; perKm = 12.0; perMin = 2.0; minFare = 150;
                break;
        }

        double distanceFare = context.getDistanceKm() * perKm;
        double timeFare = context.getDurationMinutes() * perMin;
        double subtotal = baseRate + distanceFare + timeFare;
        long total = Math.max(minFare, Math.round(subtotal));

        return new FareBreakdown(baseRate, distanceFare, timeFare, 1.0, total, context.getRideType());
    }
}

class SurgeDynamicPricingStrategy implements IPricingStrategy {
    private final IPricingStrategy baseStrategy;

    public SurgeDynamicPricingStrategy(IPricingStrategy baseStrategy) {
        this.baseStrategy = Objects.requireNonNull(baseStrategy);
    }

    @Override
    public String getStrategyName() { return "SurgeDynamicPricingStrategy"; }

    @Override
    public FareBreakdown calculateFare(PricingContext context) {
        FareBreakdown base = baseStrategy.calculateFare(context);
        long surgedTotal = Math.round(base.getTotalFare() * context.getSurgeMultiplier());
        return new FareBreakdown(
            1.0, 0, 0, context.getSurgeMultiplier(), surgedTotal, context.getRideType()
        );
    }
}

public class PricingStrategy {
    public static void main(String[] args) {
        IPricingStrategy standard = new StandardPricingStrategy();
        IPricingStrategy surge = new SurgeDynamicPricingStrategy(standard);

        PricingContext ctxEco = new PricingContext(RideType.ECONOMY, 10.0, 20.0, 1.0);
        FareBreakdown eco = standard.calculateFare(ctxEco);
        System.out.println("ECONOMY (10km): INR " + eco.getTotalFare()); // 50 + 120 + 40 = 210

        PricingContext ctxSurge = new PricingContext(RideType.ECONOMY, 10.0, 20.0, 1.5);
        FareBreakdown surged = surge.calculateFare(ctxSurge);
        System.out.println("ECONOMY Surge (1.5x): INR " + surged.getTotalFare()); // 210 * 1.5 = 315
    }
}
