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
exports.GetNearbyDriverDetails = void 0;
const tsyringe_1 = require("tsyringe");
const GoogleDistanceService_1 = require("../../services/GoogleDistanceService");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
let GetNearbyDriverDetails = class GetNearbyDriverDetails {
    constructor(driverRepository, userRepository, distanceService) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.distanceService = distanceService;
    }
    async execute(userId, driverId, lat, lng) {
        let latitude = lat;
        let longitude = lng;
        // 1️⃣ Fetch the user's location from the database if not provided
        if (latitude === undefined || longitude === undefined) {
            const user = await this.userRepository.getUserById(userId);
            if (!user?.location) {
                throw new Autherror_1.AuthError("User location not found. Please provide coordinates or update your profile.", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            latitude = user.location.latitude;
            longitude = user.location.longitude;
        }
        // 2️⃣ Fetch the specific driver directly
        const driver = await this.driverRepository.findDriverById(driverId);
        if (!driver) {
            throw new Autherror_1.AuthError("Driver not found", HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        // 3️⃣ Extract driver location for distance calculation
        const driverLocation = ('coordinates' in driver.location)
            ? {
                id: driverId,
                latitude: driver.location.coordinates[1],
                longitude: driver.location.coordinates[0],
            }
            : {
                id: driverId,
                latitude: driver.location.latitude,
                longitude: driver.location.longitude,
            };
        // 4️⃣ Get distance for this specific driver
        const distances = await this.distanceService.getDistances({ latitude, longitude }, [driverLocation]);
        const distance = distances[driverId] || null;
        return {
            _id: driverId,
            name: driver.name,
            profileImage: driver.profileImage,
            location: driver.location,
            place: driver.place,
            averageRating: driver.averageRating,
            distance: distance
        };
    }
};
exports.GetNearbyDriverDetails = GetNearbyDriverDetails;
exports.GetNearbyDriverDetails = GetNearbyDriverDetails = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.GOOGLE_DISTANCE_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, GoogleDistanceService_1.GoogleDistanceService])
], GetNearbyDriverDetails);
//# sourceMappingURL=GetNearbyDriverDetails.js.map