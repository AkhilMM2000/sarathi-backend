"""
Part 3: State Pattern Implementation in Python
Models Driver Lifecycle State Machine with polymorphic transition validation.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional

class DriverStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    SUSPENDED = "SUSPENDED"
    REJECTED = "REJECTED"

class InvalidStateTransitionError(Exception):
    pass

class IDriverState(ABC):
    @property
    @abstractmethod
    def status(self) -> DriverStatus:
        pass

    @abstractmethod
    def can_login(self) -> bool:
        pass

    @abstractmethod
    def can_accept_rides(self) -> bool:
        pass

    @abstractmethod
    def can_receive_new_bookings(self) -> bool:
        pass

    @abstractmethod
    def transition_to(self, target_status: DriverStatus, reason: Optional[str] = None) -> "IDriverState":
        pass

class PendingState(IDriverState):
    @property
    def status(self) -> DriverStatus:
        return DriverStatus.PENDING

    def can_login(self) -> bool:
        return False

    def can_accept_rides(self) -> bool:
        return False

    def can_receive_new_bookings(self) -> bool:
        return False

    def transition_to(self, target_status: DriverStatus, reason: Optional[str] = None) -> IDriverState:
        if target_status == DriverStatus.APPROVED:
            return ApprovedState()
        elif target_status == DriverStatus.REJECTED:
            if not reason:
                raise InvalidStateTransitionError("Rejection reason is mandatory.")
            return RejectedState(reason)
        raise InvalidStateTransitionError(f"Cannot transition PENDING driver to {target_status}")

class ApprovedState(IDriverState):
    @property
    def status(self) -> DriverStatus:
        return DriverStatus.APPROVED

    def can_login(self) -> bool:
        return True

    def can_accept_rides(self) -> bool:
        return True

    def can_receive_new_bookings(self) -> bool:
        return True

    def transition_to(self, target_status: DriverStatus, reason: Optional[str] = None) -> IDriverState:
        if target_status == DriverStatus.SUSPENDED:
            if not reason:
                raise InvalidStateTransitionError("Suspension reason is mandatory.")
            return SuspendedState(reason)
        elif target_status == DriverStatus.REJECTED:
            if not reason:
                raise InvalidStateTransitionError("Revocation reason is mandatory.")
            return RejectedState(reason)
        raise InvalidStateTransitionError(f"Cannot transition APPROVED driver to {target_status}")

class SuspendedState(IDriverState):
    def __init__(self, reason: str):
        self.reason = reason

    @property
    def status(self) -> DriverStatus:
        return DriverStatus.SUSPENDED

    def can_login(self) -> bool:
        return False

    def can_accept_rides(self) -> bool:
        return False

    def can_receive_new_bookings(self) -> bool:
        return False

    def transition_to(self, target_status: DriverStatus, reason: Optional[str] = None) -> IDriverState:
        if target_status == DriverStatus.APPROVED:
            return ApprovedState()
        elif target_status == DriverStatus.REJECTED:
            if not reason:
                raise InvalidStateTransitionError("Termination reason is mandatory.")
            return RejectedState(reason)
        raise InvalidStateTransitionError(f"Cannot transition SUSPENDED driver to {target_status}")

class RejectedState(IDriverState):
    def __init__(self, reason: str):
        self.reason = reason

    @property
    def status(self) -> DriverStatus:
        return DriverStatus.REJECTED

    def can_login(self) -> bool:
        return False

    def can_accept_rides(self) -> bool:
        return False

    def can_receive_new_bookings(self) -> bool:
        return False

    def transition_to(self, target_status: DriverStatus, reason: Optional[str] = None) -> IDriverState:
        if target_status == DriverStatus.PENDING:
            return PendingState()
        raise InvalidStateTransitionError(f"Cannot transition REJECTED driver directly to {target_status}")

class DriverContext:
    def __init__(self, driver_id: str, name: str):
        self.driver_id = driver_id
        self.name = name
        self.state: IDriverState = PendingState()

    def transition(self, new_status: DriverStatus, reason: Optional[str] = None):
        self.state = self.state.transition_to(new_status, reason)
