import { Router, Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { FileController } from "../controllers/FileController";

const router = Router();
const fileController = container.resolve(FileController);

router.get("/signed-url", (req: Request, res: Response, next: NextFunction) => {
  fileController.getSignedUrl(req, res, next);
});

export default router;
