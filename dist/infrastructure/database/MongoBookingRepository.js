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
exports.MongoBookingRepository = void 0;
const Bookingschema_1 = __importDefault(require("./modals/Bookingschema")); // Mongoose model
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let MongoBookingRepository = class MongoBookingRepository {
    async createBooking(booking) {
        try {
            const created = await Bookingschema_1.default.create(booking);
            return created.toObject();
        }
        catch (err) {
            console.error("MongoBookingRepository.createBooking error:", err);
            throw new Autherror_1.AuthError(`Failed to create booking. Please try again.${err.message}`, 500);
        }
    }
    async findBookingById(id) {
        const booking = await Bookingschema_1.default.findById(id);
        return booking ? booking.toObject() : null;
    }
    async GetAllBookings(page, limit) {
        try {
            const skip = (page - 1) * limit;
            const [bookings, total] = await Promise.all([
                Bookingschema_1.default.find()
                    .populate("userId", "name profile")
                    .populate("driverId", "name profileImage")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Bookingschema_1.default.countDocuments(),
            ]);
            const formattedBookings = bookings.map((b) => {
                const plain = b.toObject();
                return {
                    ...plain,
                    username: plain.userId?.name || "Unknown",
                    place: plain.place || "N/A", // safely access populated username
                    drivername: plain.driverId?.name || "Unknown",
                    driverImage: plain.driverId?.profileImage || "N/A", // safely access populated username
                    userImage: plain.userId?.profile || "N/A", // safely access populated username
                };
            });
            return {
                data: formattedBookings,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            console.error('Error fetching all bookings:', error.message);
            throw new Autherror_1.AuthError(`${error.message}`, 500);
        }
    }
    async findBookingsByDriver(driverId, page, limit) {
        const skip = (page - 1) * limit;
        const query = {
            driverId,
            status: { $nin: ["CANCELLED", "REJECTED"] },
            paymentStatus: { $ne: "COMPLETED" },
        };
        const [bookings, total] = await Promise.all([
            Bookingschema_1.default.find(query)
                .populate("userId", "name profile email place mobile")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Bookingschema_1.default.countDocuments(query),
        ]);
        const formattedBookings = bookings.map((b) => {
            const bookingObj = b.toObject(); // Convert Mongoose document to plain object
            const user = bookingObj.userId;
            return {
                ...bookingObj,
                name: user.name,
                place: user.place,
                email: user.email,
                profile: user.profile,
                mobile: user.mobile
            };
        });
        return {
            data: formattedBookings,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updateBooking(id, updates) {
        try {
            const updated = await Bookingschema_1.default.findByIdAndUpdate(id, updates, { new: true });
            return updated ? updated.toObject() : null;
        }
        catch (error) {
            console.error('Error updating booking:', error.message);
            throw new Autherror_1.AuthError(`${error.message}`, 500);
        }
    }
    async checkDriverAvailability(driverId, start, end) {
        // If no end date provided, assume it's a one-day booking
        try {
            const effectiveEnd = end || start;
            console.log(effectiveEnd);
            const conflict = await Bookingschema_1.default.findOne({
                driverId,
                status: { $ne: "CANCELLED" },
                $or: [
                    {
                        // Booking has both startDate and endDate
                        startDate: { $lte: effectiveEnd },
                        endDate: { $gte: start },
                    },
                    {
                        // Booking has only startDate (no endDate field present)
                        startDate: { $eq: effectiveEnd },
                        endDate: { $exists: false },
                    },
                ],
            });
            return !conflict;
        }
        catch (error) {
            // Optionally, use a logger here
            console.error(`Error checking driver availability for ${driverId}:`, error);
            // costome error handling
            throw new Autherror_1.AuthError(`failed to check availability of driver ${error.message}`, 500);
        }
    }
    /////////////////////////current working
    async findBookingsByUser(userId, page, limit) {
        try {
            const skip = (page - 1) * limit;
            const query = {
                userId,
                status: { $nin: ["CANCELLED", "REJECTED"] },
                paymentStatus: { $ne: "COMPLETED" },
            };
            const [bookings, total] = await Promise.all([
                Bookingschema_1.default.find(query)
                    .populate("userId", "name")
                    .populate("driverId", "name profileImage mobile")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Bookingschema_1.default.countDocuments(query),
            ]);
            const formattedBookings = bookings.map((b) => {
                const plain = b.toObject();
                return {
                    ...plain,
                    username: plain.userId?.name || "Unknown",
                    place: plain.place || "N/A", // safely access populated username
                    drivername: plain.driverId?.name || "Unknown",
                    driverImage: plain.driverId?.profileImage || "N/A", // safely access populated username
                };
            });
            return {
                data: formattedBookings,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (err) {
            console.error("MongoBookingRepository.findBookingsByUser error:", err);
            throw new Autherror_1.AuthError(`Failed to fetch user bookings. ${err.message}`, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
    async getRideHistoryByRole(id, role, page, limit) {
        try {
            const skip = (page - 1) * limit;
            // Step 1: Construct dynamic query
            const query = {
                $or: [
                    { status: { $in: ["CANCELLED", "REJECTED"] } },
                    { paymentStatus: "COMPLETED" },
                ],
            };
            if (role === "user") {
                query.userId = id;
            }
            else if (role === "driver") {
                query.driverId = id;
            }
            // Step 2: Determine which field to populate
            const populateField = role === "user" ? "driverId" : "userId";
            const projection = role === "user" ? "name email profileImage place" : "name email profile place";
            const total = await Bookingschema_1.default.countDocuments(query);
            const rides = await Bookingschema_1.default.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate(populateField, projection)
                .lean();
            // Step 3: Transform based on role
            const transformed = rides.map((b) => {
                const person = role === "user" ? b.driverId : b.userId;
                return {
                    ...b,
                    email: person?.email,
                    place: person?.place,
                    name: person?.name,
                    profile: role === "user" ? person?.profileImage : person?.profile,
                };
            });
            return {
                data: transformed,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            console.log(error.message);
            throw new Autherror_1.AuthError(`Failed to fetch ${role} ride history. ${error.message}`, HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MongoBookingRepository = MongoBookingRepository;
exports.MongoBookingRepository = MongoBookingRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoBookingRepository);
//# sourceMappingURL=MongoBookingRepository.js.map