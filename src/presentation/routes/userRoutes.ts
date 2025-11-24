import express from "express";

import { protectRoute } from "../../middleware/authMiddleware"; 
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { AuthController } from "../controllers/AuthController";
import { BookingController } from "../controllers/BookingController";
import { bookingController, userController } from "../../config/controllerResolve";

const router= express.Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);

// Authentication Routes
router
  .post("/register", userController.register.bind(userController))
  .post("/verify-otp", userController.verifyOTPUser.bind(userController))
  .post("/resend-otp", userController.resendOTP.bind(userController))
  .post("/login",userController.login.bind(userController));

// Vehicle Routes (Protected)
router
  .route("/vehicle")
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) 
  .post(userController.addVehicle.bind(userController))
  .get(userController.getAllVehicle.bind(userController));

router
  .route("/vehicle/:vehicleId")
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Ensures protection for all requests to this route
  .put(userController.editVehicle.bind(userController))

  router
  .route("/profile")
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
  .get(userController.getUserData.bind(userController))
   

router
  .route("/profile/:id")
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
  .patch(userController.updateUser.bind(userController))
   


router.get("/nearby",protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),userController.fetchDrivers.bind(userController));

router.patch('/auth/change-password',protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),AuthController.ChangePassword)

//Booking Routes
router
  .route("/bookslot")
  .post(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.bookDriver.bind(bookingController)
  )
  .get(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     bookingController.getUserBookings.bind(bookingController)
  );


router
  .route("/estimate-fare")
  .post(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.getEstimatedFare.bind(bookingController)
  );
router
  .route("/update-booking/:rideId")
  .patch(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.attachPaymentIntent.bind(bookingController)
  );
router
  .route("/ridehistory")
  .get(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    BookingController.getRideHistory
  );



router
  .post("/payment-intent", 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    userController.createPaymentIntent.bind(userController)
  )
  .patch("/booking/cancel", 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
     bookingController.cancelBooking.bind(bookingController)
  )
  .get("/chat/:roomId", 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    bookingController.getChatByBookingId.bind(bookingController)
  )
  .delete('/chat/:roomId/message/:messageId',
    protectRoute(['user']),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.deleteMessage.bind(bookingController)
  )
  .post("/chat/signature", 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    bookingController.getChatSignature.bind(bookingController)
  ).get('/driver/:id',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
   userController.getDriverById.bind(userController)
  ).get('/wallet',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     userController.WalletTransaction.bind(userController) 
  ).get('/wallet/ballence',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      bookingController.Walletballence.bind(bookingController)
  ).post('/wallet/ridepayment',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      bookingController.WalletPayment.bind(bookingController) 
  ).post('/review',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    userController.submitReview.bind(userController)
  ).get('/review/:id',
    protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.ReviewDriver.bind(bookingController) )

  
export default router; 