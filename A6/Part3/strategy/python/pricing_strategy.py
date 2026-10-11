"""
Part 3: Strategy Pattern Implementation in Python
Calculates ride fares across multiple service tiers (ECONOMY, PREMIUM, XL)
and dynamic surge pricing.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import NamedTuple

class RideType(str, Enum):
    ECONOMY = "ECONOMY"
    PREMIUM = "PREMIUM"
    XL = "XL"

class PricingContext(NamedTuple):
    ride_type: RideType
    distance_km: float
    duration_minutes: float
    surge_multiplier: float = 1.0

class FareBreakdown(NamedTuple):
    base_fare: float
    distance_fare: float
    time_fare: float
    surge_multiplier: float
    total_fare: int
    ride_type: RideType

class IPricingStrategy(ABC):
    @property
    @abstractmethod
    def strategy_name(self) -> str:
        pass

    @abstractmethod
    def calculate_fare(self, context: PricingContext) -> FareBreakdown:
        pass

class StandardPricingStrategy(IPricingStrategy):
    @property
    def strategy_name(self) -> str:
        return "StandardPricingStrategy"

    RATES = {
        RideType.ECONOMY: {"base": 50.0, "per_km": 12.0, "per_min": 2.0, "min_fare": 150},
        RideType.PREMIUM: {"base": 100.0, "per_km": 20.0, "per_min": 3.5, "min_fare": 250},
        RideType.XL: {"base": 120.0, "per_km": 25.0, "per_min": 4.0, "min_fare": 300},
    }

    def calculate_fare(self, context: PricingContext) -> FareBreakdown:
        rate = self.RATES.get(context.ride_type, self.RATES[RideType.ECONOMY])
        dist = max(0.0, context.distance_km)
        duration = context.duration_minutes if context.duration_minutes >= 0 else dist * 2

        base = rate["base"]
        dist_fare = dist * rate["per_km"]
        time_fare = duration * rate["per_min"]
        subtotal = base + dist_fare + time_fare
        total = max(rate["min_fare"], round(subtotal))

        return FareBreakdown(
            base_fare=base,
            distance_fare=dist_fare,
            time_fare=time_fare,
            surge_multiplier=1.0,
            total_fare=total,
            ride_type=context.ride_type,
        )

class SurgeDynamicPricingStrategy(IPricingStrategy):
    def __init__(self, base_strategy: IPricingStrategy):
        self.base_strategy = base_strategy

    @property
    def strategy_name(self) -> str:
        return "SurgeDynamicPricingStrategy"

    def calculate_fare(self, context: PricingContext) -> FareBreakdown:
        clamped_surge = min(2.5, max(1.0, context.surge_multiplier))
        base_breakdown = self.base_strategy.calculate_fare(context)
        surged_total = round(base_breakdown.total_fare * clamped_surge)

        return FareBreakdown(
            base_fare=base_breakdown.base_fare,
            distance_fare=base_breakdown.distance_fare,
            time_fare=base_breakdown.time_fare,
            surge_multiplier=clamped_surge,
            total_fare=surged_total,
            ride_type=context.ride_type,
        )
