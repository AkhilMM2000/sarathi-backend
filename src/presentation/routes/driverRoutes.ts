import express from "express";
import { DriverController } from "../controllers/DriverControler";
import { protectRoute } from "../../middleware/authMiddleware";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { AuthController } from "../controllers/AuthController";
import { BookingController } from "../controllers/BookingController";
import { bookingController, driverController } from "../../config/controllerResolve";
const router = express.Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
router
  .post("/register", driverController.registerDriver.bind(driverController))
  .post("/verify-otp", driverController.verifyOTPDriver.bind(driverController))
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
     BookingController.getRideHistory
    ).patch('/auth/change-password',
      protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      AuthController.ChangePassword)

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

export default router;
