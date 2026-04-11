"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../constants/Tokens");
const router = express_1.default.Router();
const bookingController = tsyringe_1.container.resolve(Tokens_1.TOKENS.BOOKING_CONTROLLER);
const adminController = tsyringe_1.container.resolve(Tokens_1.TOKENS.ADMIN_CONTROLLER);
router.post("/login", adminController.login.bind(adminController));
router.get("/dashboard", (0, authMiddleware_1.protectRoute)(["admin"]), adminController.getDashboardStats.bind(adminController));
// User Management
router
    .route("/user")
    .get((0, authMiddleware_1.protectRoute)(["admin"]), adminController.getAllUsers.bind(adminController));
router
    .route("/update-user-status/:userId")
    .put((0, authMiddleware_1.protectRoute)(["admin"]), adminController.updateUserStatus.bind(adminController));
// Driver Management
router
    .route("/driver")
    .get((0, authMiddleware_1.protectRoute)(["admin"]), adminController.getAllDrivers.bind(adminController));
router
    .route("/driver/status/:driverId")
    .put((0, authMiddleware_1.protectRoute)(["admin"]), adminController.changeDriverStatus.bind(adminController));
router
    .route("/driver/blockstatus/:driverId")
    .patch((0, authMiddleware_1.protectRoute)(["admin"]), adminController.handleBlockStatus.bind(adminController));
// Vehicle Management
router
    .route("/vehicles/:userId")
    .get((0, authMiddleware_1.protectRoute)(["admin"]), adminController.getVehiclesByUser.bind(adminController));
router.get("/bookings", bookingController.getAllBookings.bind(bookingController));
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map