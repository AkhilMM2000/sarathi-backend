import express from "express";
import { DriverController } from "../controllers/DriverControler";
import { protectRoute } from "../../middleware/authMiddleware";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { AuthController } from "../controllers/AuthController";
import { BookingController } from "../controllers/BookingController";

import { TOKENS } from "../../constants/Tokens";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { authController } from "./AuthRoute";
const router = express.Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
export const bookingController=container.resolve<BookingController>(TOKENS.BOOKING_CONTROLLER);
const driverController=container.resolve<DriverController>(USECASE_TOKENS.DRIVER_CONTROLLER);
router
  .post("/register", driverController.registerDriver.bind(driverController))
  .post("/verify-otp", driverController.verifyOTPDriver.bind(driverController))
  .post("/resend-otp", driverController.resendOTP.bind(driverController))
  .post("/login", driverController.login.bind(driverController));

  router
  .route("/driver")
  .all(protectRoute(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
  .get(driverController.getDriverProfile.bind(driverController));

router
  .route("/driver/:id")
  .all(protectRoute(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
  .put(driverController.editDriverProfile.bind(driverController))
 

  router
    .get("/ridehistory", 
      protectRoute(["driver"]), 
      checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
     bookingController.getRideHistory.bind(bookingController)
    ).patch('/auth/change-password',
      protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      authController.ChangePassword.bind(authController))

      .post('/onboard',
        protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        driverController.onboardDriver.bind(driverController)
      )
       .get('/bookings',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       
        driverController.getBookingsForDriver.bind(driverController))
       .patch('/booking-status/:bookingId',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        bookingController.updateStatus.bind(bookingController))

        .post('/verify-account',
          protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
          driverController.verifyAccount.bind(driverController)
        ).get('/chat/:roomId',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        bookingController.getChatByBookingId.bind(bookingController)
        ).delete('/chat/:roomId/message/:messageId',
        protectRoute(['driver']),
         checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       bookingController.deleteMessage.bind(bookingController)
         ).
        post('/chat/signature',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
         bookingController.getChatSignature.bind(bookingController)
        ).get('/user/:id',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       driverController.getUserById.bind(driverController)
        ).get('/review/:id',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       bookingController.ReviewDriver.bind(bookingController)
        )
 
.get('/dashboard/status-summary',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getDriverBookingStatusSummary.bind(bookingController));
router.get('/dashboard/earnings-summary',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getDriverEarningsByMonth.bind(bookingController));
router.get('/dashboard',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getDriverDashboard.bind(bookingController));

export default router;
