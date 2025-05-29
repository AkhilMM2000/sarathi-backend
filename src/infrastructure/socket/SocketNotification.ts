// src/infrastructure/socket/referralSocket.ts
import { Socket } from "socket.io";
import { getIO } from "./socket";

import { redis } from "../../config/redisconfig"; // your redis setup file
export const NotificationSocket = () => {
  const io = getIO();

  io.on("connection", (socket: Socket) => {
 
    socket.on("driver:online", async(driverId: string) => {
    
      await redis.set(`driver:socket:${driverId}`, socket.id);
      await redis.set(`socket:driver:${socket.id}`, driverId);
      
    });

 socket.on("user:online",async ({userId}) => {
  
     await redis.set(`user:socket:${userId}`, socket.id);
     await redis.set(`socket:user:${socket.id}`, userId);
console.log('user is online')
    }
)

  socket.on("disconnect",async () => {

    const driverId = await redis.get<string>(`socket:driver:${socket.id}`);
    if (driverId) {
      await redis.del(`driver:socket:${driverId}`);
      await redis.del(`socket:driver:${socket.id}`);
      console.log(`Driver ${driverId} disconnected`);
    }
  
    // Try to clean up user socket
    const userId = await redis.get<string>(`socket:user:${socket.id}`);
    if (userId) {
      await redis.del(`user:socket:${userId}`);
      await redis.del(`socket:user:${socket.id}`);
      console.log(`User ${userId} disconnected`);
    }

    });
  });

};
