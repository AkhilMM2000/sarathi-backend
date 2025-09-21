"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisBullmq = void 0;
const ioredis_1 = require("ioredis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisConfig = {
    host: process.env.REDIS_CLOUD_HOST,
    port: Number(process.env.REDIS_CLOUD_PORT),
    username: 'default',
    password: process.env.REDIS_CLOUD_PASSWORD,
};
if (process.env.NODE_ENV === 'production') {
    redisConfig.tls = {};
}
exports.redisBullmq = new ioredis_1.Redis(redisConfig);
//# sourceMappingURL=redisBullmqClient.js.map