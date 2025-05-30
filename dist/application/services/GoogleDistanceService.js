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
exports.GoogleDistanceService = void 0;
const axios_1 = __importDefault(require("axios"));
const tsyringe_1 = require("tsyringe");
let GoogleDistanceService = class GoogleDistanceService {
    constructor() {
        this.API_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
        this.API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
    }
    async getDistances(userLocation, drivers) {
        if (!this.API_KEY) {
            throw new Error("Google Maps API Key is missing");
        }
        const origins = `${userLocation.latitude},${userLocation.longitude}`;
        const destinations = drivers.map(d => `${d.latitude},${d.longitude}`).join("|");
        try {
            const response = await axios_1.default.get(this.API_URL, {
                params: {
                    origins,
                    destinations,
                    key: this.API_KEY,
                    units: "metric",
                },
            });
            if (response.data.status !== "OK") {
                throw new Error("Error fetching distance data from Google Maps API");
            }
            const distances = {};
            response.data.rows[0].elements.forEach((element, index) => {
                if (element.status === "OK") {
                    distances[drivers[index].id] = element.distance.value / 1000; // Convert meters to km
                }
            });
            return distances;
        }
        catch (error) {
            console.error("Google Maps Distance API Error:", error);
            throw new Error("Failed to fetch distance data");
        }
    }
};
exports.GoogleDistanceService = GoogleDistanceService;
exports.GoogleDistanceService = GoogleDistanceService = __decorate([
    (0, tsyringe_1.injectable)()
], GoogleDistanceService);
//# sourceMappingURL=GoogleDistanceService.js.map