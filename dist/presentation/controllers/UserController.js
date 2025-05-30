"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const tsyringe_1 = require("tsyringe");
const RegisterUser_1 = require("../../application/use_cases/RegisterUser");
const VerifyOTP_1 = require("../../application/use_cases/VerifyOTP");
const ResendOTP_1 = require("../../application/use_cases/ResendOTP");
const Login_1 = require("../../application/use_cases/Login");
const AddVehicle_1 = require("../../application/use_cases/AddVehicle");
const EditVehicle_1 = require("../../application/use_cases/EditVehicle");
const Autherror_1 = require("../../domain/errors/Autherror");
const GetUserData_1 = require("../../application/use_cases/User/GetUserData");
const UpdateUserData_1 = require("../../application/use_cases/User/UpdateUserData");
const GetVehiclesByUser_1 = require("../../application/use_cases/Admin/GetVehiclesByUser");
const FindNearbyDrivers_1 = require("../../application/use_cases/User/FindNearbyDrivers");
const CreatePaymentIntent_1 = require("../../application/use_cases/User/CreatePaymentIntent");
const Getdriverprofile_1 = require("../../application/use_cases/Driver/Getdriverprofile");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const walletTransaction_1 = require("../../application/use_cases/User/walletTransaction");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const SubmitRating_1 = require("../../application/use_cases/User/SubmitRating");
class UserController {
    static async register(req, res) {
        try {
            const registerUser = tsyringe_1.container.resolve(RegisterUser_1.RegisterUser);
            const user = await registerUser.execute(req.body);
            res
                .status(201)
                .json({ success: true, message: "User registered successfully", user });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(500).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
    static async verifyOTPUser(req, res) {
        try {
            const { email, otp } = req.body;
            if (otp.length < 6) {
                throw new Autherror_1.AuthError('please enter complete otp', 400);
            }
            console.log(req.body);
            const verifyOTP = tsyringe_1.container.resolve(VerifyOTP_1.VerifyOTP);
            const result = await verifyOTP.execute(req, res, email, otp, "user");
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(500).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
    static async resendOTP(req, res) {
        try {
            const { email, role } = req.body;
            console.log(email, role);
            const resendOTP = tsyringe_1.container.resolve(ResendOTP_1.ResendOTP);
            const result = await resendOTP.execute(email, role);
            res.status(200).json({ success: true, message: result.message });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : "Something went wrong",
            });
        }
    }
    static async login(req, res) {
        try {
            const login = tsyringe_1.container.resolve(Login_1.Login);
            const { email, password, role } = req.body;
            console.log(req.body);
            const { accessToken, refreshToken } = await login.execute(email, password, role);
            const refreshTokenKey = `${role}RefreshToken`;
            res.cookie(refreshTokenKey, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                accessToken,
                role,
            });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(500).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
    static async addVehicle(req, res) {
        try {
            const vehicleData = req.body;
            const addVehicleUseCase = tsyringe_1.container.resolve(AddVehicle_1.AddVehicle);
            const vehicle = await addVehicleUseCase.execute({
                ...vehicleData,
                userId: req.user?.id,
            });
            res.status(201).json({ success: true, data: vehicle });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
            }
            else {
                res
                    .status(500)
                    .json({ success: false, message: "Internal Server Error" });
            }
        }
    }
    static async editVehicle(req, res) {
        try {
            const { vehicleId } = req.params;
            const updateData = req.body;
            console.log(updateData);
            const editVehicleUseCase = tsyringe_1.container.resolve(EditVehicle_1.EditVehicle);
            const updatedVehicle = await editVehicleUseCase.execute(vehicleId, updateData);
            res.status(200).json({ success: true, data: updatedVehicle });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
            }
            res
                .status(500)
                .json({ success: false, message: "Internal Server Error" });
        }
    }
    static async getAllVehicle(req, res) {
        try {
            const userId = req.user?.id;
            // Check if userId is missing or not a string
            if (!userId || typeof userId !== "string") {
                res
                    .status(400)
                    .json({ success: false, message: "Invalid or missing user ID" });
                return;
            }
            const getVehiclesByUser = tsyringe_1.container.resolve(GetVehiclesByUser_1.GetVehiclesByUser);
            const vehicles = await getVehiclesByUser.execute(userId);
            res.status(200).json({ success: true, data: vehicles });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
            }
            res
                .status(500)
                .json({ success: false, message: "Internal Server Error" });
        }
    }
    static async getUserData(req, res) {
        try {
            const userId = req.user?.id; // Assuming user ID is set in `req.user` by authentication middleware
            if (!userId) {
                res.status(400).json({ success: false, error: "User ID is required" });
                return;
            }
            const getUserData = tsyringe_1.container.resolve(GetUserData_1.GetUserData);
            const user = await getUserData.execute(userId);
            res.status(200).json({ success: true, user });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
    static async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const updateData = req.body;
            if (!userId) {
                res
                    .status(400)
                    .json({ success: false, message: "User ID is required" });
                return;
            }
            const updateUserData = tsyringe_1.container.resolve(UpdateUserData_1.UpdateUserData);
            const updatedUser = await updateUserData.execute(userId, updateData);
            res.status(200).json({ success: true, user: updatedUser });
        }
        catch (error) {
            res
                .status(error.statusCode || 500)
                .json({ success: false, message: error.message });
            return;
        }
    }
    static async fetchDrivers(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(400).json({ message: ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND });
                return;
            }
            // Resolve the use case
            const findNearbyDrivers = tsyringe_1.container.resolve(FindNearbyDrivers_1.FindNearbyDrivers);
            // Execute the use case and fetch drivers
            const drivers = await findNearbyDrivers.execute(userId);
            res.status(200).json({ success: true, drivers });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res
                .status(500)
                .json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async createPaymentIntent(req, res) {
        const { amount, driverId } = req.body;
        console.log(req.body);
        if (!amount || !driverId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        try {
            const createPaymentIntent = tsyringe_1.container.resolve(CreatePaymentIntent_1.CreatePaymentIntent);
            const result = await createPaymentIntent.execute({
                amount,
                driverId,
            });
            res.json({
                clientSecret: result.clientSecret,
                paymentIntentId: result.paymentIntentId,
            });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res
                .status(500)
                .json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async getDriverById(req, res) {
        try {
            const driverId = req.params.id;
            if (!driverId) {
                res
                    .status(400)
                    .json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.DRIVER_ID_NOT_FOUND });
                return;
            }
            const getDriverProfile = tsyringe_1.container.resolve(Getdriverprofile_1.GetDriverProfile);
            const driver = await getDriverProfile.execute(driverId);
            res.status(200).json({ success: true, driver });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
        }
    }
    static async WalletTransaction(req, res) {
        try {
            const { page, limit } = req.query;
            const userId = req.user?.id;
            if (!userId) {
                res.status(HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND });
                return;
            }
            const getWalletTransaction = tsyringe_1.container.resolve(walletTransaction_1.walletTransaction);
            const transactionHistory = await getWalletTransaction.getTransactionHistory(userId, Number(page), Number(limit));
            const ballence = await getWalletTransaction.getWalletBallence(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, transactionHistory, ballence });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
    static async submitReview(req, res) {
        try {
            const { driverId, rideId, rating, review } = req.body;
            const userId = req.user?.id;
            if (!driverId || !rideId || !rating) {
                throw new Autherror_1.AuthError("All fields are required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const useCase = tsyringe_1.container.resolve(SubmitRating_1.SubmitDriverReview);
            const createdReview = await useCase.execute({
                driverId,
                userId,
                rideId,
                rating,
                review,
            });
            res.status(201).json({ message: "Review submitted", review: createdReview });
        }
        catch (error) {
            console.log(error);
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: "Something went wrong" });
            return;
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map