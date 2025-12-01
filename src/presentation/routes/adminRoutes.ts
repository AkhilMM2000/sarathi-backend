import express from "express";
import { AdminController } from "../controllers/AdminController";
import { protectRoute } from "../../middleware/authMiddleware";
import { BookingController } from "../controllers/BookingController";
import { container } from "tsyringe";
import { TOKENS } from "../../constants/Tokens";


const router = express.Router();
 const bookingController=container.resolve<BookingController>(TOKENS.BOOKING_CONTROLLER);
const adminController=container.resolve<AdminController>(TOKENS.ADMIN_CONTROLLER)
router.post("/login", adminController.login.bind(adminController));

// User Management
router
  .route("/user")
  .get(protectRoute(["admin"]), adminController.getAllUsers.bind(adminController));

router
  .route("/update-user-status/:userId")
  .put(protectRoute(["admin"]), adminController.updateUserStatus.bind(adminController));

// Driver Management
router
  .route("/driver")
  .get(protectRoute(["admin"]), adminController.getAllDrivers.bind(adminController))

  router
  .route("/driver/status/:driverId")
  .put(protectRoute(["admin"]), adminController.changeDriverStatus.bind(adminController));

router
  .route("/driver/blockstatus/:driverId")
  .patch(protectRoute(["admin"]),adminController.handleBlockStatus.bind(adminController));

// Vehicle Management
router
  .route("/vehicles/:userId")
  .get(protectRoute(["admin"]), adminController.getVehiclesByUser.bind(adminController));

  router.get("/bookings", bookingController.getAllBookings.bind(bookingController));
export default router;










