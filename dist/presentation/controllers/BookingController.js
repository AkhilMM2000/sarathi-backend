"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const Booking_1 = require("../../domain/models/Booking");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const GetRideHistory_1 = require("../../application/use_cases/GetRideHistory");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
let BookingController = class BookingController {
    constructor(bookDriverUseCase, getEstimatedFareUseCase, getUserBookingsUseCase, attachPaymentIntentUseCase, updateBookingStatusUseCase, getAllBookingsUseCase, cancelBookingUseCase, getMessagesByBookingIdUseCase, deleteMessageUseCase, generateSignedUrlUseCase, walletBalanceUseCase, walletPaymentUseCase, getDriverReviewsUseCase, getBookingStatusSummary, earningsSummaryUseCase, getDriverDashboardStatsUseCase) {
        this.bookDriverUseCase = bookDriverUseCase;
        this.getEstimatedFareUseCase = getEstimatedFareUseCase;
        this.getUserBookingsUseCase = getUserBookingsUseCase;
        this.attachPaymentIntentUseCase = attachPaymentIntentUseCase;
        this.updateBookingStatusUseCase = updateBookingStatusUseCase;
        this.getAllBookingsUseCase = getAllBookingsUseCase;
        this.cancelBookingUseCase = cancelBookingUseCase;
        this.getMessagesByBookingIdUseCase = getMessagesByBookingIdUseCase;
        this.deleteMessageUseCase = deleteMessageUseCase;
        this.generateSignedUrlUseCase = generateSignedUrlUseCase;
        this.walletBalanceUseCase = walletBalanceUseCase;
        this.walletPaymentUseCase = walletPaymentUseCase;
        this.getDriverReviewsUseCase = getDriverReviewsUseCase;
        this.getBookingStatusSummary = getBookingStatusSummary;
        this.earningsSummaryUseCase = earningsSummaryUseCase;
        this.getDriverDashboardStatsUseCase = getDriverDashboardStatsUseCase;
    }
    async bookDriver(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            const { driverId, fromLocation, toLocation, startDate, endDate, estimatedKm, bookingType, } = req.body;
            const booking = await this.bookDriverUseCase.execute({
                userId,
                driverId,
                fromLocation,
                toLocation,
                startDate,
                endDate,
                estimatedKm,
                bookingType,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.CREATED).json({ success: true, data: booking });
        }
        catch (error) {
            next(error);
        }
    }
    async getEstimatedFare(req, res, next) {
        try {
            const { bookingType, estimatedKm, startDate, endDate } = req.body;
            const fare = await this.getEstimatedFareUseCase.execute({
                bookingType,
                estimatedKm,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ estimatedFare: fare });
        }
        catch (error) {
            next(error);
        }
    }
    async getUserBookings(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            ;
            const { data, total, totalPages } = await this.getUserBookingsUseCase.execute(userId, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ data, total, totalPages });
        }
        catch (error) {
            next(error);
        }
    }
    async attachPaymentIntent(req, res, next) {
        try {
            const { paymentIntentId, paymentStatus, walletDeduction } = req.body;
            const { rideId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            await this.attachPaymentIntentUseCase.execute(rideId, walletDeduction, paymentIntentId, paymentStatus, userId);
            res
                .status(HttpStatusCode_1.HTTP_STATUS_CODES.OK)
                .json({
                success: true,
                message: "PaymentIntent attached successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const { bookingId } = req.params;
            const { status, reason, finalKm } = req.body;
            console.log(req.body);
            if (!status) {
                throw new Autherror_1.AuthError("status required for updating status", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            if (status === "REJECTED" && !reason) {
                throw new Autherror_1.AuthError("Reason is required when rejecting a booking.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            if ((status === "COMPLETED" && finalKm === undefined) ||
                finalKm === null) {
                throw new Autherror_1.AuthError("finalKm is required when completing a booking.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            await this.updateBookingStatusUseCase.execute({ bookingId, status, reason, finalKm });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Booking status updated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllBookings(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const bookings = await this.getAllBookingsUseCase.execute(page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ bookings });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelBooking(req, res, next) {
        try {
            const { bookingId, reason } = req.body;
            if (!bookingId || !reason) {
                res.status(400).json({ message: "bookingId and reason are required" });
                return;
            }
            await this.cancelBookingUseCase.execute({
                bookingId,
                reason,
                status: Booking_1.BookingStatus.CANCELLED,
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Booking cancelled successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getChatByBookingId(req, res, next) {
        try {
            const { roomId } = req.params;
            if (!roomId) {
                throw new Autherror_1.AuthError("Booking ID is required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const chat = await this.getMessagesByBookingIdUseCase.execute({ bookingId: roomId });
            if (!chat) {
                throw new Autherror_1.AuthError("Chat not found", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
            }
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(chat);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMessage(req, res, next) {
        try {
            const { roomId, messageId } = req.params;
            await this.deleteMessageUseCase.execute(roomId, messageId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: 'Message deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRideHistory(req, res, next) {
        try {
            const id = req.user?.id;
            const role = req.user?.role;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const BookingHistory = tsyringe_1.container.resolve(GetRideHistory_1.GetRideHistory);
            const ridehistory = await BookingHistory.execute(role, id, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(ridehistory);
        }
        catch (error) {
            next(error);
        }
    }
    async getChatSignature(req, res, next) {
        try {
            const id = req.user?.id;
            const { fileType } = req.body;
            const chatUploadMedia = await this.generateSignedUrlUseCase.execute(fileType, id);
            console.log(chatUploadMedia, 'media signurl reach');
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(chatUploadMedia);
        }
        catch (error) {
            next(error);
        }
    }
    async Walletballence(req, res, next) {
        try {
            const userId = req.user?.id;
            const ballence = await this.walletBalanceUseCase.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ ballence });
        }
        catch (error) {
            next(error);
        }
    }
    async WalletPayment(req, res, next) {
        try {
            const userId = req.user?.id;
            const { rideId, amount } = req.body;
            await this.walletPaymentUseCase.WalletRidePayment(rideId, userId, amount);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "payment successfull" });
        }
        catch (error) {
            next(error);
        }
    }
    async ReviewDriver(req, res, next) {
        try {
            const driverId = req.params.id;
            console.log(driverId, "driver id");
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const reviews = await this.getDriverReviewsUseCase.execute(driverId, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(reviews);
        }
        catch (error) {
            next(error);
        }
    }
    async getDriverBookingStatusSummary(req, res, next) {
        try {
            const driverId = req.user?.id;
            const year = req.query.year ? parseInt(req.query.year) : undefined;
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const result = await this.getBookingStatusSummary.execute(driverId, year, month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    ;
    async getDriverEarningsByMonth(req, res, next) {
        try {
            const driverId = req.user?.id;
            const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
            const month = req.query.month ? parseInt(req.query.month) : undefined;
            const result = await this.earningsSummaryUseCase.execute(driverId, year, month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    ;
    async getDriverDashboard(req, res, next) {
        try {
            const driverId = req.user?.id;
            if (!driverId)
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            const result = await this.getDriverDashboardStatsUseCase.execute(driverId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.BookingController = BookingController;
exports.BookingController = BookingController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.BOOK_DRIVER_USECASE)),
    __param(1, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_ESTIMATED_FARE_USECASE)),
    __param(2, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.IGET_USER_BOOKINGS_USECASE)),
    __param(3, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.ATTACH_PAYMENT_INTENT_USECASE)),
    __param(4, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.UPDATE_BOOKING_STATUS_USECASE)),
    __param(5, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_ALL_BOOKINGS_USECASE)),
    __param(6, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.CANCEL_BOOKING_USECASE)),
    __param(7, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_MESSAGES_BY_BOOKING_USECASE)),
    __param(8, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.DELETE_MESSAGE_USECASE)),
    __param(9, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GENERATE_SIGNED_URL_USECASE)),
    __param(10, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.WALLET_BALANCE_USECASE)),
    __param(11, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.WALLET_PAYMENT_USECASE)),
    __param(12, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_DRIVER_REVIEWS_USECASE)),
    __param(13, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_BOOKING_STATUS_SUMMARY_USECASE)),
    __param(14, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_DRIVER_EARNINGS_SUMMARY_USECASE)),
    __param(15, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_DRIVER_DASHBOARD_STATS_USECASE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], BookingController);
//# sourceMappingURL=BookingController.js.map