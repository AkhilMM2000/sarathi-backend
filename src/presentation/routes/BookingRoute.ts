import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { protectRoute } from "../../middleware/authMiddleware";
import { TOKENS } from "../../constants/Tokens";


const router = Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
export const bookingController=container.resolve<BookingController>(TOKENS.BOOKING_CONTROLLER);
// Booking endpoint
router.post("/book/slot",protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),bookingController.bookDriver.bind(bookingController));
router.post("/book/estimate-fare",protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getEstimatedFare.bind(bookingController));
export default router;
