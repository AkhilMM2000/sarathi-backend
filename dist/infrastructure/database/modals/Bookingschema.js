"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const Booking_1 = require("../../../domain/models/Booking");
const bookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Driver", required: true },
    fromLocation: { type: String },
    toLocation: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    estimatedKm: { type: Number },
    finalKm: { type: Number },
    estimatedFare: { type: Number },
    finalFare: { type: Number },
    bookingType: {
        type: String,
        enum: Object.values(Booking_1.BookingType),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(Booking_1.BookingStatus),
        default: Booking_1.BookingStatus.PENDING,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(Booking_1.paymentStatus),
        default: Booking_1.paymentStatus.PENDING,
    },
    paymentIntentId: { type: String },
    paymentMode: {
        type: String,
        enum: ["stripe"],
    },
    driver_fee: { type: Number },
    platform_fee: { type: Number },
    reason: { type: String },
    walletDeduction: { type: Number }
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Booking", bookingSchema);
//# sourceMappingURL=Bookingschema.js.map