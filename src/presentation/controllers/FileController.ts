

 import { Request, Response } from "express";
import { container } from "tsyringe";
 import { GenerateSignedUrl } from "../../application/use_cases/GenerateSignedUrl";


export class FileController {
 

 async getSignedUrl(req: Request, res: Response) {
    try {
      const { fileType, fileName } = req.query;


      if (!fileType || !fileName) {
        return res.status(400).json({ message: "File type and file name are required" });
      }

      const SignedUrl = container.resolve(GenerateSignedUrl);
      const signedUrl = await SignedUrl.execute(fileType as string, fileName as string);
      console.log(signedUrl);
      
      return res.status(201).json({ signedUrl });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Failed to generate signed URL" });
    }
  }
 
}

// import { Request, Response } from "express";
// import { autoInjectable } from "tsyringe";
// import { GenerateSignedUrl } from "../../application/use_cases/GenerateSignedUrl";

// @autoInjectable()
// export class FileController {
//   constructor(private generateSignedUrl?: GenerateSignedUrl) {}

//   async getSignedUrl(req: Request, res: Response) {
//     try {
//       const { fileType, fileName } = req.query;

//       if (!fileType || !fileName) {
//         return res.status(400).json({ message: "File type and file name are required" });
//       }

//       const signedUrl = await this.generateSignedUrl!.execute(fileType as string, fileName as string);
//       return res.json({ signedUrl });
//     } catch (error: any) {
//       return res.status(500).json({ message: error.message || "Failed to generate signed URL" });
//     }
//   }
// }




// import { Request, Response } from "express";

// import { GenerateSignedUrl } from "../../application/use_cases/GenerateSignedUrl";
// import { container } from "tsyringe";


// export class FileController {
 

//   static async getSignedUrl(req: Request, res: Response) {
//     try {
//       const { fileType, fileName } = req.query;

//       if (!fileType || !fileName) {
//         return res.status(400).json({ message: "File type and file name are required" });
//       }
//   const SignedUrl = container.resolve(GenerateSignedUrl);
//       const signedUrl = await SignedUrl.execute(fileType as string, fileName as string);
//       return res.status(201).json({ signedUrl });
//     } catch (error: any) {
//       return res.status(500).json({ message: error.message || "Failed to generate signed URL" });
//     }
//   }
// }
