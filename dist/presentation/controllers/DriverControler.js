"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverController = void 0;
const tsyringe_1 = require("tsyringe");
const VerifyOTP_1 = require("../../application/use_cases/VerifyOTP");
const Login_1 = require("../../application/use_cases/Login");
const RegisterDriver_1 = require("../../application/use_cases/RegisterDriver");
const Autherror_1 = require("../../domain/errors/Autherror");
const Getdriverprofile_1 = require("../../application/use_cases/Driver/Getdriverprofile");
const EditDriverProfile_1 = require("../../application/use_cases/Driver/EditDriverProfile");
const DriverOnboarding_1 = require("../../application/use_cases/Driver/DriverOnboarding");
const Getdriverbooking_1 = require("../../application/use_cases/Driver/Getdriverbooking");
const VerifyAccountStatus_1 = require("../../application/use_cases/Driver/VerifyAccountStatus");
const GetUserData_1 = require("../../application/use_cases/User/GetUserData");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
class DriverController {
    static async registerDriver(req, res) {
        try {
            const DriverRegister = tsyringe_1.container.resolve(RegisterDriver_1.RegisterDriver);
            const response = await DriverRegister.execute(req.body);
            res.status(201).json({ success: true, ...response });
        }
        catch (error) {
            res
                .status(400)
                .json({
                success: false,
                error: error instanceof Error ? error.message : "Registration failed",
            });
        }
    }
    static async verifyOTPDriver(req, res) {
        try {
            const { email, otp } = req.body;
            console.log(req.body);
            const verifyOTP = tsyringe_1.container.resolve(VerifyOTP_1.VerifyOTP);
            const result = await verifyOTP.execute(req, res, email, otp, "driver");
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            res
                .status(400)
                .json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password, role } = req.body;
            console.log(req.body);
            const loginUseCase = tsyringe_1.container.resolve(Login_1.Login);
            const { accessToken, refreshToken } = await loginUseCase.execute(email, password, role);
            // Set refresh token cookie
            const refreshTokenKey = `${role}RefreshToken`;
            res.cookie(refreshTokenKey, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({ accessToken, role });
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
        }
    }
    static async getDriverProfile(req, res) {
        try {
            const driverId = req.user?.id;
            if (!driverId) {
                res.status(400).json({ success: false, error: "Driver ID is required" });
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
    static async getUserById(req, res) {
        try {
            const userId = req.params.id;
            console.log(' useridfor chat', userId);
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
                res.status(error.statusCode).json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
    static async editDriverProfile(req, res) {
        try {
            const driverId = req.params.id;
            const updateData = req.body;
            const editDriverProfileUseCase = tsyringe_1.container.resolve(EditDriverProfile_1.EditDriverProfile);
            const updatedDriver = await editDriverProfileUseCase.execute(driverId, updateData);
            res.status(200).json({ success: true, driver: updatedDriver });
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
    static async onboardDriver(req, res) {
        try {
            let { email, driverId } = req.body;
            console.log('onboard driver', req.body);
            if (!driverId) {
                driverId = req.user?.id;
            }
            if (!email || !driverId) {
                res.status(400).json({ message: 'Email and driverId are required' });
                return;
            }
            const onboardDriverUseCase = tsyringe_1.container.resolve(DriverOnboarding_1.OnboardDriverUseCase);
            const onboardingUrl = await onboardDriverUseCase.execute(email, driverId);
            res.status(200).json({ url: onboardingUrl });
        }
        catch (error) {
            console.error('Stripe onboarding error:', error);
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
        }
    }
    static async getBookingsForDriver(req, res) {
        const driverId = req.user?.id;
        if (!driverId) {
            res.status(400).json({ message: ErrorMessages_1.ERROR_MESSAGES.DRIVER_ID_NOT_FOUND });
            return;
        }
        const { page = 1, limit = 2 } = req.query;
        try {
            const getUserBookings = tsyringe_1.container.resolve(Getdriverbooking_1.GetUserBookings);
            const paginatedBookings = await getUserBookings.execute(driverId, Number(page), Number(limit));
            res.status(200).json({
                data: paginatedBookings.data,
                total: paginatedBookings.total,
                totalPages: paginatedBookings.totalPages,
                currentPage: paginatedBookings.page,
            });
        }
        catch (error) {
            console.error('Stripe onboarding error:', error);
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
        }
    }
    static async verifyAccount(req, res) {
        try {
            const { driverId } = req.body;
            const useCase = tsyringe_1.container.resolve(VerifyAccountStatus_1.VerifyDriverPaymentAccount);
            await useCase.execute(driverId);
            res.json({ success: true, message: 'Payment activated for driver' });
        }
        catch (error) {
            console.error('Stripe onboarding error:', error);
            if (error instanceof Autherror_1.AuthError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
        }
    }
}
exports.DriverController = DriverController;
//# sourceMappingURL=DriverControler.js.map