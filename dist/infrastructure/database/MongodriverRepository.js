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
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let MongoDriverRepository = class MongoDriverRepository {
    async create(driver) {
        let geoDriver = { ...driver };
        if ("latitude" in driver.location && "longitude" in driver.location) {
            geoDriver.location = {
                type: "Point",
                coordinates: [driver.location.longitude, driver.location.latitude],
            };
        }
        const newDriver = new Driverschema_1.default(geoDriver);
        const savedDriver = await newDriver.save();
        return savedDriver.toObject();
    }
    async update(driverId, data) {
        if (!(0, mongoose_1.isValidObjectId)(driverId)) {
            throw new Autherror_1.AuthError("Invalid driver ID", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        const driver = await Driverschema_1.default.findById(driverId);
        if (!driver)
            return null;
        if (data.location &&
            "latitude" in data.location &&
            "longitude" in data.location) {
            data.location = {
                type: "Point",
                coordinates: [data.location.longitude, data.location.latitude],
            };
        }
        Object.assign(driver, data);
        await driver.save();
        return driver.toObject();
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
    async findActiveDrivers(page, limit, placeKey) {
        const skip = (page - 1) * limit;
        const matchStage = {
            status: "approved"
        };
        const trimmedPlaceKey = placeKey?.trim();
        if (trimmedPlaceKey) {
            matchStage.place = { $regex: trimmedPlaceKey, $options: "i" };
        }
        const aggregationPipeline = [
            { $match: matchStage },
            {
                $facet: {
                    data: [
                        { $project: {
                                _id: 1,
                                name: 1,
                                profileImage: 1,
                                place: 1,
                                location: 1,
                                averageRating: 1
                            } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];
        const result = await Driverschema_1.default.aggregate(aggregationPipeline);
        const data = result[0]?.data || [];
        const total = result[0]?.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);
        return {
            data: data,
            total,
            page,
            totalPages
        };
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
    async findNearbyDriversWithinRadius(location, excludedDriverIds, radiusInKm) {
        try {
            const radiusInMeters = radiusInKm * 1000;
            const excludedObjectIds = excludedDriverIds
                .filter(mongoose_1.isValidObjectId)
                .map((id) => new mongoose_1.Types.ObjectId(id));
            const result = await Driverschema_1.default.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [location.longitude, location.latitude],
                        },
                        distanceField: 'distance',
                        maxDistance: radiusInMeters,
                        spherical: true,
                        query: {
                            _id: { $nin: excludedObjectIds },
                            onlineStatus: 'online',
                            isBlock: false,
                            status: 'approved',
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        latitude: { $arrayElemAt: ['$location.coordinates', 1] },
                        longitude: { $arrayElemAt: ['$location.coordinates', 0] },
                    },
                },
            ]);
            return result;
        }
        catch (error) {
            console.error('❌ Error in findNearbyDriversWithinRadius:', error);
            throw new Autherror_1.AuthError('Failed to find nearby drivers', HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MongoDriverRepository = MongoDriverRepository;
exports.MongoDriverRepository = MongoDriverRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoDriverRepository);
//# sourceMappingURL=MongodriverRepository.js.map