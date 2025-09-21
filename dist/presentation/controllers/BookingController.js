"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const tsyringe_1 = require("tsyringe");
const BookDriver_1 = require("../../application/use_cases/User/BookDriver");
const Autherror_1 = require("../../domain/errors/Autherror");
const GetEstimatedFare_1 = require("../../application/use_cases/User/GetEstimatedFare");
const GetUserbooking_1 = require("../../application/use_cases/User/GetUserbooking");
const AttachPaymentIntentIdToBooking_1 = require("../../application/use_cases/User/AttachPaymentIntentIdToBooking");
const UpdateBookingstatus_1 = require("../../application/use_cases/Driver/UpdateBookingstatus");
const GetAllRides_1 = require("../../application/use_cases/Admin/GetAllRides");
const CancelBooking_1 = require("../../application/use_cases/User/CancelBooking");
const Booking_1 = require("../../domain/models/Booking");
const GetRidechat_1 = require("../../application/use_cases/GetRidechat");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const GetRideHistory_1 = require("../../application/use_cases/GetRideHistory");
const chatGetSignedUrl_1 = require("../../application/use_cases/chatGetSignedUrl");
const WalletBallence_1 = require("../../application/use_cases/User/WalletBallence");
const WalletRidePayment_1 = require("../../application/use_cases/User/WalletRidePayment");
const DriverReview_1 = require("../../application/use_cases/DriverReview");
const deleteMessage_1 = require("../../application/use_cases/deleteMessage");
const GetBookingStatusSummary_1 = require("../../application/use_cases/Driver/GetBookingStatusSummary");
const GetMonthlyEarningsReport_1 = require("../../application/use_cases/Driver/GetMonthlyEarningsReport");
class BookingController {
    static async bookDriver(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res
                    .status(401)
                    .json({ success: false, error: "Unauthorized: User ID is missing." });
                return;
            }
            const { driverId, fromLocation, toLocation, startDate, endDate, estimatedKm, bookingType, } = req.body;
            const bookDriver = tsyringe_1.container.resolve(BookDriver_1.BookDriver);
            const booking = await bookDriver.execute({
                userId,
                driverId,
                fromLocation,
                toLocation,
                startDate,
                endDate,
                estimatedKm,
                bookingType,
            });
            res.status(201).json({ success: true, data: booking });
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
    static async getEstimatedFare(req, res) {
        try {
            const { bookingType, estimatedKm, startDate, endDate } = req.body;
            console.log("ja");
            const useCase = tsyringe_1.container.resolve(GetEstimatedFare_1.GetEstimatedFare);
            const fare = await useCase.execute({
                bookingType,
                estimatedKm,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.status(200).json({ estimatedFare: fare });
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
    static async getUserBookings(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(400).json({ message: "User ID is required" });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const useCase = tsyringe_1.container.resolve(GetUserbooking_1.GetUserBookings);
            const { data, total, totalPages } = await useCase.execute(userId, page, limit);
            res.status(200).json({ data, total, totalPages });
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
    static async attachPaymentIntent(req, res) {
        try {
            const { paymentIntentId, paymentStatus, walletDeduction } = req.body;
            const { rideId } = req.params;
            console.log(req.body, "req.body for attach payment intent");
            const useCase = tsyringe_1.container.resolve(AttachPaymentIntentIdToBooking_1.AttachPaymentIntentIdToBooking);
            await useCase.execute(rideId, walletDeduction, paymentIntentId, paymentStatus);
            res
                .status(200)
                .json({
                success: true,
                message: "PaymentIntent attached successfully",
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
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { bookingId } = req.params;
            const { status, reason, finalKm } = req.body;
            console.log(req.body);
            if (!status) {
                res
                    .status(400)
                    .json({ message: "status required for updating status" });
                return;
            }
            if (status === "REJECTED" && !reason) {
                res
                    .status(400)
                    .json({ message: "Reason is required when rejecting a booking." });
                return;
            }
            if ((status === "COMPLETED" && finalKm === undefined) ||
                finalKm === null) {
                res
                    .status(400)
                    .json({ message: "finalKm is required when completing a booking." });
                return;
            }
            const useCase = tsyringe_1.container.resolve(UpdateBookingstatus_1.UpdateBookingStatus);
            await useCase.execute({ bookingId, status, reason, finalKm });
            res.status(200).json({ message: "Booking status updated successfully" });
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
    static async getAllBookings(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const useCase = tsyringe_1.container.resolve(GetAllRides_1.GetAllBookings);
            const bookings = await useCase.execute(page, limit);
            res.status(200).json({ bookings });
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
    static async cancelBooking(req, res) {
        try {
            const { bookingId, reason } = req.body;
            if (!bookingId || !reason) {
                res.status(400).json({ message: "bookingId and reason are required" });
                return;
            }
            const updateBookingStatus = tsyringe_1.container.resolve(CancelBooking_1.CancelBookingInputUseCase);
            await updateBookingStatus.execute({
                bookingId,
                reason,
                status: Booking_1.BookingStatus.CANCELLED,
            });
            res.status(200).json({ message: "Booking cancelled successfully" });
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
    static async getChatByBookingId(req, res) {
        try {
            const { roomId } = req.params;
            if (!roomId) {
                res.status(400).json({ message: "Booking ID is required" });
                return;
            }
            const getChatByBookingId = tsyringe_1.container.resolve(GetRidechat_1.GetMessagesByBookingId);
            const chat = await getChatByBookingId.execute({ bookingId: roomId });
            if (!chat) {
                res.status(404).json({ message: "Chat not found" });
                return;
            }
            res.status(200).json(chat);
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
    static async deleteMessage(req, res) {
        try {
            const { roomId, messageId } = req.params;
            const deleteMessageUseCase = tsyringe_1.container.resolve(deleteMessage_1.DeleteMessageUseCase);
            await deleteMessageUseCase.execute(roomId, messageId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: 'Message deleted successfully' });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async getRideHistory(req, res) {
        try {
            const id = req.user?.id;
            const role = req.user?.role;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const BookingHistory = tsyringe_1.container.resolve(GetRideHistory_1.GetRideHistory);
            const ridehistory = await BookingHistory.execute(role, id, page, limit);
            res.status(200).json(ridehistory);
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(500).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async getChatSignature(req, res) {
        try {
            const id = req.user?.id;
            const { fileType } = req.body;
            console.log(req.body);
            const chatMediaSignature = tsyringe_1.container.resolve(chatGetSignedUrl_1.GenerateChatSignedUrl);
            const chatUploadMedia = await chatMediaSignature.execute(fileType, id);
            console.log(chatUploadMedia, 'media signurl reach');
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(chatUploadMedia);
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(500).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async Walletballence(req, res) {
        try {
            const userId = req.user?.id;
            const walletBallence = tsyringe_1.container.resolve(WalletBallence_1.WalletBallence);
            const ballence = await walletBallence.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ ballence });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(500).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async WalletPayment(req, res) {
        try {
            const userId = req.user?.id;
            const { rideId, amount } = req.body;
            const walletPay = tsyringe_1.container.resolve(WalletRidePayment_1.WalletPayment);
            await walletPay.WalletRidePayment(rideId, userId, amount);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "payment successfull" });
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(500).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async ReviewDriver(req, res) {
        try {
            const driverId = req.params.id;
            console.log(driverId, "driver id");
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const ReviewDriver = tsyringe_1.container.resolve(DriverReview_1.GetDriverReviews);
            const reviews = await ReviewDriver.execute(driverId, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(reviews);
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching user data:", error);
            res.status(500).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    static async getDriverBookingStatusSummary(req, res) {
        try {
            const driverId = req.user?.id;
            const year = req.query.year ? parseInt(req.query.year) : undefined;
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const useCase = tsyringe_1.container.resolve(GetBookingStatusSummary_1.GetBookingStatusSummary);
            const result = await useCase.execute(driverId, year, month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching getDriverBookingStatusSummary", error);
            res.status(500).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    ;
    static async getDriverEarningsByMonth(req, res) {
        try {
            const driverId = req.user?.id;
            const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const useCase = tsyringe_1.container.resolve(GetMonthlyEarningsReport_1.GetDriverEarningsSummary);
            const result = await useCase.execute(driverId, year, month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
                res
                    .status(error.statusCode)
                    .json({ success: false, error: error.message });
                return;
            }
            console.error("Error fetching getDriverEarningsByMonth ", error);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error: ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
        }
    }
    ;
}
exports.BookingController = BookingController;
//# sourceMappingURL=BookingController.js.map