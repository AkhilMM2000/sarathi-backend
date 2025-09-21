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
exports.SubmitDriverReview = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const Tokens_1 = require("../../../constants/Tokens");
let SubmitDriverReview = class SubmitDriverReview {
    constructor(reviewRepo, driverRepo) {
        this.reviewRepo = reviewRepo;
        this.driverRepo = driverRepo;
    }
    async execute(input) {
        const { driverId, userId, rideId, rating, review } = input;
        const alreadyReviewed = await this.reviewRepo.hasUserAlreadyReviewed(driverId, userId);
        if (alreadyReviewed) {
            throw new Autherror_1.AuthError("You have already reviewed this driver.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        const newReview = await this.reviewRepo.createReview({
            driverId,
            userId,
            rideId,
            rating,
            review,
        });
        // Fetch current rating stats
        const driver = await this.driverRepo.findDriverById(driverId);
        if (!driver)
            throw new Autherror_1.AuthError("Driver not found", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        const updatedTotalPoints = (driver.totalRatingPoints || 0) + rating;
        const updatedTotalRatings = (driver.totalRatings || 0) + 1;
        const updatedAverage = updatedTotalPoints / updatedTotalRatings;
        await this.driverRepo.updateRatingStats(driverId, {
            totalRatingPoints: updatedTotalPoints,
            totalRatings: updatedTotalRatings,
            averageRating: parseFloat(updatedAverage.toFixed(2)),
        });
        return newReview;
    }
};
exports.SubmitDriverReview = SubmitDriverReview;
exports.SubmitDriverReview = SubmitDriverReview = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("DriverReviewRepository")),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __metadata("design:paramtypes", [Object, Object])
], SubmitDriverReview);
//# sourceMappingURL=SubmitRating.js.map