import { Router, Request, Response } from "express";
import { container } from "tsyringe";
import { FileController } from "../controllers/FileController";

const router = Router();
const fileController = container.resolve(FileController);

router.get("/signed-url", async (req: Request, res: Response) => {
  await fileController.getSignedUrl(req, res);
});


export default router;
