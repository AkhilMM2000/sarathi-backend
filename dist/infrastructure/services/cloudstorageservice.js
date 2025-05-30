"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryFileStorageService = void 0;
const tsyringe_1 = require("tsyringe");
const cloudinary_1 = require("cloudinary");
const crypto_1 = __importDefault(require("crypto"));
const Autherror_1 = require("../../domain/errors/Autherror");
const HttpStatusCode_1 = require("../../constants/HttpStatusCode");
let CloudinaryFileStorageService = class CloudinaryFileStorageService {
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    async getSignedUrl(fileType, userId) {
        try {
            // ✅ Validate file type (only allow specific formats)
            if (!['image/png', 'image/jpeg', 'application/pdf'].includes(fileType)) {
                throw new Error("Invalid file type");
            }
            // ✅ Generate secure random filename
            const timestamp = Math.round(new Date().getTime() / 1000);
            const randomString = crypto_1.default.randomBytes(8).toString('hex');
            const publicId = `uploads/${userId}-${randomString}-${timestamp}`;
            // const transformation = "c_fill,w_600,h_600"; 
            // ✅ Dynamically assign folder based on file type
            const folder = fileType.startsWith('image/') ? 'images' : 'documents';
            // ✅ Generate a secure signature
            const signature = cloudinary_1.v2.utils.api_sign_request({ folder, public_id: publicId, timestamp }, process.env.CLOUDINARY_API_SECRET);
            return { public_id: publicId, timestamp, signature, folder };
        }
        catch (error) {
            throw new Error("Failed to generate signed URL for upload");
        }
    }
    async chatSignedUrl(fileType, userId) {
        try {
            const allowedTypes = [
                'image', 'pdf', 'doc'
            ];
            if (!allowedTypes.includes(fileType)) {
                throw new Autherror_1.AuthError("Invalid file type", HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
            }
            const timestamp = Math.round(new Date().getTime() / 1000);
            const randomString = crypto_1.default.randomBytes(8).toString('hex');
            const publicId = `uploads/${userId}-${randomString}-${timestamp}`;
            const isImage = fileType.startsWith('image/');
            const resourceType = isImage ? 'image' : 'raw';
            const folder = isImage ? 'images' : 'documents';
            const upload_preset = 'ml_default'; // ✅ you’re using this in frontend
            const signature = cloudinary_1.v2.utils.api_sign_request({
                folder,
                public_id: publicId,
                timestamp,
                upload_preset, // important to sign this if using signed uploads
            }, process.env.CLOUDINARY_API_SECRET);
            return { public_id: publicId, timestamp, signature, folder, resource_type: resourceType, upload_preset };
        }
        catch (error) {
            throw new Autherror_1.AuthError("Failed to generate signed URL for upload", HttpStatusCode_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CloudinaryFileStorageService = CloudinaryFileStorageService;
exports.CloudinaryFileStorageService = CloudinaryFileStorageService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryFileStorageService);
//# sourceMappingURL=cloudstorageservice.js.map