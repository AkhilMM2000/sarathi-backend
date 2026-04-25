import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IGenerateSignedUrlUseCase } from "../../application/use_cases/Interfaces/IGenerateSignedUrlUseCase";
import { ZodHelper } from "../schemas/common/ZodHelper";
import { GetSignedUrlSchema } from "../schemas/common/FileRequestDTO";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

@injectable()
export class FileController {
  constructor(
    @inject(USECASE_TOKENS.GENERATE_SIGNED_URL_USECASE)
    private _generateSignedUrlUseCase: IGenerateSignedUrlUseCase
  ) {}

  async getSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. DTO Validation
      const { fileType, fileName } = ZodHelper.validate(GetSignedUrlSchema, req.query);

      // 2. Execute
      const signedUrlResponse = await this._generateSignedUrlUseCase.execute(fileType, fileName);

      return res.status(HTTP_STATUS_CODES.CREATED).json({ signedUrl: signedUrlResponse });
    } catch (error: any) {
      next(error);
    }
  }
}


