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
const ZodHelper_1 = require("../schemas/common/ZodHelper");
const catchAsync_1 = require("../../infrastructure/utils/catchAsync");
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const Booking_1 = require("../../domain/models/Booking");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const BookingRequestDTO_1 = require("../schemas/booking/BookingRequestDTO");
const UseCaseTokens_1 = require("../../constants/UseCaseTokens");
const chatGetSignedUrl_1 = require("../../application/use_cases/chatGetSignedUrl");
let BookingController = class BookingController {
    constructor(_bookDriverUseCase, _getEstimatedFareUseCase, _getUserBookingsUseCase, _attachPaymentIntentUseCase, _updateBookingStatusUseCase, _getAllBookingsUseCase, _cancelBookingUseCase, _getMessagesByBookingIdUseCase, _deleteMessageUseCase, _generateSignedUrlUseCase, _walletBalanceUseCase, _walletPaymentUseCase, _getDriverReviewsUseCase, _getBookingStatusSummary, _earningsSummaryUseCase, _getDriverDashboardStatsUseCase, _getRideHistoryUseCase, _generateChatSignedUrlUseCase) {
        this._bookDriverUseCase = _bookDriverUseCase;
        this._getEstimatedFareUseCase = _getEstimatedFareUseCase;
        this._getUserBookingsUseCase = _getUserBookingsUseCase;
        this._attachPaymentIntentUseCase = _attachPaymentIntentUseCase;
        this._updateBookingStatusUseCase = _updateBookingStatusUseCase;
        this._getAllBookingsUseCase = _getAllBookingsUseCase;
        this._cancelBookingUseCase = _cancelBookingUseCase;
        this._getMessagesByBookingIdUseCase = _getMessagesByBookingIdUseCase;
        this._deleteMessageUseCase = _deleteMessageUseCase;
        this._generateSignedUrlUseCase = _generateSignedUrlUseCase;
        this._walletBalanceUseCase = _walletBalanceUseCase;
        this._walletPaymentUseCase = _walletPaymentUseCase;
        this._getDriverReviewsUseCase = _getDriverReviewsUseCase;
        this._getBookingStatusSummary = _getBookingStatusSummary;
        this._earningsSummaryUseCase = _earningsSummaryUseCase;
        this._getDriverDashboardStatsUseCase = _getDriverDashboardStatsUseCase;
        this._getRideHistoryUseCase = _getRideHistoryUseCase;
        this._generateChatSignedUrlUseCase = _generateChatSignedUrlUseCase;
        this.bookDriver = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            }
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.BookDriverSchema, req.body);
            // 2. Execute
            const booking = await this._bookDriverUseCase.execute({
                userId,
                ...validatedData
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.CREATED).json({ success: true, data: booking });
        });
        this.getEstimatedFare = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.GetEstimatedFareSchema, req.body);
            // 2. Execute
            const fare = await this._getEstimatedFareUseCase.execute(validatedData);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ estimatedFare: fare });
        });
        this.getUserBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 1. Query Validation
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UserBookingPaginationSchema, req.query);
            // 2. Execute
            const { data, total, totalPages } = await this._getUserBookingsUseCase.execute(userId, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ data, total, totalPages });
        });
        this.attachPaymentIntent = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 1. Param & Body Validation
            const { rideId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.RideIdParamSchema, req.params);
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.AttachPaymentIntentSchema, req.body);
            // 2. Execute
            await this._attachPaymentIntentUseCase.execute({
                rideId,
                userId,
                ...validatedData,
                paymentStatus: validatedData.paymentStatus
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({
                success: true,
                message: "PaymentIntent attached successfully",
            });
        });
        this.updateStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // 1. Param & Body Validation
            const { bookingId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.BookingIdParamSchema, req.params);
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UpdateBookingStatusSchema, req.body);
            if (!bookingId) {
                throw new Autherror_1.AuthError("Booking ID is required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute
            await this._updateBookingStatusUseCase.execute({
                bookingId,
                ...validatedData
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Booking status updated successfully" });
        });
        this.getAllBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // 1. Query Validation
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UserBookingPaginationSchema, req.query);
            // 2. Execute
            const bookings = await this._getAllBookingsUseCase.execute(page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ bookings });
        });
        this.cancelBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // 1. DTO Validation
            const validatedData = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.CancelBookingSchema, req.body);
            // 2. Execute
            await this._cancelBookingUseCase.execute({
                ...validatedData,
                status: Booking_1.BookingStatus.CANCELLED
            });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Booking cancelled successfully" });
        });
        this.getChatByBookingId = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // 1. Param Validation
            const { roomId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.ChatParamsSchema, req.params);
            if (!roomId) {
                throw new Autherror_1.AuthError("Room ID is required", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            // 2. Execute
            const chat = await this._getMessagesByBookingIdUseCase.execute({ bookingId: roomId });
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ chat });
        });
        this.deleteMessage = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // 1. Param Validation
            const { roomId, messageId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.MessageParamsSchema, req.params);
            // 2. Execute
            await this._deleteMessageUseCase.execute(roomId, messageId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ success: true, message: "Message deleted" });
        });
        this.getRideHistory = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const id = req.user?.id;
            const role = req.user?.role;
            // 1. Query Validation
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.RideHistorySchema, req.query);
            // 2. Execute
            const ridehistory = await this._getRideHistoryUseCase.execute(role, id, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(ridehistory);
        });
        this.getChatSignature = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const id = req.user?.id;
            // 1. DTO Validation
            const { fileType } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.GetChatSignatureSchema, req.body);
            // 2. Execute
            const chatUploadMedia = await this._generateChatSignedUrlUseCase.execute(fileType, id);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(chatUploadMedia);
        });
        this.WalletBalance = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const userId = req.user?.id;
            const balance = await this._walletBalanceUseCase.execute(userId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ balance });
        });
        this.WalletPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const userId = req.user?.id;
            // 1. DTO Validation
            const { rideId, amount } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.WalletPaymentSchema, req.body);
            // 2. Execute
            await this._walletPaymentUseCase.WalletRidePayment(rideId, userId, amount);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json({ message: "Payment successful" });
        });
        this.ReviewDriver = (0, catchAsync_1.catchAsync)(async (req, res) => {
            // 1. Validation
            const { id: driverId } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.DriverReviewParamsSchema, req.params);
            const { page, limit } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.UserBookingPaginationSchema, req.query);
            // 2. Execute
            const reviews = await this._getDriverReviewsUseCase.execute(driverId, page, limit);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(reviews);
        });
        this.getDriverBookingStatusSummary = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const driverId = req.user?.id;
            // 1. Query Validation
            const { year, month } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.DriverStatsQuerySchema, req.query);
            // 2. Execute
            const result = await this._getBookingStatusSummary.execute(driverId, year, month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        });
        this.getDriverEarningsByMonth = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const driverId = req.user?.id;
            // 1. Query Validation
            const { year, month } = ZodHelper_1.ZodHelper.validate(BookingRequestDTO_1.DriverStatsQuerySchema, req.query);
            // 2. Execute
            const result = await this._earningsSummaryUseCase.execute(driverId, year || new Date().getFullYear(), month);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        });
        this.getDriverDashboard = (0, catchAsync_1.catchAsync)(async (req, res) => {
            const driverId = req.user?.id;
            if (!driverId)
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.UNAUTHORIZED);
            const result = await this._getDriverDashboardStatsUseCase.execute(driverId);
            res.status(HttpStatusCode_1.HTTP_STATUS_CODES.OK).json(result);
        });
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