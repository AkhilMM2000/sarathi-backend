import { NextFunction, Request, Response } from "express";
import { container, inject, injectable } from "tsyringe";
import { BookDriver, BookDriverInput } from "../../application/use_cases/User/BookDriver";
import { AuthError } from "../../domain/errors/Autherror";

import { AuthenticatedRequest } from "../../middleware/authMiddleware";

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

import { WalletPayment } from "../../application/use_cases/User/WalletRidePayment";
import { GetDriverReviews } from "../../application/use_cases/DriverReview";
import { DeleteMessageUseCase } from "../../application/use_cases/deleteMessage";

import { GetBookingStatusSummary } from "../../application/use_cases/Driver/GetBookingStatusSummary";
import { GetDriverEarningsSummary } from "../../application/use_cases/Driver/GetMonthlyEarningsReport";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IBookDriverUseCase } from "../../application/use_cases/User/interfaces/IBookDriverUseCase";
import { IGetEstimatedFare } from "../../application/use_cases/User/interfaces/IGetEstimatedFare";
import { IGetUserBookingsUseCase } from "../../application/use_cases/User/interfaces/IGetUserBookingsUseCase";
import { IAttachPaymentIntentIdToBookingUseCase } from "../../application/use_cases/User/interfaces/IAttachPaymentIntentIdToBookingUseCase";
@injectable()
export class BookingController {

   constructor(
 @inject(USECASE_TOKENS.BOOK_DRIVER_USECASE)
private bookDriverUseCase: IBookDriverUseCase,
  @inject(USECASE_TOKENS.GET_ESTIMATED_FARE_USECASE)
    private getEstimatedFareUseCase: IGetEstimatedFare,
  @inject(USECASE_TOKENS.IGET_USER_BOOKINGS_USECASE)
    private getUserBookingsUseCase: IGetUserBookingsUseCase,
    @inject(USECASE_TOKENS.ATTACH_PAYMENT_INTENT_USECASE)
  private attachPaymentIntentUseCase: IAttachPaymentIntentIdToBookingUseCase
   ){}
   async bookDriver(req: AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
       
    
        throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.UNAUTHORIZED)
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

     

      const booking = await this.bookDriverUseCase.execute({
        userId,
        driverId,
        fromLocation,
        toLocation,
        startDate,
        endDate,
        estimatedKm,
        bookingType,
      });

      res.status(HTTP_STATUS_CODES.CREATED).json({ success: true, data: booking });
    } catch (error: any) {
       next(error)
       
    }
  }
  async getEstimatedFare(req: Request, res: Response,next:NextFunction) {
    try {
      const { bookingType, estimatedKm, startDate, endDate } = req.body;
      
      const fare = await this.getEstimatedFareUseCase.execute({
        bookingType,
        estimatedKm,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      });

      res.status(HTTP_STATUS_CODES.OK).json({ estimatedFare: fare });
    } catch (error: any) {
       next(error)
    }
  }

   async getUserBookings(req: AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
      
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;

     ;
      const { data, total, totalPages } = await this.getUserBookingsUseCase.execute(
        userId,
        page,
        limit
      );

      res.status(HTTP_STATUS_CODES.OK).json({ data, total, totalPages });
    } catch (error: any) {
      next(error)
    }
  }

   async attachPaymentIntent(req: AuthenticatedRequest, res: Response,next:NextFunction) {
    try {
      const { paymentIntentId, paymentStatus, walletDeduction } = req.body;
      const { rideId } = req.params;
     
 const userId = req.user?.id;
      if (!userId) {
      
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
      }
    
      
await this.attachPaymentIntentUseCase.execute(rideId,walletDeduction, paymentIntentId, paymentStatus,userId);

      res
        .status(HTTP_STATUS_CODES.OK)
        .json({
          success: true,
          message: "PaymentIntent attached successfully",
        });
    } catch (error) {
     next(error)
    }
  }

  
  static async updateStatus(req: Request, res: Response,next:NextFunction) {
    try {
      const { bookingId } = req.params;
      const { status, reason, finalKm } = req.body;
      console.log(req.body);
      if (!status) {
      
       throw new AuthError("status required for updating status" ,HTTP_STATUS_CODES.BAD_REQUEST)
      }

      if (status === "REJECTED" && !reason) {
    
     throw new AuthError( "Reason is required when rejecting a booking.",HTTP_STATUS_CODES.BAD_REQUEST)
      }
      if (
        (status === "COMPLETED" && finalKm === undefined) ||
        finalKm === null
      ) {
    
         throw new AuthError( "finalKm is required when completing a booking.",HTTP_STATUS_CODES.BAD_REQUEST)
      }

      const useCase = container.resolve(UpdateBookingStatus);
      await useCase.execute({ bookingId, status, reason, finalKm });

      res.status(HTTP_STATUS_CODES.OK).json({ message: "Booking status updated successfully" });
    } catch (error: any) {
      next(error)
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
static async getDriverBookingStatusSummary (req:AuthenticatedRequest, res: Response) {
  try {
 
   const driverId = req.user?.id;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;

    const useCase = container.resolve(GetBookingStatusSummary);
    const result = await useCase.execute(driverId!, year, month);
    res.status(HTTP_STATUS_CODES.OK).json(result);
  } catch (error: any) {
   if (error instanceof AuthError) {
    res
      .status(error.statusCode)
      .json({ success: false, error: error.message });
    return;
  }

  console.error("Error fetching getDriverBookingStatusSummary", error);
  res.status(500).json({ success: false, error:ERROR_MESSAGES.INTERNAL_SERVER_ERROR})
  }
};

static async  getDriverEarningsByMonth  (req:AuthenticatedRequest, res: Response){
  try {
 
   const driverId = req.user?.id;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;

    const useCase = container.resolve(GetDriverEarningsSummary);
    const result = await useCase.execute(driverId!, year, month);
    res.status(HTTP_STATUS_CODES.OK).json(result);
  } catch (error: any) {
   if (error instanceof AuthError) {
    res
      .status(error.statusCode)
      .json({ success: false, error: error.message });
    return;
  }

  console.error("Error fetching getDriverEarningsByMonth ", error);
  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, error:ERROR_MESSAGES.INTERNAL_SERVER_ERROR})
  }
};


}

