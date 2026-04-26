import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { GoogleAuthUseCase } from "../../application/use_cases/Auth/googleAuth";
import { catchAsync } from "../../infrastructure/utils/catchAsync";
import { container } from "tsyringe";

@injectable()
export class GoogleauthController {
  googleAuth = catchAsync(async (req: Request, res: Response) => {
    const { googleToken, role } = req.body;
    
    if (!googleToken) {
      res.status(400).json({ message: "Google token is required!" });
      return;
    }

    const googleUseCase = container.resolve(GoogleAuthUseCase);
    const { accessToken, refreshToken, success } = await googleUseCase.execute(
      googleToken,
      role
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
      role,
      success
    });
  });
}
