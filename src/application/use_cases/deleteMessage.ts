import { IChatRepository } from '../../domain/repositories/IChatRepository'; 
import { injectable, inject } from 'tsyringe';
import { Types } from 'mongoose';
import { AuthError } from '../../domain/errors/Autherror';

@injectable()
export class DeleteMessageUseCase {
  constructor(
    @inject('IChatRepository') private chatRepository: IChatRepository
  ) {}

  async execute(chatId: string, messageId: string): Promise<void> {
    if (!Types.ObjectId.isValid(chatId) || !Types.ObjectId.isValid(messageId)) {
      throw new AuthError('Invalid chatId or messageId', 400);
    }

    await this.chatRepository.deleteMessage(
      chatId,
    messageId
    );
  }
}
