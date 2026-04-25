"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkBlocked_1 = require("../../middleware/checkBlocked");
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../constants/Tokens");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const AuthRoute_1 = require("./AuthRoute");
const router = express_1.default.Router();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
exports.bookingController = tsyringe_1.container.resolve(Tokens_1.TOKENS.BOOKING_CONTROLLER);
const driverController = tsyringe_1.container.resolve(UseCaseTokens_1.USECASE_TOKENS.DRIVER_CONTROLLER);
router
    .post("/register", driverController.registerDriver.bind(driverController))
    .post("/verify-otp", driverController.verifyOTPDriver.bind(driverController))
    .post("/resend-otp", driverController.resendOTP.bind(driverController))
    .post("/login", driverController.login.bind(driverController));
router
    .route("/driver")
    .all((0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
    .get(driverController.getDriverProfile.bind(driverController));
router
    .route("/driver/:id")
    .all((0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
    .put(driverController.editDriverProfile.bind(driverController));
router
    .get("/ridehistory", (0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getRideHistory.bind(exports.bookingController)).patch('/auth/change-password', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), AuthRoute_1.authController.ChangePassword.bind(AuthRoute_1.authController))
    .post('/onboard', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.onboardDriver.bind(driverController))
    .get('/bookings', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.getBookingsForDriver.bind(driverController))
    .patch('/booking-status/:bookingId', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.updateStatus.bind(exports.bookingController))
    .post('/verify-account', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.verifyAccount.bind(driverController)).get('/chat/:roomId', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatByBookingId.bind(exports.bookingController)).delete('/chat/:roomId/message/:messageId', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.deleteMessage.bind(exports.bookingController)).
    post('/chat/signature', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatSignature.bind(exports.bookingController)).get('/user/:id', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.getUserById.bind(driverController)).get('/review/:id', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.ReviewDriver.bind(exports.bookingController))
    .get('/dashboard/status-summary', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getDriverBookingStatusSummary.bind(exports.bookingController));
router.get('/dashboard/earnings-summary', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getDriverEarningsByMonth.bind(exports.bookingController));
router.get('/dashboard', (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getDriverDashboard.bind(exports.bookingController));
exports.default = router;
//# sourceMappingURL=driverRoutes.js.map