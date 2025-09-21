import express from "express";

import { protectRoute } from "../../middleware/authMiddleware"; 
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { AuthController } from "../controllers/AuthController";
import { BookingController } from "../controllers/BookingController";
import { userController } from "../../config/controllerResolve";

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
  .post(UserController.addVehicle)
  .get(UserController.getAllVehicle);

router
  .route("/vehicle/:vehicleId")
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Ensures protection for all requests to this route
  .put(UserController.editVehicle)

  router
  .route("/profile")
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
  .get(userController.getUserData.bind(userController))
   

router
  .route("/profile/:id")
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
  .patch(UserController.updateUser)
   


router.get("/nearby",protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),UserController.fetchDrivers);

router.patch('/auth/change-password',protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),AuthController.ChangePassword)

//Booking Routes
router
  .route("/bookslot")
  .post(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    BookingController.bookDriver
  )
  .get(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    BookingController.getUserBookings
  );


router
  .route("/estimate-fare")
  .post(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    BookingController.getEstimatedFare
  );
router
  .route("/update-booking/:rideId")
  .patch(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    BookingController.attachPaymentIntent
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
    UserController.createPaymentIntent
  )
  .patch("/booking/cancel", 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    BookingController.cancelBooking
  )
  .get("/chat/:roomId", 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    BookingController.getChatByBookingId
  )
  .delete('/chat/:roomId/message/:messageId',
    protectRoute(['user']),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    BookingController.deleteMessage
  )
  .post("/chat/signature", 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    BookingController.getChatSignature
  ).get('/driver/:id',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     UserController.getDriverById 
  ).get('/wallet',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     UserController.WalletTransaction 
  ).get('/wallet/ballence',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     BookingController.Walletballence 
  ).post('/wallet/ridepayment',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     BookingController.WalletPayment 
  ).post('/review',
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     UserController.submitReview
  ).get('/review/:id',
    protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      BookingController.ReviewDriver )

  
export default router; 