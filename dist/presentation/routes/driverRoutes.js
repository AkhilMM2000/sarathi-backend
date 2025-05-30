"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DriverControler_1 = require("../controllers/DriverControler");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkBlocked_1 = require("../../middleware/checkBlocked");
const tsyringe_1 = require("tsyringe");
const AuthController_1 = require("../controllers/AuthController");
const BookingController_1 = require("../controllers/BookingController");
const router = express_1.default.Router();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
router
    .post("/register", DriverControler_1.DriverController.registerDriver)
    .post("/verify-otp", DriverControler_1.DriverController.verifyOTPDriver)
    .post("/login", DriverControler_1.DriverController.login);
router
    .route("/driver")
    .all((0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
    .get(DriverControler_1.DriverController.getDriverProfile);
router
    .route("/driver/:id")
    .all((0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
    .put(DriverControler_1.DriverController.editDriverProfile);
router
    .get("/ridehistory", (0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getRideHistory).patch('/auth/change-password', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), AuthController_1.AuthController.ChangePassword)
    .post('onboard', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), DriverControler_1.DriverController.onboardDriver)
    .get('/bookings', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), DriverControler_1.DriverController.getBookingsForDriver)
    .patch('/booking-status/:bookingId', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.updateStatus)
    .post('verify-account', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), DriverControler_1.DriverController.verifyAccount).get('/chat/:roomId', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getChatByBookingId).delete('/chat/:roomId/message/:messageId', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.deleteMessage).
    post('/chat/signature', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getChatSignature).get('/user/:id', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), DriverControler_1.DriverController.getUserById).get('/review/:id', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.ReviewDriver);
exports.default = router;
//# sourceMappingURL=driverRoutes.js.map