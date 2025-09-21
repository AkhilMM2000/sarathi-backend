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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideAssignmentQueue = void 0;
const bullmq_1 = require("bullmq");
const redisBullmqClient_1 = require("../redis/redisBullmqClient");
const tsyringe_1 = require("tsyringe");
let RideAssignmentQueue = class RideAssignmentQueue {
    constructor() {
        this.queue = new bullmq_1.Queue('ride-assignment-queue', {
            connection: redisBullmqClient_1.redisBullmq
        });
    }
    async addJob(bookingId) {
        await this.queue.add('assign-driver', { bookingId }, {
            attempts: 3,
            backoff: {
                type: 'fixed',
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
    }
};
exports.RideAssignmentQueue = RideAssignmentQueue;
exports.RideAssignmentQueue = RideAssignmentQueue = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], RideAssignmentQueue);
//# sourceMappingURL=rideAssignmentQueue.js.map