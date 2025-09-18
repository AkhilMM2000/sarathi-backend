
export interface IRideAssignmentQueue {
  addJob(bookingId: string): Promise<void>;
}
