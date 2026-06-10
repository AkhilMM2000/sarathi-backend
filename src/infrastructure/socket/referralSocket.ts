// src/infrastructure/socket/referralSocket.ts
import { Socket } from "socket.io";
import { container } from "tsyringe";
import { CreditReferralReward } from "../../application/use_cases/User/CreditReferalreward";
import { getIO } from "./socket";
import { redis } from "../../config/redisconfig";

export const initializeReferralSocket = () => {
  const io = getIO();

  io.on("connection", (socket: Socket) => {
    socket.on("referalPay", async ({ userId }) => {
     
      const creditReward = container.resolve(CreditReferralReward);
      try {
        await creditReward.execute(userId, 100); // ₹100
        socket.emit("referralRewarded", {
          status: false,
          message: "₹100 credited to your wallet",
        });

      } catch (err: any) {
        console.error("Error in referral payment:", err);
        socket.emit("referralRewarded", {
          status: "error",
          message: err.message,
        });
      }
    });

//ridepayment success
 socket.on("walletRidepayment", ({ userId, rideId }) => {
    console.log("Received walletRidepayment:", userId, rideId);

    
    socket.broadcast.emit("walletRidepaymentSuccess", {
      
      rideId
    });
  });

 socket.on("cancelbooking", ({ rideId }) => {
    console.log("Cancel booking for ride:", rideId);

  
   
    socket.broadcast.emit("cancelbookingSuccess", {
      message: "Booking cancelled successfully",
      rideId,
    });

    
  });
  socket.on("ridePaymentSuccess", ({ rideId }) => {
    console.log("Ride payment success for:", rideId);

    // ✅ Emit success message back to the same client
    socket.broadcast.emit("ridePaymentSuccessAck", {
      message: "Payment received successfully!",
      rideId
    });

    // OR ✅ Broadcast to others (e.g., driver or admin panel)
    // socket.broadcast.emit("ridePaidNotification", { rideId });
  });



    socket.on("call:request", async ({ fromId, toId, callerName, role }) => {
      console.log("[DIAGNOSTIC] Backend call:request received. fromId:", fromId, "toId:", toId, "callerName:", callerName, "role:", role);

      // Log the complete online users/socket map
      try {
        const keys = await redis.keys("*socket*");
        console.log("[DIAGNOSTIC] All active socket keys in Redis:", keys);
        if (keys && keys.length > 0) {
          const pairs = await Promise.all(keys.map(async (key) => {
            const val = await redis.get(key);
            return { key, val };
          }));
          console.log("[DIAGNOSTIC] Socket map entries:", pairs);
        }
      } catch (redisErr) {
        console.error("[DIAGNOSTIC] Failed to list Redis keys:", redisErr);
      }

      const lookupKey = role === "user" ? `driver:socket:${toId}` : `user:socket:${toId}`;
      console.log("[DIAGNOSTIC] Lookup key in Redis:", lookupKey);

      const receiverSocketId = await redis.get<string>(lookupKey);
      console.log("[DIAGNOSTIC] Resolved receiverSocketId:", receiverSocketId, "reach here");

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:incoming", {
          fromId,
          callerName,
          role,
        });
      } else {
        socket.emit("call:unavailable");
      }
    });
    
// Backend: On call accept
socket.on("call:accept", async ({ toId ,role}) => {
  console.log(role)
  const targetSocketId = await redis.get<string>(`user:socket:${toId}`) || await redis.get<string>(`driver:socket:${toId}`);
  if (targetSocketId) {
    io.to(targetSocketId).emit("call:accepted",{role});
  }
});

// Backend: On call reject
socket.on("call:reject", async ({ toId }) => {
  const targetSocketId = await redis.get<string>(`user:socket:${toId}`) || await redis.get<string>(`driver:socket:${toId}`);
  if (targetSocketId) {
    io.to(targetSocketId).emit("call:rejected");
  }
});

  socket.on("offer", (offer) => {
   
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

 socket.on("call-ended", (role) => {
    socket.broadcast.emit("call-ended", { callEnder: role });
  });

  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });

    socket.on("ready-for-offer", () => {
    console.log(`[Socket] Receiver ${socket.id} is ready for offer refresh the page`);

    // Relay to the caller. You may want to emit to a specific room or user
    socket.broadcast.emit("ready-for-offer");
  });
  });
};
