import { IChatRepository } from '../../domain/repositories/IChatRepository'; 
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../constants/Tokens';

@injectable()
export class DeleteMessageUseCase {
  constructor(
    @inject(TOKENS.CHAT_REPO) private chatRepository: IChatRepository
  ) {}

  async execute(chatId: string, messageId: string): Promise<void> {
  
    await this.chatRepository.deleteMessage(
      chatId,
    messageId
    );
  }
}
