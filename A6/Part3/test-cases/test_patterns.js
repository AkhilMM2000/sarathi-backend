/**
 * Part 3 Cross-Language Test Suite: JavaScript Harness
 * Executes deterministic behavioral equivalence assertions across State, Strategy, and Observer.
 */

const assert = require('assert');
const { DriverStatus, DriverContext, InvalidStateTransitionError } = require('../state/javascript/driver_state');
const { RideType, StandardPricingStrategy, SurgeDynamicPricingStrategy } = require('../strategy/javascript/pricing_strategy');
const { BookingCancelledEvent, RideCancellationEventBus, NotificationSubscriber, PaymentRefundSubscriber, AuditLogSubscriber } = require('../observer/javascript/ride_cancellation_observer');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✔ [JS] ${name} (PASS)`);
  } catch (err) {
    console.error(`❌ [JS] ${name} (FAIL):`, err.message);
  }
}

console.log("=== Running Part 3 Cross-Language Test Suite (JavaScript) ===");

// 1. State Pattern Tests
test("State: Driver begins in PENDING with disabled capabilities", () => {
  const driver = new DriverContext("D-1", "John");
  assert.strictEqual(driver.state.getStatus(), DriverStatus.PENDING);
  assert.strictEqual(driver.state.canLogin(), false);
  assert.strictEqual(driver.state.canAcceptRides(), false);
});

test("State: PENDING -> APPROVED enables ride acceptance", () => {
  const driver = new DriverContext("D-1", "John");
  driver.transition(DriverStatus.APPROVED);
  assert.strictEqual(driver.state.getStatus(), DriverStatus.APPROVED);
  assert.strictEqual(driver.state.canLogin(), true);
  assert.strictEqual(driver.state.canAcceptRides(), true);
});

test("State: APPROVED -> SUSPENDED disables ride acceptance", () => {
  const driver = new DriverContext("D-1", "John");
  driver.transition(DriverStatus.APPROVED);
  driver.transition(DriverStatus.SUSPENDED, "Speeding violation");
  assert.strictEqual(driver.state.getStatus(), DriverStatus.SUSPENDED);
  assert.strictEqual(driver.state.canAcceptRides(), false);
});

test("State: Illegal PENDING -> SUSPENDED transition throws error", () => {
  const driver = new DriverContext("D-1", "John");
  assert.throws(() => {
    driver.transition(DriverStatus.SUSPENDED, "Illegal");
  }, InvalidStateTransitionError);
});

// 2. Strategy Pattern Tests
test("Strategy: ECONOMY standard fare (10 km, 20 min) = 210", () => {
  const strat = new StandardPricingStrategy();
  const res = strat.calculateFare({ rideType: RideType.ECONOMY, distanceKm: 10, durationMinutes: 20 });
  // 50 (base) + 120 (10*12) + 40 (20*2) = 210
  assert.strictEqual(res.totalFare, 210);
});

test("Strategy: PREMIUM standard fare (10 km, 20 min) = 370", () => {
  const strat = new StandardPricingStrategy();
  const res = strat.calculateFare({ rideType: RideType.PREMIUM, distanceKm: 10, durationMinutes: 20 });
  // 100 + 200 + 70 = 370
  assert.strictEqual(res.totalFare, 370);
});

test("Strategy: Surge pricing clamps multiplier to max 2.5x", () => {
  const standard = new StandardPricingStrategy();
  const surge = new SurgeDynamicPricingStrategy(standard);
  const res = surge.calculateFare({ rideType: RideType.ECONOMY, distanceKm: 10, durationMinutes: 20, surgeMultiplier: 5.0 });
  // 210 * 2.5 = 525
  assert.strictEqual(res.totalFare, 525);
  assert.strictEqual(res.surgeMultiplier, 2.5);
});

// 3. Observer Pattern Tests
test("Observer: Dispatches cancellation to all 3 independent subscribers", async () => {
  const bus = new RideCancellationEventBus();
  const notif = new NotificationSubscriber();
  const refund = new PaymentRefundSubscriber();
  const audit = new AuditLogSubscriber();

  bus.subscribe(notif);
  bus.subscribe(refund);
  bus.subscribe(audit);

  const event = new BookingCancelledEvent({
    bookingId: "B-100",
    userId: "U-1",
    driverId: "D-1",
    reason: "Change of plans",
    refundAmount: 250
  });

  await bus.publish(event);
  assert.strictEqual(audit.logs.length, 1);
});

console.log(`\nJavaScript Pattern Test Summary: ${passedTests}/${totalTests} Passed.`);
