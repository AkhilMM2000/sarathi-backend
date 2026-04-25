"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSMSService = void 0;
const twilio_1 = __importDefault(require("twilio"));
console.log(process.env.TWILIO_PHONE_NUMBER);
class TwilioSMSService {
    constructor() {
        this.client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    async sendSMS(to, message) {
        await this.client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
    }
}
exports.TwilioSMSService = TwilioSMSService;
//# sourceMappingURL=TwilioSMSService.js.map