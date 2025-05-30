"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPersistence = exports.toDomain = void 0;
const mongoose_1 = require("mongoose");
const toDomain = (doc) => ({
    _id: doc._id.toString(),
    driverId: doc.driverId.toString(),
    userId: doc.userId.toString(),
    rideId: doc.rideId.toString(),
    rating: doc.rating,
    review: doc.review,
    createdAt: doc.createdAt,
    user: doc.userId?.name ? {
        _id: doc.userId._id.toString(),
        name: doc.userId.name,
        profile: doc.userId.profile,
    } : undefined,
});
exports.toDomain = toDomain;
const toPersistence = (review) => ({
    driverId: new mongoose_1.Types.ObjectId(review.driverId),
    userId: new mongoose_1.Types.ObjectId(review.userId),
    rideId: new mongoose_1.Types.ObjectId(review.rideId),
    rating: review.rating,
    review: review.review,
    createdAt: review.createdAt,
});
exports.toPersistence = toPersistence;
//# sourceMappingURL=DriverReviewMapper.js.map