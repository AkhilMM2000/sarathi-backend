"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminController_1 = require("../controllers/AdminController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const BookingController_1 = require("../controllers/BookingController");
const router = express_1.default.Router();
router.post("/login", AdminController_1.AdminController.login);
// User Management
router
    .route("/user")
    .get((0, authMiddleware_1.protectRoute)(["admin"]), AdminController_1.AdminController.getAllUsers);
router
    .route("/update-user-status/:userId")
    .put((0, authMiddleware_1.protectRoute)(["admin"]), AdminController_1.AdminController.updateUserStatus);
// Driver Management
router
    .route("/driver")
    .get((0, authMiddleware_1.protectRoute)(["admin"]), AdminController_1.AdminController.getAllDrivers);
router
    .route("/driver/status/:driverId")
    .put((0, authMiddleware_1.protectRoute)(["admin"]), AdminController_1.AdminController.changeDriverStatus);
router
    .route("/driver/blockstatus/:driverId")
    .patch((0, authMiddleware_1.protectRoute)(["admin"]), AdminController_1.AdminController.handleBlockStatus);
// Vehicle Management
router
    .route("/vehicles/:userId")
    .get((0, authMiddleware_1.protectRoute)(["admin"]), AdminController_1.AdminController.getVehiclesByUser);
router.get("/bookings", BookingController_1.BookingController.getAllBookings);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map