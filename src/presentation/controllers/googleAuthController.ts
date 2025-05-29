import { Request, Response } from "express";
import { container } from "tsyringe";
import { GoogleAuthUseCase } from "../../application/use_cases/Auth/googleAuth";
import { AuthError } from "../../domain/errors/Autherror";

export class GoogleauthController {
  static async googleAuth(req: Request, res: Response) {
    try {
   
console.log(req.body);

      const { googleToken, role } = req.body;
      if (!googleToken) {
         res.status(400).json({ message: "Google token is required!" });
      }

      const googleUseCase = container.resolve(GoogleAuthUseCase);
      const {accessToken,refreshToken ,success} = await googleUseCase.execute(
        googleToken,
        role
      );
      const refreshTokenKey = `${role}RefreshToken`;
      res.cookie(refreshTokenKey, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        accessToken,
        role,
        success
      });
    } catch (error) {
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
}
