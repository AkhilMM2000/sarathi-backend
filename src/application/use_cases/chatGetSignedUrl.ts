import { injectable, inject } from "tsyringe";
import { IFileStorageService } from "../../domain/services/IFileStorageService";
import { AuthError } from "../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

@injectable()
export class GenerateChatSignedUrl {
  constructor(
    @inject("IFileStorageService") private fileStorageService: IFileStorageService
  ) {}

  async execute(fileType: string,userId:string) {
    if (!fileType || !userId) {
      throw new AuthError("File type and userId are requires",HTTP_STATUS_CODES.BAD_REQUEST);
    }

    return this.fileStorageService.chatSignedUrl(fileType,userId)
  }
}
