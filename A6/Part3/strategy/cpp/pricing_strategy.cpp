/**
 * Part 3: Strategy Pattern Implementation in C++ (C++17)
 * Calculates ride fares across multiple service tiers (ECONOMY, PREMIUM, XL)
 * and dynamic surge pricing.
 */

#include <iostream>
#include <memory>
#include <string>
#include <algorithm>
#include <cmath>

enum class RideType {
    ECONOMY,
    PREMIUM,
    XL
};

struct PricingContext {
    RideType rideType;
    double distanceKm;
    double durationMinutes;
    double surgeMultiplier;

    PricingContext(RideType type, double dist, double dur = -1.0, double surge = 1.0)
        : rideType(type),
          distanceKm(std::max(0.0, dist)),
          durationMinutes(dur >= 0.0 ? dur : dist * 2.0),
          surgeMultiplier(std::min(2.5, std::max(1.0, surge))) {}
};

struct FareBreakdown {
    double baseFare;
    double distanceFare;
    double timeFare;
    double surgeMultiplier;
    long totalFare;
    RideType rideType;
};

class IPricingStrategy {
public:
    virtual ~IPricingStrategy() = default;
    virtual std::string getStrategyName() const = 0;
    virtual FareBreakdown calculateFare(const PricingContext& context) const = 0;
};

class StandardPricingStrategy : public IPricingStrategy {
public:
    std::string getStrategyName() const override { return "StandardPricingStrategy"; }

    FareBreakdown calculateFare(const PricingContext& context) const override {
        double baseRate;
        double perKm;
        double perMin;
        long minFare;

        switch (context.rideType) {
            case RideType::PREMIUM:
                baseRate = 100.0; perKm = 20.0; perMin = 3.5; minFare = 250;
                break;
            case RideType::XL:
                baseRate = 120.0; perKm = 25.0; perMin = 4.0; minFare = 300;
                break;
            case RideType::ECONOMY:
            default:
                baseRate = 50.0; perKm = 12.0; perMin = 2.0; minFare = 150;
                break;
        }

        double distanceFare = context.distanceKm * perKm;
        double timeFare = context.durationMinutes * perMin;
        double subtotal = baseRate + distanceFare + timeFare;
        long total = std::max(minFare, static_cast<long>(std::round(subtotal)));

        return { baseRate, distanceFare, timeFare, 1.0, total, context.rideType };
    }
};

class SurgeDynamicPricingStrategy : public IPricingStrategy {
    std::shared_ptr<IPricingStrategy> baseStrategy_;
public:
    explicit SurgeDynamicPricingStrategy(std::shared_ptr<IPricingStrategy> base)
        : baseStrategy_(std::move(base)) {}

    std::string getStrategyName() const override { return "SurgeDynamicPricingStrategy"; }

    FareBreakdown calculateFare(const PricingContext& context) const override {
        FareBreakdown base = baseStrategy_->calculateFare(context);
        long surgedTotal = static_cast<long>(std::round(base.totalFare * context.surgeMultiplier));
        return { base.baseFare, base.distanceFare, base.timeFare, context.surgeMultiplier, surgedTotal, context.rideType };
    }
};
