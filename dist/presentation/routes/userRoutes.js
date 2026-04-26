"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = exports.userController = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkBlocked_1 = require("../../middleware/checkBlocked");
const tsyringe_1 = require("tsyringe");
const Routes_1 = require("../../constants/Routes");
const Tokens_1 = require("../../constants/Tokens");
const AuthRoute_1 = require("./AuthRoute");
const router = express_1.default.Router();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
exports.userController = tsyringe_1.container.resolve(Tokens_1.TOKENS.USER_CONTROLLER);
exports.bookingController = tsyringe_1.container.resolve(Tokens_1.TOKENS.BOOKING_CONTROLLER);
// Authentication Routes
router
    .post(Routes_1.ROUTES.USER.REGISTER, exports.userController.register.bind(exports.userController))
    .post(Routes_1.ROUTES.USER.VERIFY_OTP, exports.userController.verifyOTPUser.bind(exports.userController))
    .post(Routes_1.ROUTES.USER.RESEND_OTP, exports.userController.resendOTP.bind(exports.userController))
    .post(Routes_1.ROUTES.USER.LOGIN, exports.userController.login.bind(exports.userController));
// Vehicle Routes (Protected)
router
    .route(Routes_1.ROUTES.USER.VEHICLE.BASE)
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .post(exports.userController.addVehicle.bind(exports.userController))
    .get(exports.userController.getAllVehicle.bind(exports.userController));
router
    .route(Routes_1.ROUTES.USER.VEHICLE.BY_ID)
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Ensures protection for all requests to this route
    .put(exports.userController.editVehicle.bind(exports.userController));
router
    .route(Routes_1.ROUTES.USER.PROFILE.BASE)
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .get(exports.userController.getUserData.bind(exports.userController));
router
    .route(Routes_1.ROUTES.USER.PROFILE.BY_ID)
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .patch(exports.userController.updateUser.bind(exports.userController));
router.get(Routes_1.ROUTES.USER.NEARBY, (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.fetchDrivers.bind(exports.userController))
    .get(Routes_1.ROUTES.USER.DRIVER_DETAILS, (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.getDriverDetails.bind(exports.userController));
router.patch(Routes_1.ROUTES.USER.CHANGE_PASSWORD, (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), AuthRoute_1.authController.ChangePassword.bind(AuthRoute_1.authController));
//Booking Routes
router
    .route(Routes_1.ROUTES.USER.BOOK_SLOT)
    .post((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.bookDriver.bind(exports.bookingController))
    .get((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getUserBookings.bind(exports.bookingController));
router
    .route(Routes_1.ROUTES.USER.ESTIMATE_FARE)
    .post((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getEstimatedFare.bind(exports.bookingController));
router
    .route(Routes_1.ROUTES.USER.UPDATE_BOOKING)
    .patch((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.attachPaymentIntent.bind(exports.bookingController));
router
    .route(Routes_1.ROUTES.USER.RIDE_HISTORY)
    .get((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getRideHistory.bind(exports.bookingController));
router
    .post(Routes_1.ROUTES.USER.PAYMENT_INTENT, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.createPaymentIntent.bind(exports.userController))
    .patch(Routes_1.ROUTES.USER.CANCEL_BOOKING, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.cancelBooking.bind(exports.bookingController))
    .get(Routes_1.ROUTES.USER.CHAT.BASE, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatByBookingId.bind(exports.bookingController))
    .delete(Routes_1.ROUTES.USER.CHAT.MESSAGE, (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.deleteMessage.bind(exports.bookingController))
    .post(Routes_1.ROUTES.USER.CHAT.SIGNATURE, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatSignature.bind(exports.bookingController)).get(Routes_1.ROUTES.USER.GET_DRIVER_BY_ID, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.getDriverById.bind(exports.userController)).get(Routes_1.ROUTES.USER.WALLET.BASE, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.WalletTransaction.bind(exports.userController)).get(Routes_1.ROUTES.USER.WALLET.BALANCE, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.WalletBalance.bind(exports.bookingController)).post(Routes_1.ROUTES.USER.WALLET.RIDE_PAYMENT, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.WalletPayment.bind(exports.bookingController)).post(Routes_1.ROUTES.USER.REVIEW.BASE, (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.submitReview.bind(exports.userController)).get(Routes_1.ROUTES.USER.REVIEW.BY_ID, (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.ReviewDriver.bind(exports.bookingController));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map