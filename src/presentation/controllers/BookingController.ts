import { Request, Response } from "express";
import { container } from "tsyringe";
import { BookDriver, BookDriverInput } from "../../application/use_cases/User/BookDriver";
import { AuthError } from "../../domain/errors/Autherror";
import { GetEstimatedFare } from "../../application/use_cases/User/GetEstimatedFare";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { GetUserBookings } from "../../application/use_cases/User/GetUserbooking";
import { AttachPaymentIntentIdToBooking } from "../../application/use_cases/User/AttachPaymentIntentIdToBooking";
import { UpdateBookingStatus } from "../../application/use_cases/Driver/UpdateBookingstatus";
import { GetAllBookings } from "../../application/use_cases/Admin/GetAllRides";
import { CancelBookingInputUseCase } from "../../application/use_cases/User/CancelBooking";
import { BookingStatus } from "../../domain/models/Booking";
import {GetMessagesByBookingId } from "../../application/use_cases/GetRidechat";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { GetRideHistory } from "../../application/use_cases/GetRideHistory";
import { GenerateChatSignedUrl } from "../../application/use_cases/chatGetSignedUrl";
import { WalletBallence } from "../../application/use_cases/User/WalletBallence";
import { walletTransaction } from "../../application/use_cases/User/walletTransaction";
import { WalletPayment } from "../../application/use_cases/User/WalletRidePayment";
import { GetDriverReviews } from "../../application/use_cases/DriverReview";
import { DeleteMessageUseCase } from "../../application/use_cases/deleteMessage";

export class BookingController {
  static async bookDriver(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(401)
          .json({ success: false, error: "Unauthorized: User ID is missing." });
        return;
      }

      const {
        driverId,
        fromLocation,
        toLocation,
        startDate,
        endDate,
        estimatedKm,
        bookingType,
      }: BookDriverInput = req.body;

      const bookDriver = container.resolve(BookDriver);

      const booking = await bookDriver.execute({
        userId,
        driverId,
        fromLocation,
        toLocation,
        startDate,
        endDate,
        estimatedKm,
        bookingType,
      });

      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({ success: false, error: "Something went wrong" });
      return;
    }
  }
  static async getEstimatedFare(req: Request, res: Response) {
    try {
      const { bookingType, estimatedKm, startDate, endDate } = req.body;
      console.log("ja");

      const useCase = container.resolve(GetEstimatedFare);
      const fare = await useCase.execute({
        bookingType,
        estimatedKm,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      });

      res.status(200).json({ estimatedFare: fare });
    } catch (error: any) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({ success: false, error: "Something went wrong" });
      return;
    }
  }

  static async getUserBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;

      const useCase = container.resolve(GetUserBookings);
      const { data, total, totalPages } = await useCase.execute(
        userId,
        page,
        limit
      );

      res.status(200).json({ data, total, totalPages });
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  static async attachPaymentIntent(req: Request, res: Response) {
    try {
      const { paymentIntentId, paymentStatus, walletDeduction } = req.body;
      const { rideId } = req.params;
      console.log(req.body, "req.body for attach payment intent");

      const useCase = container.resolve(AttachPaymentIntentIdToBooking);
      await useCase.execute(rideId,walletDeduction, paymentIntentId, paymentStatus);

      res
        .status(200)
        .json({
          success: true,
          message: "PaymentIntent attached successfully",
        });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
  static async updateStatus(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const { status, reason, finalKm } = req.body;
      console.log(req.body);
      if (!status) {
        res
          .status(400)
          .json({ message: "status required for updating status" });
        return;
      }

      if (status === "REJECTED" && !reason) {
        res
          .status(400)
          .json({ message: "Reason is required when rejecting a booking." });
        return;
      }
      if (
        (status === "COMPLETED" && finalKm === undefined) ||
        finalKm === null
      ) {
        res
          .status(400)
          .json({ message: "finalKm is required when completing a booking." });
        return;
      }

      const useCase = container.resolve(UpdateBookingStatus);
      await useCase.execute({ bookingId, status, reason, finalKm });

      res.status(200).json({ message: "Booking status updated successfully" });
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;

      const useCase = container.resolve(GetAllBookings);
      const bookings = await useCase.execute(page, limit);

      res.status(200).json({ bookings });
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      const { bookingId, reason } = req.body;

      if (!bookingId || !reason) {
        res.status(400).json({ message: "bookingId and reason are required" });
        return;
      }

      const updateBookingStatus = container.resolve(CancelBookingInputUseCase);

      await updateBookingStatus.execute({
        bookingId,
        reason,
        status: BookingStatus.CANCELLED,
      });

      res.status(200).json({ message: "Booking cancelled successfully" });
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  static async getChatByBookingId(req: Request, res: Response) {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        res.status(400).json({ message: "Booking ID is required" });
        return;
      }

      const getChatByBookingId = container.resolve(GetMessagesByBookingId);
      const chat = await getChatByBookingId.execute({ bookingId: roomId });

      if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
      }

      res.status(200).json(chat);
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }

  static async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { roomId, messageId } = req.params;

      const deleteMessageUseCase = container.resolve(DeleteMessageUseCase);
      await deleteMessageUseCase.execute(roomId, messageId);

      res.status(HTTP_STATUS_CODES.OK).json({ message: 'Message deleted successfully' });
    } catch (error) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error:ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
    }
  



  static async getRideHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.user?.id!;
      const role = req.user?.role! as "user" | "driver";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;
      const BookingHistory = container.resolve(GetRideHistory);
      const ridehistory = await BookingHistory.execute(role, id, page, limit);
      res.status(200).json(ridehistory);
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }

  static async getChatSignature(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.user?.id!;
      const { fileType } = req.body;
      console.log(req.body)
      const chatMediaSignature = container.resolve(GenerateChatSignedUrl);
      const chatUploadMedia = await chatMediaSignature.execute(fileType, id);
      console.log(chatUploadMedia,'media signurl reach');
      res.status(HTTP_STATUS_CODES.OK).json(chatUploadMedia);
    } catch (error: any) {
      if (error instanceof AuthError) {
        res
          .status(error.statusCode)
          .json({ success: false, error: error.message });
        return;
      }

      console.error("Error fetching user data:", error);
      res.status(500).json({ success: false, error:ERROR_MESSAGES.INTERNAL_SERVER_ERROR});
    }
  }
 static async Walletballence(req: AuthenticatedRequest, res: Response) {
   try {
const userId = req.user?.id;
const walletBallence=container.resolve(WalletBallence);
const ballence=await walletBallence.execute(userId!);
res.status(HTTP_STATUS_CODES.OK).json({ballence})
   } catch (error: any) {
     if (error instanceof AuthError) {
       res
         .status(error.statusCode)
         .json({ success: false, error: error.message });
       return;
     }

     console.error("Error fetching user data:", error);
     res.status(500).json({ success: false, error:ERROR_MESSAGES.INTERNAL_SERVER_ERROR})
    
   }




}

static async WalletPayment(req: AuthenticatedRequest, res: Response) {
   try {
const userId = req.user?.id;
const { rideId, amount } = req.body;
        
const walletPay=container.resolve(WalletPayment );
await walletPay.WalletRidePayment(rideId,userId!,amount)
res.status(HTTP_STATUS_CODES.OK).json({message:"payment successfull"})
   } catch (error: any) {
     if (error instanceof AuthError) {
       res
         .status(error.statusCode)
         .json({ success: false, error: error.message });
       return;
     }

     console.error("Error fetching user data:", error);
     res.status(500).json({ success: false, error:ERROR_MESSAGES.INTERNAL_SERVER_ERROR})
    
   }

 }
static async ReviewDriver(req: AuthenticatedRequest, res: Response) {
try {
const driverId = req.params.id;
console.log(driverId, "driver id");
 const page = parseInt(req.query.page as string) || 1;
 const limit = parseInt(req.query.limit as string) || 2;
  const ReviewDriver = container.resolve(GetDriverReviews );
const reviews = await ReviewDriver.execute(driverId, page, limit);
res.status(HTTP_STATUS_CODES.OK).json(reviews);
} catch (error: any) {
  if (error instanceof AuthError) {
    res
      .status(error.statusCode)
      .json({ success: false, error: error.message });
    return;
  }

  console.error("Error fetching user data:", error);
  res.status(500).json({ success: false, error:ERROR_MESSAGES.INTERNAL_SERVER_ERROR})
  
}


}



}

