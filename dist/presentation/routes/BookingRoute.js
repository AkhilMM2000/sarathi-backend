"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BookingController_1 = require("../controllers/BookingController");
const checkBlocked_1 = require("../../middleware/checkBlocked");
const tsyringe_1 = require("tsyringe");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
// Booking endpoint
router.post("/book/slot", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.bookDriver);
router.post("/book/estimate-fare", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getEstimatedFare);
exports.default = router;
//# sourceMappingURL=BookingRoute.js.map