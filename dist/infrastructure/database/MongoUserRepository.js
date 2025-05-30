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
exports.MongoUserRepository = void 0;
const tsyringe_1 = require("tsyringe");
const userschema_1 = __importDefault(require("./modals/userschema")); // MongoDB Schema
const mongoose_1 = require("mongoose");
const Autherror_1 = require("../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
let MongoUserRepository = class MongoUserRepository {
    async create(user) {
        try {
            const newUser = new userschema_1.default(user);
            const savedUser = await newUser.save();
            return savedUser.toObject();
        }
        catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user");
        }
    }
    async updateUser(userId, data) {
        if (!(0, mongoose_1.isValidObjectId)(userId))
            throw new Error("Invalid user ID");
        const user = await userschema_1.default.findById(userId);
        if (!user)
            return null;
        Object.assign(user, data);
        await user.save();
        return user.toObject();
    }
    async findByEmail(email) {
        try {
            return await userschema_1.default.findOne({ email });
        }
        catch (error) {
            console.error("Error finding user by email:", error);
            throw new Error("Failed to find user");
        }
    }
    async findByReferralCode(referralCode) {
        if (!referralCode)
            return null;
        try {
            return await userschema_1.default.findOne({ referralCode });
        }
        catch (error) {
            console.error("Error finding user by referral code:", error.message);
            throw new Autherror_1.AuthError("Failed to find user by referral code", HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserById(userId) {
        try {
            if (!(0, mongoose_1.isValidObjectId)(userId))
                return null; // ✅ Validate ID format
            return await userschema_1.default.findById(new mongoose_1.Types.ObjectId(userId));
        }
        catch (error) {
            console.error("Error finding user by ID:", error.message);
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async getUsers() {
        try {
            const usersWithVehicleCount = await userschema_1.default.aggregate([
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "_id",
                        foreignField: "userId",
                        as: "vehicles",
                    },
                },
                {
                    $addFields: {
                        vehicleCount: { $size: "$vehicles" },
                    },
                },
                {
                    $project: {
                        password: 0, // Hide sensitive fields
                        vehicles: 0, // Remove vehicles array if not needed
                    },
                },
            ]);
            return usersWithVehicleCount;
        }
        catch (error) {
            console.log(error);
            throw new Error(`Failed to get users: ${error.message}`);
        }
    }
    async blockOrUnblockUser(userId, isBlock) {
        try {
            if (!(0, mongoose_1.isValidObjectId)(userId.trim())) {
                throw new Error("Invalid userId format");
            }
            const updatedUser = await userschema_1.default.findByIdAndUpdate(userId.trim(), { isBlock }, { new: true }).lean();
            if (!updatedUser) {
                return null; // User not found
            }
            // Fetch vehicle count
            const vehicleCountResult = await userschema_1.default.aggregate([
                {
                    $match: { _id: new mongoose_1.Types.ObjectId(userId.trim()) },
                },
                {
                    $lookup: {
                        from: "vehicles",
                        localField: "_id",
                        foreignField: "userId",
                        as: "vehicles",
                    },
                },
                {
                    $addFields: {
                        vehicleCount: { $size: "$vehicles" },
                    },
                },
                {
                    $project: {
                        vehicles: 0, // Remove vehicles array
                    },
                },
            ]);
            if (vehicleCountResult.length === 0) {
                return null;
            }
            return {
                ...updatedUser,
                vehicleCount: vehicleCountResult[0].vehicleCount,
            };
        }
        catch (error) {
            console.error(error);
            throw new Error(`Failed to block user: ${error.message}`);
        }
    }
    async findByEmailOrMobile(email, mobile) {
        try {
            const user = await userschema_1.default.findOne({
                $or: [{ email }, { mobile }]
            });
            return !!user;
        }
        catch (error) {
            console.error("Error finding user by email or mobile:", error);
            return false; // or throw an AppError if you want to handle differently
        }
    }
};
exports.MongoUserRepository = MongoUserRepository;
exports.MongoUserRepository = MongoUserRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoUserRepository);
//# sourceMappingURL=MongoUserRepository.js.map