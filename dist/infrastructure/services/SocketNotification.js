"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketNotificationService = void 0;
// src/infrastructure/services/SocketNotificationService.ts
const tsyringe_1 = require("tsyringe");
const socket_1 = require("../socket/socket");
const redisconfig_1 = require("../../config/redisconfig");
let SocketNotificationService = class SocketNotificationService {
    constructor() {
        this.io = (0, socket_1.getIO)();
    }
    async sendBookingNotification(driverId, data) {
        const socketId = await redisconfig_1.redis.get(`driver:socket:${driverId}`);
        console.log('booking notifciation', socketId);
        if (socketId) {
            this.io.to(socketId).emit("booking:new", data);
        }
    }
    async cancelBookingNotification(driverId, data) {
        const socketId = await redisconfig_1.redis.get(`driver:socket:${driverId}`);
        console.log('booking notifciationcancel', socketId);
        if (socketId) {
            this.io.to(socketId).emit("cancel:booking", data);
        }
    }
    async paymentNotification(driverId, data) {
        const socketId = await redisconfig_1.redis.get(`driver:socket:${driverId}`);
        console.log(driverId, ' driver id each payment notification reach', socketId);
        if (socketId) {
            this.io.to(socketId).emit("payment:status", data);
        }
    }
    async sendBookingConfirmation(userId, data) {
        const socketId = await redisconfig_1.redis.get(`user:socket:${userId}`);
        if (socketId) {
            this.io.to(socketId).emit("booking:confirmation", data);
        }
    }
    async rejectBookingNotification(userId, data) {
        const socketId = await redisconfig_1.redis.get(`user:socket:${userId}`);
        if (socketId) {
            this.io.to(socketId).emit("booking:reject", data);
        }
    }
    async adminChangeDriverStatusNotification(driverId, data) {
        const socketId = await redisconfig_1.redis.get(`driver:socket:${driverId}`);
        if (socketId) {
            this.io.to(socketId).emit("admin:changeDriverStatus", data);
        }
    }
};
exports.SocketNotificationService = SocketNotificationService;
exports.SocketNotificationService = SocketNotificationService = __decorate([
    (0, tsyringe_1.injectable)()
], SocketNotificationService);
//# sourceMappingURL=SocketNotification.js.map