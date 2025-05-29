import express from "express";
import { DriverController } from "../controllers/DriverControler";
import { protectRoute } from "../../middleware/authMiddleware";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { AuthController } from "../controllers/AuthController";
import { BookingController } from "../controllers/BookingController";
const router = express.Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
router
  .post("/register", DriverController.registerDriver)
  .post("/verify-otp", DriverController.verifyOTPDriver)
  .post("/login", DriverController.login);

  router
  .route("/driver")
  .all(protectRoute(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
  .get(DriverController.getDriverProfile);

router
  .route("/driver/:id")
  .all(protectRoute(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
  .put(DriverController.editDriverProfile)
 
  router
    .get("/ridehistory", 
      protectRoute(["driver"]), 
      checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
     BookingController.getRideHistory
    ).patch('/auth/change-password',
      protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      AuthController.ChangePassword)

      .post('onboard',
        protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        DriverController.onboardDriver
      )
       .get('/bookings',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       
        DriverController.getBookingsForDriver)
       .patch('/booking-status/:bookingId',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        BookingController.updateStatus)

        .post('verify-account',
          protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
          DriverController.verifyAccount
        ).get('/chat/:roomId',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        BookingController.getChatByBookingId
        ).delete('/chat/:roomId/message/:messageId',
        protectRoute(['driver']),
         checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        BookingController.deleteMessage
         ).
        post('/chat/signature',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        BookingController.getChatSignature
        ).get('/user/:id',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        DriverController.getUserById
        ).get('/review/:id',protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        BookingController.ReviewDriver
        )
 
 

export default router;
