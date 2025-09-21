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
exports.FindNearbyDrivers = void 0;
const tsyringe_1 = require("tsyringe");
const GoogleDistanceService_1 = require("../../services/GoogleDistanceService");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
let FindNearbyDrivers = class FindNearbyDrivers {
    constructor(driverRepository, userRepository, distanceService) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.distanceService = distanceService;
    }
    async execute(userId, page = 1, limit = 2, placeKey) {
        // 1️⃣ Fetch the user's location from the database
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new Autherror_1.AuthError("User not found", 404);
        }
        if (!user.location) {
            throw new Autherror_1.AuthError("User location not found", 400);
        }
        const { latitude, longitude } = user.location;
        // 2️⃣ Use paginated driver fetching from repository
        const paginatedResult = await this.driverRepository.findActiveDrivers(page, limit, placeKey);
        const drivers = paginatedResult.data;
        if (drivers.length === 0)
            return { ...paginatedResult, data: [] };
        // 3️⃣ Extract driver locations
        const driverLocations = drivers.map((driver) => {
            if ('coordinates' in driver.location) {
                return {
                    id: driver._id?.toString() || "",
                    latitude: driver.location.coordinates[1],
                    longitude: driver.location.coordinates[0],
                };
            }
            else {
                return {
                    id: driver._id?.toString() || "",
                    latitude: driver.location.latitude,
                    longitude: driver.location.longitude,
                };
            }
        });
        // 4️⃣ Get distances
        const distances = await this.distanceService.getDistances({ latitude, longitude }, driverLocations);
        // 5️⃣ Add distance to driver
        const driversWithDistance = drivers.map((driver) => {
            const driverId = driver._id?.toString();
            return {
                ...driver,
                distance: driverId ? distances[driverId] || null : null,
            };
        });
        // 6️⃣ Sort & return with pagination info
        return {
            ...paginatedResult,
            data: driversWithDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)),
        };
    }
};
exports.FindNearbyDrivers = FindNearbyDrivers;
exports.FindNearbyDrivers = FindNearbyDrivers = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(2, (0, tsyringe_1.inject)("GoogleDistanceService")),
    __metadata("design:paramtypes", [Object, Object, GoogleDistanceService_1.GoogleDistanceService])
], FindNearbyDrivers);
//# sourceMappingURL=FindNearbyDrivers.js.map