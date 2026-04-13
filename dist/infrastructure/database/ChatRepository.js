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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoChatRepository = void 0;
const ChatSchema_1 = __importDefault(require("./modals/ChatSchema")); // MongoDB Schema
const Autherror_1 = require("../../domain/errors/Autherror");
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const BaseRepository_1 = require("./BaseRepository");
let MongoChatRepository = class MongoChatRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(ChatSchema_1.default);
    }
    async findChatByBookingId(bookingId) {
        return super.findOne({ bookingId });
    }
    async createChat(chat) {
        return super.create(chat);
    }
    async addMessageToChat(bookingId, message) {
        const result = await ChatSchema_1.default.findOneAndUpdate({ bookingId }, { $push: { messages: message } }, { new: true, projection: { messages: { $slice: -1 } } });
        if (!result || !result.messages || result.messages.length === 0) {
            return null;
        }
        return result.messages[result.messages.length - 1];
    }
    async findMessagesByBookingId(bookingId) {
        const chat = await ChatSchema_1.default.findOne({ bookingId })
            .select('messages')
            .lean();
        if (!chat) {
            return [];
        }
        return chat.messages;
    }
    async addParticipant(chatId, participant) {
        try {
            await ChatSchema_1.default.updateOne({ _id: chatId }, { $push: { participants: participant } });
        }
        catch (error) {
            console.error("Error adding participant:", error.message);
            throw new Autherror_1.AuthError("Failed to add participant", 500);
        }
    }
    async findById(chatId) {
        if (!mongoose_1.Types.ObjectId.isValid(chatId)) {
            return null;
        }
        return super.findById(chatId);
    }
    async deleteMessage(chatId, messageId) {
        try {
            await ChatSchema_1.default.updateOne({ bookingId: new mongoose_1.Types.ObjectId(chatId) }, {
                $pull: {
                    messages: { _id: new mongoose_1.Types.ObjectId(messageId) }
                }
            });
        }
        catch (error) {
            console.error("Error deleting message:", error.message);
            throw new Autherror_1.AuthError("Failed to delete message", 500);
        }
    }
};
exports.MongoChatRepository = MongoChatRepository;
exports.MongoChatRepository = MongoChatRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoChatRepository);
//# sourceMappingURL=ChatRepository.js.map