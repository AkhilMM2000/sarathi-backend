"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/database/schemas/ChatSchema.ts
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    senderId: { type: mongoose_1.Schema.Types.ObjectId, required: true, refPath: 'messages.senderRole' },
    senderRole: {
        type: String,
        required: true,
        enum: ['User', 'Driver', 'Admin'], // Ensure it's synced with Role type
    },
    type: {
        type: String,
        required: true,
        enum: ['text', 'image', 'pdf', 'doc'],
    },
    text: {
        type: String,
        required: function () {
            return this.type === 'text';
        },
    },
    fileUrl: {
        type: String,
        required: function () {
            return this.type === 'image' || this.type === 'pdf' || this.type == 'doc';
        },
    },
}, { timestamps: true });
const participantSchema = new mongoose_1.Schema({
    participantId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    role: {
        type: String,
        required: true,
        enum: ['User', 'Driver', 'Admin'],
    },
}, { _id: false });
const chatSchema = new mongoose_1.Schema({
    bookingId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Booking' },
    participants: { type: [participantSchema], required: true },
    messages: { type: [messageSchema], default: [] },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Chat', chatSchema);
//# sourceMappingURL=ChatSchema.js.map