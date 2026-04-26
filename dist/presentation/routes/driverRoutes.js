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
const Routes_1 = require("../../constants/Routes");
const router = express_1.default.Router();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
exports.bookingController = tsyringe_1.container.resolve(Tokens_1.TOKENS.BOOKING_CONTROLLER);
const driverController = tsyringe_1.container.resolve(UseCaseTokens_1.USECASE_TOKENS.DRIVER_CONTROLLER);
router
    .post(Routes_1.ROUTES.DRIVER.REGISTER, driverController.registerDriver.bind(driverController))
    .post(Routes_1.ROUTES.DRIVER.VERIFY_OTP, driverController.verifyOTPDriver.bind(driverController))
    .post(Routes_1.ROUTES.DRIVER.RESEND_OTP, driverController.resendOTP.bind(driverController))
    .post(Routes_1.ROUTES.DRIVER.LOGIN, driverController.login.bind(driverController));
router
    .route(Routes_1.ROUTES.DRIVER.PROFILE.BASE)
    .all((0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
    .get(driverController.getDriverProfile.bind(driverController));
router
    .route(Routes_1.ROUTES.DRIVER.PROFILE.BY_ID)
    .all((0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
    .put(driverController.editDriverProfile.bind(driverController));
router
    .get(Routes_1.ROUTES.DRIVER.RIDE_HISTORY, (0, authMiddleware_1.protectRoute)(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getRideHistory.bind(exports.bookingController)).patch(Routes_1.ROUTES.DRIVER.CHANGE_PASSWORD, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), AuthRoute_1.authController.ChangePassword.bind(AuthRoute_1.authController))
    .post(Routes_1.ROUTES.DRIVER.ONBOARD, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.onboardDriver.bind(driverController))
    .get(Routes_1.ROUTES.DRIVER.BOOKINGS, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.getBookingsForDriver.bind(driverController))
    .patch(Routes_1.ROUTES.DRIVER.BOOKING_STATUS, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.updateStatus.bind(exports.bookingController))
    .post(Routes_1.ROUTES.DRIVER.VERIFY_ACCOUNT, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.verifyAccount.bind(driverController)).get(Routes_1.ROUTES.DRIVER.CHAT.BASE, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatByBookingId.bind(exports.bookingController)).delete(Routes_1.ROUTES.DRIVER.CHAT.MESSAGE, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.deleteMessage.bind(exports.bookingController)).
    post(Routes_1.ROUTES.DRIVER.CHAT.SIGNATURE, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatSignature.bind(exports.bookingController)).get(Routes_1.ROUTES.DRIVER.USER_BY_ID, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), driverController.getUserById.bind(driverController)).get(Routes_1.ROUTES.DRIVER.REVIEW_BY_ID, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.ReviewDriver.bind(exports.bookingController))
    .get(Routes_1.ROUTES.DRIVER.DASHBOARD.STATUS_SUMMARY, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getDriverBookingStatusSummary.bind(exports.bookingController));
router.get(Routes_1.ROUTES.DRIVER.DASHBOARD.EARNINGS_SUMMARY, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getDriverEarningsByMonth.bind(exports.bookingController));
router.get(Routes_1.ROUTES.DRIVER.DASHBOARD.BASE, (0, authMiddleware_1.protectRoute)(['driver']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getDriverDashboard.bind(exports.bookingController));
exports.default = router;
//# sourceMappingURL=driverRoutes.js.map