import express from "express";
import { container } from "tsyringe";
import { GoogleauthController} from "../controllers/googleAuthController";

const router = express.Router();
const controller = container.resolve(GoogleauthController);

router.post("/google-signin", controller.googleAuth);


export default router;
