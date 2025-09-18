import { Queue } from 'bullmq';
import { redisBullmq } from '../redis/redisBullmqClient'; 
import { injectable } from 'tsyringe';
import { IRideAssignmentQueue } from '../../domain/services/IRideAssignmentQueue';

@injectable()
export class RideAssignmentQueue implements IRideAssignmentQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue('ride-assignment-queue', {
      connection: redisBullmq
    });
  }

  async addJob(bookingId: string): Promise<void> {
    await this.queue.add(
      'assign-driver',
      { bookingId },
      {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }
}
