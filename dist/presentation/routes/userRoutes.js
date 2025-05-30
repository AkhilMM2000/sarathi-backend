"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const checkBlocked_1 = require("../../middleware/checkBlocked");
const tsyringe_1 = require("tsyringe");
const AuthController_1 = require("../controllers/AuthController");
const BookingController_1 = require("../controllers/BookingController");
const router = express_1.default.Router();
const checkBlockedMiddleware = tsyringe_1.container.resolve(checkBlocked_1.CheckBlockedUserOrDriver);
// Authentication Routes
router
    .post("/register", UserController_1.UserController.register)
    .post("/verify-otp", UserController_1.UserController.verifyOTPUser)
    .post("/resend-otp", UserController_1.UserController.resendOTP)
    .post("/login", UserController_1.UserController.login);
// Vehicle Routes (Protected)
router
    .route("/vehicle")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .post(UserController_1.UserController.addVehicle)
    .get(UserController_1.UserController.getAllVehicle);
router
    .route("/vehicle/:vehicleId")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Ensures protection for all requests to this route
    .put(UserController_1.UserController.editVehicle);
router
    .route("/profile")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .get(UserController_1.UserController.getUserData);
router
    .route("/profile/:id")
    .all((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
    .patch(UserController_1.UserController.updateUser);
router.get("/nearby", (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), UserController_1.UserController.fetchDrivers);
router.patch('/auth/change-password', (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), AuthController_1.AuthController.ChangePassword);
//Booking Routes
router
    .route("/bookslot")
    .post((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.bookDriver)
    .get((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getUserBookings);
router
    .route("/estimate-fare")
    .post((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getEstimatedFare);
router
    .route("/update-booking/:rideId")
    .patch((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.attachPaymentIntent);
router
    .route("/ridehistory")
    .get((0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getRideHistory);
router
    .post("/payment-intent", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), UserController_1.UserController.createPaymentIntent)
    .patch("/booking/cancel", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.cancelBooking)
    .get("/chat/:roomId", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getChatByBookingId)
    .delete('/chat/:roomId/message/:messageId', (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.deleteMessage)
    .post("/chat/signature", (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.getChatSignature).get('/driver/:id', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), UserController_1.UserController.getDriverById).get('/wallet', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), UserController_1.UserController.WalletTransaction).get('/wallet/ballence', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.Walletballence).post('/wallet/ridepayment', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.WalletPayment).post('/review', (0, authMiddleware_1.protectRoute)(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), UserController_1.UserController.submitReview).get('/review/:id', (0, authMiddleware_1.protectRoute)(['user']), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController_1.BookingController.ReviewDriver);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map