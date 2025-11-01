import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { protectRoute } from "../../middleware/authMiddleware";
import { bookingController } from "../../config/controllerResolve";

const router = Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
// Booking endpoint
router.post("/book/slot",protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),bookingController.bookDriver.bind(bookingController));
router.post("/book/estimate-fare",protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getEstimatedFare.bind(bookingController));
export default router;
