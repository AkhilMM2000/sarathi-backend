
export const TOKENS = {
   EMAIL_SERVICE:Symbol.for("EmailService"),
  WALLET_SERVICE:Symbol.for("WalletService"),
  GOOGLE_DISTANCE_SERVICE:Symbol.for("GoogleDistanceService"),
   HASH_SERVICE:Symbol.for("HashService"),
  REFERAL_CODE_SERVICE:Symbol.for("ReferralCodeService"),
  USER_REGISTERSTORE:Symbol.for("UserRegistrationStore"),
 
  IUSER_REPO:Symbol.for("IUserRepository"),
  VEHICLE_REPO:Symbol.for("IVehicleRepository"),
  IDRIVER_REPO:Symbol.for("IDriverRepository"),
  REGISTER_USER_USECASE:Symbol.for("RegisterUseCase"),
  GET_USER_DATA_USECASE:Symbol.for('GET_USER_DATA_USECASE'),
  VERIFY_OTP_USECAE:Symbol.for("VERIFY_OTP"),
  RESEND_OTP_USECASE:Symbol.for('RESEND_OTP_USECASE'),
  ADD_VEHICLE_USECASE:Symbol.for('ADD_VEHICLE_USECASE'),
  LOGIN_USECASE:Symbol.for('LOGIN_USECASE'),
  EDIT_VEHICLE_USECASE:Symbol.for('EDIT_VEHICLE_USECASE'),
  GET_VEHICLES_BY_USER_USECASE:Symbol.for('GET_VEHICLES_BY_USER_USECASE'),
    UPDATE_USER_USECASE: Symbol.for("UPDATE_USER_USECASE"),
}