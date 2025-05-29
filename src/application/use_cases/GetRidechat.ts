import { inject, injectable } from 'tsyringe';
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Message } from '../../domain/models/Chat';

interface GetMessagesInput {
  bookingId: string;
}

@injectable()
export class GetMessagesByBookingId {
  constructor(
    @inject('IChatRepository') private chatRepository: IChatRepository
  ) {}

  async execute(input: GetMessagesInput): Promise<Message[]> {
    const { bookingId } = input;

    const messages = await this.chatRepository.findMessagesByBookingId(bookingId);

    return messages;
  }
}
