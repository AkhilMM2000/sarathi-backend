import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { protectRoute } from "../../middleware/authMiddleware";

const router = Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
// Booking endpoint
router.post("/book/slot",protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),BookingController.bookDriver);
router.post("/book/estimate-fare",protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), BookingController.getEstimatedFare);
export default router;
