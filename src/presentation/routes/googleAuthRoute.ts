import express, { RequestHandler } from "express";
import { GoogleauthController} from "../controllers/googleAuthController";

const router = express.Router();

router.post("/google-signin", GoogleauthController.googleAuth as RequestHandler);


export default router;
