enum DriverStatus {

    PENDING, APPROVED, SUSPENDED, REJECTED
}

class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String message) {
        super(message);
    }
}

interface IDriverState {
    DriverStatus getStatus();
    boolean canLogin();
    boolean canAcceptRides();
    boolean canReceiveNewBookings();
    IDriverState transitionTo(DriverStatus targetStatus, String reason);
}

class PendingState implements IDriverState {
    @Override
    public DriverStatus getStatus() { return DriverStatus.PENDING; }
    @Override
    public boolean canLogin() { return false; }
    @Override
    public boolean canAcceptRides() { return false; }
    @Override
    public boolean canReceiveNewBookings() { return false; }

    @Override
    public IDriverState transitionTo(DriverStatus target, String reason) {
        if (target == DriverStatus.APPROVED) {
            return new ApprovedState();
        } else if (target == DriverStatus.REJECTED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new InvalidStateTransitionException("Rejection reason is mandatory.");
            }
            return new RejectedState(reason);
        }
        throw new InvalidStateTransitionException("Cannot transition PENDING driver to " + target);
    }
}

class ApprovedState implements IDriverState {
    @Override
    public DriverStatus getStatus() { return DriverStatus.APPROVED; }
    @Override
    public boolean canLogin() { return true; }
    @Override
    public boolean canAcceptRides() { return true; }
    @Override
    public boolean canReceiveNewBookings() { return true; }

    @Override
    public IDriverState transitionTo(DriverStatus target, String reason) {
        if (target == DriverStatus.SUSPENDED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new InvalidStateTransitionException("Suspension reason is mandatory.");
            }
            return new SuspendedState(reason);
        } else if (target == DriverStatus.REJECTED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new InvalidStateTransitionException("Revocation reason is mandatory.");
            }
            return new RejectedState(reason);
        }
        throw new InvalidStateTransitionException("Cannot transition APPROVED driver to " + target);
    }
}

class SuspendedState implements IDriverState {
    private final String suspensionReason;

    public SuspendedState(String reason) {
        this.suspensionReason = reason;
    }

    public String getReason() { return suspensionReason; }

    @Override
    public DriverStatus getStatus() { return DriverStatus.SUSPENDED; }
    @Override
    public boolean canLogin() { return false; }
    @Override
    public boolean canAcceptRides() { return false; }
    @Override
    public boolean canReceiveNewBookings() { return false; }

    @Override
    public IDriverState transitionTo(DriverStatus target, String reason) {
        if (target == DriverStatus.APPROVED) {
            return new ApprovedState();
        } else if (target == DriverStatus.REJECTED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new InvalidStateTransitionException("Termination reason is mandatory.");
            }
            return new RejectedState(reason);
        }
        throw new InvalidStateTransitionException("Cannot transition SUSPENDED driver to " + target);
    }
}

class RejectedState implements IDriverState {
    private final String rejectionReason;

    public RejectedState(String reason) {
        this.rejectionReason = reason;
    }

    public String getReason() { return rejectionReason; }

    @Override
    public DriverStatus getStatus() { return DriverStatus.REJECTED; }
    @Override
    public boolean canLogin() { return false; }
    @Override
    public boolean canAcceptRides() { return false; }
    @Override
    public boolean canReceiveNewBookings() { return false; }

    @Override
    public IDriverState transitionTo(DriverStatus target, String reason) {
        if (target == DriverStatus.PENDING) {
            return new PendingState();
        }
        throw new InvalidStateTransitionException("Cannot transition REJECTED driver directly to " + target);
    }
}

public class DriverState {
    private String id;
    private String name;
    private IDriverState state;

    public DriverState(String id, String name) {
        this.id = id;
        this.name = name;
        this.state = new PendingState();
    }

    public IDriverState getState() { return state; }

    public void transition(DriverStatus newStatus, String reason) {
        this.state = this.state.transitionTo(newStatus, reason);
    }
}
