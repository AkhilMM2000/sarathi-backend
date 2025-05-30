"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingType = exports.BookingStatus = exports.paymentStatus = void 0;
var paymentStatus;
(function (paymentStatus) {
    paymentStatus["PENDING"] = "PENDING";
    paymentStatus["COMPLETED"] = "COMPLETED";
    paymentStatus["FAILED"] = "FAILED";
})(paymentStatus || (exports.paymentStatus = paymentStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["REJECTED"] = "REJECTED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var BookingType;
(function (BookingType) {
    BookingType["ONE_WAY"] = "ONE_RIDE";
    BookingType["ROUND_TRIP"] = "RANGE_OF_DATES";
})(BookingType || (exports.BookingType = BookingType = {}));
//# sourceMappingURL=Booking.js.map