import express from "express";
import { AdminController } from "../controllers/AdminController";
import { protectRoute } from "../../middleware/authMiddleware";
import { BookingController } from "../controllers/BookingController";
import { bookingController } from "../../config/controllerResolve";

const router = express.Router();


router.post("/login", AdminController.login);

// User Management
router
  .route("/user")
  .get(protectRoute(["admin"]), AdminController.getAllUsers);

router
  .route("/update-user-status/:userId")
  .put(protectRoute(["admin"]), AdminController.updateUserStatus);

// Driver Management
router
  .route("/driver")
  .get(protectRoute(["admin"]), AdminController.getAllDrivers)

  router
  .route("/driver/status/:driverId")
  .put(protectRoute(["admin"]), AdminController.changeDriverStatus);

router
  .route("/driver/blockstatus/:driverId")
  .patch(protectRoute(["admin"]), AdminController.handleBlockStatus);

// Vehicle Management
router
  .route("/vehicles/:userId")
  .get(protectRoute(["admin"]), AdminController.getVehiclesByUser);

  router.get("/bookings", bookingController.getAllBookings);
export default router;










