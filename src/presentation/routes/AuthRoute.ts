import express from 'express';
import { AuthController } from '../controllers/AuthController';
const router = express.Router();

router  
  .post('/refresh-token', AuthController.refreshToken)  
  .post('/forgot-password', AuthController.forgotPassword)  
  .post('/reset-password', AuthController.resetPassword)
  .patch('/change-password',AuthController.ChangePassword)
   .post('/logout',AuthController.logout)
export default router;
