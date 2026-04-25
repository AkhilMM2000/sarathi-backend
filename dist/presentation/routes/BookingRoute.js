"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const express_1 = require("express");
const checkBlocked_1 = require("../../middleware/checkBlocked");
const tsyringe_1 = require("tsyringe");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const Tokens_1 = require("../../constants/Tokens");
const router = (0, express_1.Router)();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
exports.bookingController = tsyringe_1.container.resolve(Tokens_1.TOKENS.BOOKING_CONTROLLER);
// Booking endpoint
router.post("/book/slot", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.bookDriver.bind(exports.bookingController));
router.post("/book/estimate-fare", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getEstimatedFare.bind(exports.bookingController));
exports.default = router;
//# sourceMappingURL=BookingRoute.js.map