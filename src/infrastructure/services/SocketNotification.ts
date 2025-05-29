// src/infrastructure/services/SocketNotificationService.ts
import { injectable } from "tsyringe";
import { INotificationService } from "../../application/services/NotificationService";
import { getIO } from "../socket/socket"; 
import { redis } from "../../config/redisconfig";
@injectable()
export class SocketNotificationService implements INotificationService {
  private io = getIO();

  async sendBookingNotification(driverId: string, data: any):Promise< void >{
    const socketId = await redis.get<string>(`driver:socket:${driverId}`);
    console.log('booking notifciation',socketId)
    if (socketId) {
      this.io.to(socketId).emit("booking:new", data);
    }
  }
async cancelBookingNotification(driverId: string, data: any):Promise< void> {
  const socketId = await redis.get<string>(`driver:socket:${driverId}`);
  console.log('booking notifciationcancel',socketId)
  if (socketId) {
    this.io.to(socketId).emit("cancel:booking", data);
  }
}

async paymentNotification(driverId: string, data: any):Promise<void> {
  
  const socketId = await redis.get<string>(`driver:socket:${driverId}`);
  console.log(driverId,' driver id each payment notification reach',socketId)
  if (socketId) {
    this.io.to(socketId).emit("payment:status", data);
  }
}

   async sendBookingConfirmation(userId: string, data: any):Promise< void> {
    const socketId = await redis.get<string>(`user:socket:${userId}`);
       
        if (socketId) {
        this.io.to(socketId).emit("booking:confirmation", data);
        }
    }

async rejectBookingNotification(userId: string, data: any): Promise<void> {
  const socketId = await redis.get<string>(`user:socket:${userId}`);

  if (socketId) {
  this.io.to(socketId).emit("booking:reject", data);
  }
}
    
}
