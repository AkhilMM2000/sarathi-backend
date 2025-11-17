import { Worker, Job } from 'bullmq';
import { redisBullmq } from '../redis/redisBullmqClient';

import { injectable, inject } from 'tsyringe';

import { IBookingRepository } from '../../domain/repositories/IBookingrepository'; 
import { IDriverRepository } from '../../domain/repositories/IDriverepository'; 
import { INotificationService } from '../../application/services/NotificationService';
import { BookingStatus } from '../../domain/models/Booking';
import { ObjectId } from 'mongodb';
import { TOKENS } from '../../constants/Tokens';

@injectable()
export class RideAssignmentWorker {
  private worker: Worker;

  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private bookingRepo: IBookingRepository,

    @inject('IDriverRepository')
    private driverRepo: IDriverRepository,

    @inject('INotificationService')
    private notificationService: INotificationService
  ) {
    this.worker = new Worker(
      'ride-assignment-queue',
      async (job: Job) => this.processJob(job),
      { connection: redisBullmq }
    );

    this.worker.on('completed', (job) => {
      console.log(`✅ Job completed for booking: ${job.data.bookingId}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Job failed for booking: ${job?.data?.bookingId}`, err);
    });
  }

  private async processJob(job: Job): Promise<void> {
    const bookingId = job.data.bookingId;

    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking || booking.status !== BookingStatus.PENDING) return;

    const rejected = booking.rejectedDrivers || [];

    const nearestDriver = await this.driverRepo.findNearbyDriversWithinRadius(
      booking.fromLocation,
      rejected.map((id: ObjectId) => id.toString()),
      15
    );

    if (!nearestDriver) {
      if ((booking.assignmentAttempts || 0) >= 3) {
        booking.assignmentStatus = 'FAILED';
        booking.status = BookingStatus.CANCELLED;
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
      if (updated?.status === BookingStatus.PENDING) {
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
}
