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
exports.GoogleMapService = void 0;
const axios_1 = __importDefault(require("axios"));
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../constants/ErrorMessages");
let GoogleMapService = class GoogleMapService {
    constructor() {
        this.apiUrl = process.env.GOOGLEMAP_API_URL;
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }
    async calculateRoadDistances(origin, destinations) {
        try {
            if (destinations.length === 0)
                return [];
            const originParam = `${origin.latitude},${origin.longitude}`;
            const destinationParam = destinations
                .map((d) => `${d.latitude},${d.longitude}`)
                .join('|');
            const response = await axios_1.default.get(this.apiUrl, {
                params: {
                    origins: originParam,
                    destinations: destinationParam,
                    key: this.apiKey,
                },
            });
            const elements = response.data.rows[0]?.elements;
            if (!elements || elements.length !== destinations.length) {
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.GOOGLE_MAPS_API_ERROR, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            return destinations.map((dest, index) => {
                const distanceMeters = elements[index]?.distance?.value ?? 0;
                const distanceKm = distanceMeters / 1000;
                return {
                    driverId: dest.driverId,
                    distanceInKm: distanceKm,
                };
            });
        }
        catch (err) {
            const error = err;
            console.error('❌ Google Maps API Error:', error.message);
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.GOOGLE_MAPS_API_ERROR, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
    }
    async getClosestDriverByRoadDistance(origin, destinations) {
        const distances = await this.calculateRoadDistances(origin, destinations);
        if (!distances.length)
            return null;
        return distances.reduce((min, current) => current.distanceInKm < min.distanceInKm ? current : min);
    }
};
exports.GoogleMapService = GoogleMapService;
exports.GoogleMapService = GoogleMapService = __decorate([
    (0, tsyringe_1.injectable)()
], GoogleMapService);
//# sourceMappingURL=GoogleMapService.js.map