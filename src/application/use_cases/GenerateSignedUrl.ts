import { injectable, inject } from "tsyringe";
import { IFileStorageService } from "../../domain/services/IFileStorageService";

@injectable()
export class GenerateSignedUrl {
  constructor(
    @inject("IFileStorageService") private fileStorageService: IFileStorageService
  ) {}

  async execute(fileType: string, fileName: string) {
    if (!fileType || !fileName) {
      throw new Error("File type and file name are required");
    }

    return this.fileStorageService.getSignedUrl(fileType, fileName);
  }
}
