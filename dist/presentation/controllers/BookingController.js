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
const ZodHelper_1 = require("../dto/common/ZodHelper");
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const Booking_1 = require("../../domain/models/Booking");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const BookingRequestDTO_1 = require("../dto/booking/BookingRequestDTO");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const chatGetSignedUrl_1 = require("../../application/use_cases/chatGetSignedUrl");
let BookingController = class BookingController {
    constructor(bookDriverUseCase, getEstimatedFareUseCase, getUserBookingsUseCase, attachPaymentIntentUseCase, updateBookingStatusUseCase, getAllBookingsUseCase, cancelBookingUseCase, getMessagesByBookingIdUseCase, deleteMessageUseCase, generateSignedUrlUseCase, walletBalanceUseCase, walletPaymentUseCase, getDriverReviewsUseCase, getBookingStatusSummary, earningsSummaryUseCase, getDriverDashboardStatsUseCase, getRideHistoryUseCase, generateChatSignedUrlUseCase) {
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
        this.getRideHistoryUseCase = getRideHistoryUseCase;
        this.generateChatSignedUrlUseCase = generateChatSignedUrlUseCase;
    }
    async bookDriver(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            console.log(req.body, 'booking data ');
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.BookDriverSchema, req.body);
            // 2. Execute
            const booking = await this.bookDriverUseCase.execute({
                userId,
                ...validatedData
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.CREATED).json({ success: true, data: booking });
        }
        catch (error) {
            next(error);
        }
    }
    async getEstimatedFare(req, res, next) {
        try {
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.GetEstimatedFareSchema, req.body);
            // 2. Execute
            const fare = await this.getEstimatedFareUseCase.execute(validatedData);
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
            // 1. Query Validation
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UserBookingPaginationSchema, req.query);
            // 2. Execute
            const { data, total, totalPages } = await this.getUserBookingsUseCase.execute(userId, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ data, total, totalPages });
        }
        catch (error) {
            next(error);
        }
    }
    async attachPaymentIntent(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 1. Param & Body Validation
            const { rideId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.RideIdParamSchema, req.params);
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.AttachPaymentIntentSchema, req.body);
            // 2. Execute
            await this.attachPaymentIntentUseCase.execute({
                rideId,
                userId,
                ...validatedData,
                paymentStatus: validatedData.paymentStatus // Cast safely to enum if needed, or let use case handle it
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
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
            // 1. Param & Body Validation
            const { bookingId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.BookingIdParamSchema, req.params);
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UpdateBookingStatusSchema, req.body);
            if (!bookingId) {
                throw new Autherror_1.AuthError("Booking ID is required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute
            await this.updateBookingStatusUseCase.execute({
                bookingId,
                ...validatedData
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Booking status updated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllBookings(req, res, next) {
        try {
            // 1. Query Validation
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UserBookingPaginationSchema, req.query);
            // 2. Execute
            const bookings = await this.getAllBookingsUseCase.execute(page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ bookings });
        }
        catch (error) {
            next(error);
        }
    }
    async cancelBooking(req, res, next) {
        try {
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.CancelBookingSchema, req.body);
            // 2. Execute
            await this.cancelBookingUseCase.execute({
                ...validatedData,
                status: Booking_1.BookingStatus.CANCELLED
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Booking cancelled successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getChatByBookingId(req, res, next) {
        try {
            // 1. Param Validation
            const { roomId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.ChatParamsSchema, req.params);
            if (!roomId) {
                throw new Autherror_1.AuthError("Room ID is required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute
            const chat = await this.getMessagesByBookingIdUseCase.execute({ bookingId: roomId });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ chat });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMessage(req, res, next) {
        try {
            // 1. Param Validation
            const { roomId, messageId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.MessageParamsSchema, req.params);
            // 2. Execute
            await this.deleteMessageUseCase.execute(roomId, messageId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, message: "Message deleted" });
        }
        catch (error) {
            next(error);
        }
    }
    async getRideHistory(req, res, next) {
        try {
            const id = req.user?.id;
            const role = req.user?.role;
            // 1. Query Validation
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.RideHistorySchema, req.query);
            // 2. Execute
            const ridehistory = await this.getRideHistoryUseCase.execute(role, id, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(ridehistory);
        }
        catch (error) {
            next(error);
        }
    }
    async getChatSignature(req, res, next) {
        try {
            const id = req.user?.id;
            // 1. DTO Validation
            const { fileType } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.GetChatSignatureSchema, req.body);
            console.log(fileType, "fileType");
            // 2. Execute
            const chatUploadMedia = await this.generateChatSignedUrlUseCase.execute(fileType, id);
            console.log(chatUploadMedia, "chatUploadMedia");
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(chatUploadMedia);
        }
        catch (error) {
            next(error);
        }
    }
    async WalletBalance(req, res, next) {
        try {
            const userId = req.user?.id;
            const balance = await this.walletBalanceUseCase.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ balance });
        }
        catch (error) {
            next(error);
        }
    }
    async WalletPayment(req, res, next) {
        try {
            const userId = req.user?.id;
            // 1. DTO Validation
            const { rideId, amount } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.WalletPaymentSchema, req.body);
            // 2. Execute
            await this.walletPaymentUseCase.WalletRidePayment(rideId, userId, amount);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Payment successful" });
        }
        catch (error) {
            next(error);
        }
    }
    async ReviewDriver(req, res, next) {
        try {
            // 1. Validation
            const { id: driverId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.DriverReviewParamsSchema, req.params);
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UserBookingPaginationSchema, req.query);
            // 2. Execute
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
            // 1. Query Validation
            const { year, month } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.DriverStatsQuerySchema, req.query);
            // 2. Execute
            const result = await this.getBookingStatusSummary.execute(driverId, year, month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getDriverEarningsByMonth(req, res, next) {
        try {
            const driverId = req.user?.id;
            // 1. Query Validation
            const { year, month } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.DriverStatsQuerySchema, req.query);
            // 2. Execute
            const result = await this.earningsSummaryUseCase.execute(driverId, year || new Date().getFullYear(), month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
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
    __param(16, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GET_RIDE_HISTORY_USECASE)),
    __param(17, (0, tsyringe_1.inject)(UseCaseTokens_1.USECASE_TOKENS.GENERATE_CHAT_SIGNED_URL_USECASE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, chatGetSignedUrl_1.GenerateChatSignedUrl])
], BookingController);
//# sourceMappingURL=BookingController.js.map