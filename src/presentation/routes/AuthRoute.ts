import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { container } from 'tsyringe';
import { TOKENS } from '../../constants/Tokens';
const router = express.Router();
export const authController=container.resolve<AuthController>(TOKENS.AUTH_CONTROLLER)  
router  
  .post('/refresh-token', authController.refreshToken.bind(authController))
  .post('/forgot-password', authController.forgotPassword.bind(authController))  
  .post('/reset-password',authController.resetPassword.bind(authController))
  .patch('/change-password',authController.ChangePassword.bind(authController))
   .post('/logout',authController.logout.bind(authController))
export default router;
