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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const tsyringe_1 = require("tsyringe");
const userschema_1 = __importDefault(require("./modals/userschema")); // MongoDB Schema
const mongoose_1 = require("mongoose");
const ConflictError_1 = require("../../domain/errors/ConflictError");
const BaseRepository_1 = require("./BaseRepository");
let MongoUserRepository = class MongoUserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(userschema_1.default);
    }
    async create(user) {
        return super.create(user);
    }
    async updateUser(userId, data) {
        try {
            if (!(0, mongoose_1.isValidObjectId)(userId))
                throw new Error("Invalid user ID");
            const user = await userschema_1.default.findById(userId);
            if (!user)
                return null;
            Object.assign(user, data);
            await user.save();
            return user.toObject();
        }
        catch (error) {
            if (error.code === 11000) {
                throw new ConflictError_1.ConflictError("User with this email or mobile already exists");
            }
            throw error;
        }
    }
    async findByEmail(email) {
        return super.findOne({ email });
    }
    async findByReferralCode(referralCode) {
        if (!referralCode)
            return null;
        return super.findOne({ referralCode });
    }
    async getUserById(userId) {
        if (!(0, mongoose_1.isValidObjectId)(userId))
            return null;
        return super.findById(userId); // BaseRepository findById already uses lean()
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
        const user = await super.findOne({ $or: [{ email }, { mobile }] });
        return !!user;
    }
};
exports.MongoUserRepository = MongoUserRepository;
exports.MongoUserRepository = MongoUserRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoUserRepository);
//# sourceMappingURL=MongoUserRepository.js.map