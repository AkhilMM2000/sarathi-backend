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
exports.SaveMessageUseCase = void 0;
const mongoose_1 = require("mongoose");
const tsyringe_1 = require("tsyringe");
const chatService_1 = require("../services/chatService");
let SaveMessageUseCase = class SaveMessageUseCase {
    constructor(chatRepository, chatService) {
        this.chatRepository = chatRepository;
        this.chatService = chatService;
    }
    async execute({ bookingId, senderId, senderRole, type, text, fileUrl, }) {
        const bookingObjectId = new mongoose_1.Types.ObjectId(bookingId);
        const senderObjectId = new mongoose_1.Types.ObjectId(senderId);
        // ✅ Validation based on message type
        if (type === 'text' && !text) {
            throw new Error('Text message must include text content.');
        }
        if ((type === 'image' || type === 'pdf') && !fileUrl) {
            throw new Error(`${type.toUpperCase()} message must include a fileUrl.`);
        }
        let chat = await this.chatRepository.findChatByBookingId(bookingId);
        const newMessage = {
            senderId: senderObjectId,
            senderRole,
            type,
            ...(text && { text }),
            ...(fileUrl && { fileUrl }),
            createdAt: new Date(),
        };
        if (!chat) {
            chat = await this.chatRepository.createChat({
                bookingId: bookingObjectId,
                participants: [
                    { participantId: senderObjectId, role: senderRole },
                ],
                messages: [newMessage],
            });
            return newMessage;
        }
        await this.chatService.addParticipantIfNeeded(chat._id.toString(), senderObjectId, senderRole);
        return await this.chatRepository.addMessageToChat(bookingId, newMessage);
    }
};
exports.SaveMessageUseCase = SaveMessageUseCase;
exports.SaveMessageUseCase = SaveMessageUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IChatRepository')),
    __metadata("design:paramtypes", [Object, chatService_1.ChatService])
], SaveMessageUseCase);
//# sourceMappingURL=saveMessagechat.js.map