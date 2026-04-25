"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSignedUrlSchema = void 0;
const zod_1 = require("zod");
/**
 * Get Signed URL Request Schema (Query Params)
 */
exports.GetSignedUrlSchema = zod_1.z.object({
    fileType: zod_1.z.string().min(1, "File type is required"),
    fileName: zod_1.z.string().min(1, "File name is required"),
});
//# sourceMappingURL=FileRequestDTO.js.map