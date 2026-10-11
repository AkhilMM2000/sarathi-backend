#include <iostream>
#include <memory>
#include <string>
#include <stdexcept>

enum class DriverStatus {
    PENDING,
    APPROVED,
    SUSPENDED,
    REJECTED
};

inline std::string statusToString(DriverStatus s) {
    switch (s) {
        case DriverStatus::PENDING: return "PENDING";
        case DriverStatus::APPROVED: return "APPROVED";
        case DriverStatus::SUSPENDED: return "SUSPENDED";
        case DriverStatus::REJECTED: return "REJECTED";
    }
    return "UNKNOWN";
}

class InvalidStateTransitionException : public std::runtime_error {
public:
    explicit InvalidStateTransitionException(const std::string& msg) : std::runtime_error(msg) {}
};

class IDriverState {
public:
    virtual ~IDriverState() = default;
    virtual DriverStatus getStatus() const = 0;
    virtual bool canLogin() const = 0;
    virtual bool canAcceptRides() const = 0;
    virtual bool canReceiveNewBookings() const = 0;
    virtual std::unique_ptr<IDriverState> transitionTo(DriverStatus target, const std::string& reason) = 0;
};

class PendingState;
class ApprovedState;
class SuspendedState;
class RejectedState;

class PendingState : public IDriverState {
public:
    DriverStatus getStatus() const override { return DriverStatus::PENDING; }
    bool canLogin() const override { return false; }
    bool canAcceptRides() const override { return false; }
    bool canReceiveNewBookings() const override { return false; }
    std::unique_ptr<IDriverState> transitionTo(DriverStatus target, const std::string& reason) override;
};

class ApprovedState : public IDriverState {
public:
    DriverStatus getStatus() const override { return DriverStatus::APPROVED; }
    bool canLogin() const override { return true; }
    bool canAcceptRides() const override { return true; }
    bool canReceiveNewBookings() const override { return true; }
    std::unique_ptr<IDriverState> transitionTo(DriverStatus target, const std::string& reason) override;
};

class SuspendedState : public IDriverState {
    std::string reason_;
public:
    explicit SuspendedState(std::string reason) : reason_(std::move(reason)) {}
    DriverStatus getStatus() const override { return DriverStatus::SUSPENDED; }
    bool canLogin() const override { return false; }
    bool canAcceptRides() const override { return false; }
    bool canReceiveNewBookings() const override { return false; }
    std::unique_ptr<IDriverState> transitionTo(DriverStatus target, const std::string& reason) override;
};

class RejectedState : public IDriverState {
    std::string reason_;
public:
    explicit RejectedState(std::string reason) : reason_(std::move(reason)) {}
    DriverStatus getStatus() const override { return DriverStatus::REJECTED; }
    bool canLogin() const override { return false; }
    bool canAcceptRides() const override { return false; }
    bool canReceiveNewBookings() const override { return false; }
    std::unique_ptr<IDriverState> transitionTo(DriverStatus target, const std::string& reason) override;
};

inline std::unique_ptr<IDriverState> PendingState::transitionTo(DriverStatus target, const std::string& reason) {
    if (target == DriverStatus::APPROVED) return std::make_unique<ApprovedState>();
    if (target == DriverStatus::REJECTED) {
        if (reason.empty()) throw InvalidStateTransitionException("Rejection reason is mandatory.");
        return std::make_unique<RejectedState>(reason);
    }
    throw InvalidStateTransitionException("Cannot transition PENDING driver to " + statusToString(target));
}

inline std::unique_ptr<IDriverState> ApprovedState::transitionTo(DriverStatus target, const std::string& reason) {
    if (target == DriverStatus::SUSPENDED) {
        if (reason.empty()) throw InvalidStateTransitionException("Suspension reason is mandatory.");
        return std::make_unique<SuspendedState>(reason);
    }
    if (target == DriverStatus::REJECTED) {
        if (reason.empty()) throw InvalidStateTransitionException("Revocation reason is mandatory.");
        return std::make_unique<RejectedState>(reason);
    }
    throw InvalidStateTransitionException("Cannot transition APPROVED driver to " + statusToString(target));
}

inline std::unique_ptr<IDriverState> SuspendedState::transitionTo(DriverStatus target, const std::string& reason) {
    if (target == DriverStatus::APPROVED) return std::make_unique<ApprovedState>();
    if (target == DriverStatus::REJECTED) {
        if (reason.empty()) throw InvalidStateTransitionException("Termination reason is mandatory.");
        return std::make_unique<RejectedState>(reason);
    }
    throw InvalidStateTransitionException("Cannot transition SUSPENDED driver to " + statusToString(target));
}

inline std::unique_ptr<IDriverState> RejectedState::transitionTo(DriverStatus target, const std::string& reason) {
    if (target == DriverStatus::PENDING) return std::make_unique<PendingState>();
    throw InvalidStateTransitionException("Cannot transition REJECTED driver directly to " + statusToString(target));
}

class DriverContext {
    std::string id_;
    std::string name_;
    std::unique_ptr<IDriverState> state_;
public:
    DriverContext(std::string id, std::string name)
        : id_(std::move(id)), name_(std::move(name)), state_(std::make_unique<PendingState>()) {}

    const IDriverState& getState() const { return *state_; }
    void transition(DriverStatus newStatus, const std::string& reason = "") {
        state_ = state_->transitionTo(newStatus, reason);
    }
};
