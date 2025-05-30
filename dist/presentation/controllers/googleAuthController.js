"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleauthController = void 0;
const tsyringe_1 = require("tsyringe");
const googleAuth_1 = require("../../application/use_cases/Auth/googleAuth");
const Autherror_1 = require("../../domain/errors/Autherror");
class GoogleauthController {
    static async googleAuth(req, res) {
        try {
            console.log(req.body);
            const { googleToken, role } = req.body;
            if (!googleToken) {
                res.status(400).json({ message: "Google token is required!" });
            }
            const googleUseCase = tsyringe_1.container.resolve(googleAuth_1.GoogleAuthUseCase);
            const { accessToken, refreshToken, success } = await googleUseCase.execute(googleToken, role);
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
        }
        catch (error) {
            if (error instanceof Autherror_1.AuthError) {
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
exports.GoogleauthController = GoogleauthController;
//# sourceMappingURL=googleAuthController.js.map