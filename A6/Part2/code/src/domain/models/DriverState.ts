export enum DriverStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SUSPENDED = "suspended",
  REJECTED = "rejected"
}

export interface IDriverState {
  readonly status: DriverStatus;
  canLogin(): boolean;
  canAcceptRides(): boolean;
  canReceiveNewBookings(): boolean;
  transitionTo(target: DriverStatus, reason?: string): IDriverState;
}

export class PendingDriverState implements IDriverState {
  readonly status = DriverStatus.PENDING;
  canLogin(): boolean { return false; }
  canAcceptRides(): boolean { return false; }
  canReceiveNewBookings(): boolean { return false; }
  transitionTo(target: DriverStatus, reason?: string): IDriverState {
    if (target === DriverStatus.APPROVED) return new ApprovedDriverState();
    if (target === DriverStatus.REJECTED) {
      if (!reason?.trim()) throw new Error("Rejection reason is mandatory.");
      return new RejectedDriverState(reason);
    }
    throw new Error(`Invalid transition from PENDING to ${target}`);
  }
}

export class ApprovedDriverState implements IDriverState {
  readonly status = DriverStatus.APPROVED;
  canLogin(): boolean { return true; }
  canAcceptRides(): boolean { return true; }
  canReceiveNewBookings(): boolean { return true; }
  transitionTo(target: DriverStatus, reason?: string): IDriverState {
    if (target === DriverStatus.SUSPENDED) {
      if (!reason?.trim()) throw new Error("Suspension reason is mandatory.");
      return new SuspendedDriverState(reason);
    }
    if (target === DriverStatus.REJECTED) {
      if (!reason?.trim()) throw new Error("Revocation reason is mandatory.");
      return new RejectedDriverState(reason);
    }
    throw new Error(`Invalid transition from APPROVED to ${target}`);
  }
}

export class SuspendedDriverState implements IDriverState {
  readonly status = DriverStatus.SUSPENDED;
  constructor(public readonly reason: string) {}
  canLogin(): boolean { return false; }
  canAcceptRides(): boolean { return false; }
  canReceiveNewBookings(): boolean { return false; }
  transitionTo(target: DriverStatus, reason?: string): IDriverState {
    if (target === DriverStatus.APPROVED) return new ApprovedDriverState();
    if (target === DriverStatus.REJECTED) {
      if (!reason?.trim()) throw new Error("Termination reason is mandatory.");
      return new RejectedDriverState(reason);
    }
    throw new Error(`Invalid transition from SUSPENDED to ${target}`);
  }
}

export class RejectedDriverState implements IDriverState {
  readonly status = DriverStatus.REJECTED;
  constructor(public readonly reason: string) {}
  canLogin(): boolean { return false; }
  canAcceptRides(): boolean { return false; }
  canReceiveNewBookings(): boolean { return false; }
  transitionTo(target: DriverStatus): IDriverState {
    if (target === DriverStatus.PENDING) return new PendingDriverState();
    throw new Error(`Cannot transition REJECTED driver directly to ${target}`);
  }
}

export class DriverStateFactory {
  static create(status: string, reason?: string): IDriverState {
    switch (status) {
      case DriverStatus.APPROVED: return new ApprovedDriverState();
      case DriverStatus.SUSPENDED: return new SuspendedDriverState(reason || "Disciplinary hold");
      case DriverStatus.REJECTED: return new RejectedDriverState(reason || "Application rejected");
      case DriverStatus.PENDING:
      default:
        return new PendingDriverState();
    }
  }
}
