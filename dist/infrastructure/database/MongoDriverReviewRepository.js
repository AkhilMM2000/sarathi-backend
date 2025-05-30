"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDriverReviewRepository = void 0;
// infrastructure/database/MongoDriverReviewRepository.ts
const tsyringe_1 = require("tsyringe");
const DriverReviewschema_1 = __importDefault(require("./modals/DriverReviewschema"));
const DriverReviewMapper_1 = require("./mappers/DriverReviewMapper");
const Autherror_1 = require("../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let MongoDriverReviewRepository = class MongoDriverReviewRepository {
    async createReview(review) {
        const data = (0, DriverReviewMapper_1.toPersistence)({ ...review, createdAt: new Date() });
        const created = await DriverReviewschema_1.default.create(data);
        return (0, DriverReviewMapper_1.toDomain)(created);
    }
    async hasUserAlreadyReviewed(driverId, userId) {
        const existing = await DriverReviewschema_1.default.findOne({
            driverId: driverId,
            userId: userId,
        });
        return !!existing;
    }
    async getReviewsByDriverId(driverId, page, limit) {
        try {
            const skip = (page - 1) * limit;
            const [reviews, total] = await Promise.all([
                DriverReviewschema_1.default.find({ driverId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("userId", "name profile"),
                DriverReviewschema_1.default.countDocuments({ driverId }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                data: reviews.map(DriverReviewMapper_1.toDomain),
                total,
                page,
                totalPages,
            };
        }
        catch (error) {
            throw new Autherror_1.AuthError(error.message, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MongoDriverReviewRepository = MongoDriverReviewRepository;
exports.MongoDriverReviewRepository = MongoDriverReviewRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoDriverReviewRepository);
//# sourceMappingURL=MongoDriverReviewRepository.js.map