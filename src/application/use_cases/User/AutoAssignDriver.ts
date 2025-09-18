import { inject, injectable } from 'tsyringe';
import { IRideAssignmentQueue } from '../../../domain/services/IRideAssignmentQueue';

@injectable()
export class AutoAssignDriver {
  constructor(
    @inject('IRideAssignmentQueue')
    private rideQueue: IRideAssignmentQueue
  ) {}

  async execute(bookingId: string): Promise<void> {
    await this.rideQueue.addJob(bookingId);
  }
}
