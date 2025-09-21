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
exports.RideAssignmentWorker = void 0;
const bullmq_1 = require("bullmq");
const redisBullmqClient_1 = require("../redis/redisBullmqClient");
const tsyringe_1 = require("tsyringe");
const Booking_1 = require("../../domain/models/Booking");
let RideAssignmentWorker = class RideAssignmentWorker {
    constructor(bookingRepo, driverRepo, notificationService) {
        this.bookingRepo = bookingRepo;
        this.driverRepo = driverRepo;
        this.notificationService = notificationService;
        this.worker = new bullmq_1.Worker('ride-assignment-queue', async (job) => this.processJob(job), { connection: redisBullmqClient_1.redisBullmq });
        this.worker.on('completed', (job) => {
            console.log(`✅ Job completed for booking: ${job.data.bookingId}`);
        });
        this.worker.on('failed', (job, err) => {
            console.error(`❌ Job failed for booking: ${job?.data?.bookingId}`, err);
        });
    }
    async processJob(job) {
        const bookingId = job.data.bookingId;
        const booking = await this.bookingRepo.findBookingById(bookingId);
        if (!booking || booking.status !== Booking_1.BookingStatus.PENDING)
            return;
        const rejected = booking.rejectedDrivers || [];
        const nearestDriver = await this.driverRepo.findNearbyDriversWithinRadius(booking.fromLocation, rejected.map((id) => id.toString()), 15);
        if (!nearestDriver) {
            if ((booking.assignmentAttempts || 0) >= 3) {
                booking.assignmentStatus = 'FAILED';
                booking.status = Booking_1.BookingStatus.CANCELLED;
                await this.bookingRepo.updateBooking(bookingId, booking);
                return;
            }
            throw new Error('No drivers available. Will retry...');
        }
        await this.notificationService.sendDriverRequest(nearestDriver._id.toString(), {
            bookingId,
            from: booking.fromLocation,
            to: booking.toLocation,
        });
        booking.driverId = nearestDriver._id;
        booking.assignmentAttempts = (booking.assignmentAttempts || 0) + 1;
        booking.assignmentStatus = 'AWAITING_RESPONSE';
        await this.bookingRepo.updateBooking(bookingId, booking);
        console.log(`🚗 Assigned booking ${bookingId} to driver ${nearestDriver._id}`);
        // Retry if driver doesn't respond in 1 minute
        setTimeout(async () => {
            const updated = await this.bookingRepo.findBookingById(bookingId);
            if (updated?.status === Booking_1.BookingStatus.PENDING) {
                updated.rejectedDrivers = [
                    ...(updated.rejectedDrivers || []),
                    nearestDriver._id,
                ];
                updated.assignmentStatus = 'REASSIGNED';
                await this.bookingRepo.updateBooking(bookingId, updated);
                throw new Error('Driver did not respond in time. Reassigning...');
            }
        }, 60 * 1000);
    }
};
exports.RideAssignmentWorker = RideAssignmentWorker;
exports.RideAssignmentWorker = RideAssignmentWorker = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(1, (0, tsyringe_1.inject)('IDriverRepository')),
    __param(2, (0, tsyringe_1.inject)('INotificationService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], RideAssignmentWorker);
//# sourceMappingURL=rideAssignmentWorker.js.map