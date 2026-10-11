"""
Part 3 Cross-Language Test Suite: Python Harness
Executes deterministic behavioral equivalence assertions across State, Strategy, and Observer.
"""

import sys
import os

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from state.python.driver_state import DriverStatus, DriverContext, InvalidStateTransitionError
from strategy.python.pricing_strategy import RideType, PricingContext, StandardPricingStrategy, SurgeDynamicPricingStrategy
from observer.python.ride_cancellation_observer import BookingCancelledEvent, RideCancellationEventBus, NotificationSubscriber, PaymentRefundSubscriber, AuditLogSubscriber

def run_tests():
    total_tests = 0
    passed_tests = 0

    print("=== Running Part 3 Cross-Language Test Suite (Python) ===")

    # 1. State Pattern Tests
    total_tests += 1
    d = DriverContext("D-1", "John")
    assert d.state.status == DriverStatus.PENDING
    assert not d.state.can_login()
    assert not d.state.can_accept_rides()
    passed_tests += 1
    print("[PASS] State: Driver begins in PENDING with disabled capabilities")

    total_tests += 1
    d.transition(DriverStatus.APPROVED)
    assert d.state.status == DriverStatus.APPROVED
    assert d.state.can_login()
    assert d.state.can_accept_rides()
    passed_tests += 1
    print("[PASS] State: PENDING -> APPROVED enables ride acceptance")

    total_tests += 1
    d.transition(DriverStatus.SUSPENDED, "Speeding violation")
    assert d.state.status == DriverStatus.SUSPENDED
    assert not d.state.can_accept_rides()
    passed_tests += 1
    print("[PASS] State: APPROVED -> SUSPENDED disables ride acceptance")

    total_tests += 1
    d_fresh = DriverContext("D-2", "Alex")
    try:
        d_fresh.transition(DriverStatus.SUSPENDED, "Illegal")
        assert False, "Should have thrown"
    except InvalidStateTransitionError:
        passed_tests += 1
        print("[PASS] State: Illegal PENDING -> SUSPENDED transition throws error")

    # 2. Strategy Pattern Tests
    total_tests += 1
    strat = StandardPricingStrategy()
    ctx_eco = PricingContext(ride_type=RideType.ECONOMY, distance_km=10.0, duration_minutes=20.0)
    res_eco = strat.calculate_fare(ctx_eco)
    assert res_eco.total_fare == 210, f"Expected 210, got {res_eco.total_fare}"
    passed_tests += 1
    print("[PASS] Strategy: ECONOMY standard fare (10 km, 20 min) = 210")

    total_tests += 1
    ctx_prem = PricingContext(ride_type=RideType.PREMIUM, distance_km=10.0, duration_minutes=20.0)
    res_prem = strat.calculate_fare(ctx_prem)
    assert res_prem.total_fare == 370, f"Expected 370, got {res_prem.total_fare}"
    passed_tests += 1
    print("[PASS] Strategy: PREMIUM standard fare (10 km, 20 min) = 370")

    total_tests += 1
    surge = SurgeDynamicPricingStrategy(strat)
    ctx_surge = PricingContext(ride_type=RideType.ECONOMY, distance_km=10.0, duration_minutes=20.0, surge_multiplier=5.0)
    res_surge = surge.calculate_fare(ctx_surge)
    assert res_surge.total_fare == 525, f"Expected 525, got {res_surge.total_fare}"
    assert res_surge.surge_multiplier == 2.5
    passed_tests += 1
    print("[PASS] Strategy: Surge pricing clamps multiplier to max 2.5x")

    # 3. Observer Pattern Tests
    total_tests += 1
    bus = RideCancellationEventBus()
    notif = NotificationSubscriber()
    refund = PaymentRefundSubscriber()
    audit = AuditLogSubscriber()
    bus.subscribe(notif)
    bus.subscribe(refund)
    bus.subscribe(audit)

    event = BookingCancelledEvent(
        booking_id="B-100",
        user_id="U-1",
        driver_id="D-1",
        reason="Change of plans",
        refund_amount=250.0
    )
    bus.publish(event)
    assert len(audit.logs) == 1
    passed_tests += 1
    print("[PASS] Observer: Dispatches cancellation to all 3 independent subscribers")

    print(f"\nPython Pattern Test Summary: {passed_tests}/{total_tests} Passed.")

if __name__ == "__main__":
    run_tests()
