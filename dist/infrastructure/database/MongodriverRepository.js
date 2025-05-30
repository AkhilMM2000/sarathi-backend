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
exports.MongoDriverRepository = void 0;
const tsyringe_1 = require("tsyringe");
const Driverschema_1 = __importDefault(require("./modals/Driverschema")); // MongoDB Schema
const mongoose_1 = require("mongoose");
const Autherror_1 = require("../../domain/errors/Autherror");
let MongoDriverRepository = class MongoDriverRepository {
    async create(driver) {
        const newDriver = new Driverschema_1.default(driver);
        const savedDriver = await newDriver.save();
        // Convert to a plain JavaScript object
        return savedDriver.toObject();
    }
    async update(userId, data) {
        if (!(0, mongoose_1.isValidObjectId)(userId))
            throw new Error("Invalid user ID");
        const user = await Driverschema_1.default.findById(userId);
        if (!user)
            return null;
        Object.assign(user, data);
        await user.save();
        return user.toObject();
    }
    async findDriverById(driverId) {
        try {
            return await Driverschema_1.default.findById(driverId)
                .select("-createdAt -updatedAt -__v"); // Exclude fields
        }
        catch (error) {
            console.error("Error finding driver by ID:", error);
            return null;
        }
    }
    async findByEmail(email) {
        return await Driverschema_1.default.findOne({ email });
    }
    async updateStatus(driverId, status, reason) {
        const updateData = { status };
        if (status === "rejected" && reason) {
            updateData.reason = reason;
        }
        else {
            updateData.reason = null;
        }
        return await Driverschema_1.default.findByIdAndUpdate(driverId, updateData, {
            new: true,
            runValidators: true,
        });
    }
    async blockOrUnblockDriver(driverId, isBlock) {
        await Driverschema_1.default.findByIdAndUpdate(driverId, { isBlock });
    }
    async getDrivers() {
        return await Driverschema_1.default.find();
    }
    async findAllActiveDrivers() {
        return (await Driverschema_1.default.find({ status: "approved" }).lean());
    }
    async updateStripeAccount(driverId, stripeAccountId) {
        try {
            const driver = await Driverschema_1.default.findById(driverId);
            if (!driver) {
                throw new Autherror_1.AuthError('Driver not found', 404);
            }
            driver.stripeAccountId = stripeAccountId;
            await driver.save();
            return { ...driver.toObject(), _id: driver._id };
        }
        catch (error) {
            console.error('Failed to update Stripe account for driver:', error);
            throw new Autherror_1.AuthError('Failed to update Stripe account', 500);
        }
    }
    async updateRatingStats(driverId, stats) {
        await Driverschema_1.default.findByIdAndUpdate(driverId, {
            $set: {
                totalRatingPoints: stats.totalRatingPoints,
                totalRatings: stats.totalRatings,
                averageRating: stats.averageRating,
            },
        });
    }
};
exports.MongoDriverRepository = MongoDriverRepository;
exports.MongoDriverRepository = MongoDriverRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoDriverRepository);
//# sourceMappingURL=MongodriverRepository.js.map