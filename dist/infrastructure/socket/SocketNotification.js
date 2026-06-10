"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSocket = void 0;
const socket_1 = require("./socket");
const redisconfig_1 = require("../../config/redisconfig");
const tsyringe_1 = require("tsyringe");
const Tokens_1 = require("../../constants/Tokens");
const Bookingschema_1 = __importDefault(require("../database/modals/Bookingschema"));
const Driverschema_1 = __importDefault(require("../database/modals/Driverschema"));
const Booking_1 = require("../../domain/models/Booking");
const NotificationSocket = () => {
    const io = (0, socket_1.getIO)();
    io.on("connection", (socket) => {
        socket.on("driver:online", async (driverId) => {
            await redisconfig_1.redis.set(`driver:socket:${driverId}`, socket.id);
            await redisconfig_1.redis.set(`socket:driver:${socket.id}`, driverId);
            try {
                // 1. Fetch driver profile to get coordinates
                const driver = await Driverschema_1.default.findById(driverId);
                if (!driver || !driver.location)
                    return;
                let driverLng;
                let driverLat;
                if ("coordinates" in driver.location) {
                    [driverLng, driverLat] = driver.location.coordinates;
                }
                else {
                    driverLng = driver.location.longitude;
                    driverLat = driver.location.latitude;
                }
                // 2. Fetch all active pending broadcast bookings
                const pendingBookings = await Bookingschema_1.default.find({
                    status: Booking_1.BookingStatus.PENDING,
                    driverId: null
                });
                if (pendingBookings.length === 0)
                    return;
                const distanceService = tsyringe_1.container.resolve(Tokens_1.TOKENS.GOOGLE_DISTANCE_SERVICE);
                // Prepare locations (booking starting locations)
                const bookingLocations = pendingBookings
                    .filter(b => b.fromLat !== undefined && b.fromLng !== undefined)
                    .map(b => ({
                    id: b._id.toString(),
                    latitude: b.fromLat,
                    longitude: b.fromLng
                }));
                if (bookingLocations.length === 0)
                    return;
                // Calculate road distances from the driver's location to the bookings' pickup coordinates
                const distances = await distanceService.getDistances({ latitude: driverLat, longitude: driverLng }, bookingLocations);
                // Emit booking:new to this driver for all bookings <= 20 km
                for (const booking of pendingBookings) {
                    const roadDist = distances[booking._id.toString()];
                    console.log(`[Catch-Up Check] Booking ${booking._id.toString()} is ${roadDist} km away from Driver ${driverId}`);
                    if (roadDist !== undefined && roadDist <= 20) {
                        console.log(`📣 Emitting catch-up notification to Driver ${driverId} for Booking ${booking._id.toString()}`);
                        socket.emit("booking:new", {
                            bookingId: booking._id.toString(),
                            fromLocation: booking.fromLocation,
                            toLocation: booking.toLocation,
                            estimatedFare: booking.estimatedFare,
                            startDate: booking.startDate,
                            newRide: booking
                        });
                    }
                }
            }
            catch (error) {
                console.error("[SocketNotification] Error catching up offline driver:", error);
            }
        });
        socket.on("user:online", async ({ userId }) => {
            await redisconfig_1.redis.set(`user:socket:${userId}`, socket.id);
            await redisconfig_1.redis.set(`socket:user:${socket.id}`, userId);
            console.log('user is online');
        });
        socket.on("disconnect", async () => {
            const driverId = await redisconfig_1.redis.get(`socket:driver:${socket.id}`);
            if (driverId) {
                await redisconfig_1.redis.del(`driver:socket:${driverId}`);
                await redisconfig_1.redis.del(`socket:driver:${socket.id}`);
                console.log(`Driver ${driverId} disconnected`);
            }
            // Try to clean up user socket
            const userId = await redisconfig_1.redis.get(`socket:user:${socket.id}`);
            if (userId) {
                await redisconfig_1.redis.del(`user:socket:${userId}`);
                await redisconfig_1.redis.del(`socket:user:${socket.id}`);
                console.log(`User ${userId} disconnected`);
            }
        });
    });
};
exports.NotificationSocket = NotificationSocket;
//# sourceMappingURL=SocketNotification.js.map