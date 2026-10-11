/**
 * Part 3: State Pattern Implementation in JavaScript (Node.js)
 * Models Driver Lifecycle State Machine with polymorphic transition validation.
 */

const DriverStatus = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED"
});

class InvalidStateTransitionError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidStateTransitionError";
  }
}

class IDriverState {
  getStatus() { throw new Error("Must implement getStatus"); }
  canLogin() { throw new Error("Must implement canLogin"); }
  canAcceptRides() { throw new Error("Must implement canAcceptRides"); }
  canReceiveNewBookings() { throw new Error("Must implement canReceiveNewBookings"); }
  transitionTo(targetStatus, reason) { throw new Error("Must implement transitionTo"); }
}

class PendingState extends IDriverState {
  getStatus() { return DriverStatus.PENDING; }
  canLogin() { return false; }
  canAcceptRides() { return false; }
  canReceiveNewBookings() { return false; }

  transitionTo(targetStatus, reason) {
    if (targetStatus === DriverStatus.APPROVED) {
      return new ApprovedState();
    } else if (targetStatus === DriverStatus.REJECTED) {
      if (!reason || !reason.trim()) {
        throw new InvalidStateTransitionError("Rejection reason is mandatory.");
      }
      return new RejectedState(reason);
    }
    throw new InvalidStateTransitionError(`Cannot transition PENDING driver to ${targetStatus}`);
  }
}

class ApprovedState extends IDriverState {
  getStatus() { return DriverStatus.APPROVED; }
  canLogin() { return true; }
  canAcceptRides() { return true; }
  canReceiveNewBookings() { return true; }

  transitionTo(targetStatus, reason) {
    if (targetStatus === DriverStatus.SUSPENDED) {
      if (!reason || !reason.trim()) {
        throw new InvalidStateTransitionError("Suspension reason is mandatory.");
      }
      return new SuspendedState(reason);
    } else if (targetStatus === DriverStatus.REJECTED) {
      if (!reason || !reason.trim()) {
        throw new InvalidStateTransitionError("Revocation reason is mandatory.");
      }
      return new RejectedState(reason);
    }
    throw new InvalidStateTransitionError(`Cannot transition APPROVED driver to ${targetStatus}`);
  }
}

class SuspendedState extends IDriverState {
  constructor(reason) {
    super();
    this.reason = reason;
  }
  getStatus() { return DriverStatus.SUSPENDED; }
  canLogin() { return false; }
  canAcceptRides() { return false; }
  canReceiveNewBookings() { return false; }

  transitionTo(targetStatus, reason) {
    if (targetStatus === DriverStatus.APPROVED) {
      return new ApprovedState();
    } else if (targetStatus === DriverStatus.REJECTED) {
      if (!reason || !reason.trim()) {
        throw new InvalidStateTransitionError("Termination reason is mandatory.");
      }
      return new RejectedState(reason);
    }
    throw new InvalidStateTransitionError(`Cannot transition SUSPENDED driver to ${targetStatus}`);
  }
}

class RejectedState extends IDriverState {
  constructor(reason) {
    super();
    this.reason = reason;
  }
  getStatus() { return DriverStatus.REJECTED; }
  canLogin() { return false; }
  canAcceptRides() { return false; }
  canReceiveNewBookings() { return false; }

  transitionTo(targetStatus, reason) {
    if (targetStatus === DriverStatus.PENDING) {
      return new PendingState();
    }
    throw new InvalidStateTransitionError(`Cannot transition REJECTED driver directly to ${targetStatus}`);
  }
}

class DriverContext {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.state = new PendingState();
  }

  transition(newStatus, reason) {
    this.state = this.state.transitionTo(newStatus, reason);
  }
}

module.exports = {
  DriverStatus,
  InvalidStateTransitionError,
  PendingState,
  ApprovedState,
  SuspendedState,
  RejectedState,
  DriverContext
};
