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
const BookingController_1 = require("../controllers/BookingController");
const Tokens_1 = require("../../constants/Tokens");
const AuthRoute_1 = require("./AuthRoute");
const router = express_1.default.Router();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
exports.userController = tsyringe_1.container.resolve(Tokens_1.TOKENS.USER_CONTROLLER);
exports.bookingController = tsyringe_1.container.resolve(Tokens_1.TOKENS.BOOKING_CONTROLLER);
// Authentication Routes
router
    .post("/register", exports.userController.register.bind(exports.userController))
    .post("/verify-otp", exports.userController.verifyOTPUser.bind(exports.userController))
    .post("/resend-otp", exports.userController.resendOTP.bind(exports.userController))
    .post("/login", exports.userController.login.bind(exports.userController));
// Vehicle Routes (Protected)
router
    .route("/vehicle")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .post(exports.userController.addVehicle.bind(exports.userController))
    .get(exports.userController.getAllVehicle.bind(exports.userController));
router
    .route("/vehicle/:vehicleId")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Ensures protection for all requests to this route
    .put(exports.userController.editVehicle.bind(exports.userController));
router
    .route("/profile")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .get(exports.userController.getUserData.bind(exports.userController));
router
    .route("/profile/:id")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .patch(exports.userController.updateUser.bind(exports.userController));
router.get("/nearby", (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.fetchDrivers.bind(exports.userController))
    .get('/driver/:driverId', exports.userController.getDriverDetails.bind(exports.userController));
router.patch('/auth/change-password', (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), AuthRoute_1.authController.ChangePassword.bind(AuthRoute_1.authController));
//Booking Routes
router
    .route("/bookslot")
    .post((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.bookDriver.bind(exports.bookingController))
    .get((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getUserBookings.bind(exports.bookingController));
router
    .route("/estimate-fare")
    .post((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getEstimatedFare.bind(exports.bookingController));
router
    .route("/update-booking/:rideId")
    .patch((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.attachPaymentIntent.bind(exports.bookingController));
router
    .route("/ridehistory")
    .get((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getRideHistory);
router
    .post("/payment-intent", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.createPaymentIntent.bind(exports.userController))
    .patch("/booking/cancel", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.cancelBooking.bind(exports.bookingController))
    .get("/chat/:roomId", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatByBookingId.bind(exports.bookingController))
    .delete('/chat/:roomId/message/:messageId', (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.deleteMessage.bind(exports.bookingController))
    .post("/chat/signature", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.getChatSignature.bind(exports.bookingController)).get('/driver/:id', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.getDriverById.bind(exports.userController)).get('/wallet', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.WalletTransaction.bind(exports.userController)).get('/wallet/ballence', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.Walletballence.bind(exports.bookingController)).post('/wallet/ridepayment', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.WalletPayment.bind(exports.bookingController)).post('/review', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.userController.submitReview.bind(exports.userController)).get('/review/:id', (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), exports.bookingController.ReviewDriver.bind(exports.bookingController));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map