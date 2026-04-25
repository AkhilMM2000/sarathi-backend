"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisUserRegistrationStore = void 0;
const tsyringe_1 = require("tsyringe");
const redisconfig_1 = require("../../config/redisconfig");
let RedisUserRegistrationStore = class RedisUserRegistrationStore {
    async addUser(email, userData) {
        await redisconfig_1.redis.set(`register:${email}`, JSON.stringify(userData), { ex: 600 }); // Expiry: 5 mins
    }
    async addTokenUser(role, token, userId) {
        await redisconfig_1.redis.set(`${role}_${token}`, userId, { ex: 300 }); // Expiry: 5 mins
    }
    async removeTokenUser(role, token) {
        await redisconfig_1.redis.del(`${role}_${token}`);
    }
    async getTokenUser(role, token) {
        const userId = await redisconfig_1.redis.get(`${role}_${token}`);
        return userId;
    }
    async getUser(email) {
        const data = await redisconfig_1.redis.get(`register:${email}`);
        return data;
    }
    async removeUser(email) {
        await redisconfig_1.redis.del(`register:${email}`);
    }
    async clearUsers() {
        const keys = await redisconfig_1.redis.keys("register:*");
        for (const key of keys) {
            await redisconfig_1.redis.del(key);
        }
    }
};
exports.RedisUserRegistrationStore = RedisUserRegistrationStore;
exports.RedisUserRegistrationStore = RedisUserRegistrationStore = __decorate([
    (0, tsyringe_1.injectable)()
], RedisUserRegistrationStore);
//# sourceMappingURL=UserRegisterStore.js.map