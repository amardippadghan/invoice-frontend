import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import { config } from '../config';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcldxojxr',
    api_key: process.env.CLOUDINARY_API_KEY || "568441887958499",
    api_secret: process.env.CLOUDINARY_API_SECRET || "ehov9wewLuf13vOhgo4hWhTuJ8U",
});

export interface IImageService {
    uploadMiddleware(): any;
    handleUpload(req: Request): Promise<string>;
}

export class CloudinaryImageService implements IImageService {
    private upload: multer.Multer;

    constructor() {
        // Use memory storage or temp file storage for multer
        // Cloudinary needs a file path or buffer. 
        // Using diskStorage to get a path is easiest for the uploader method.
        this.upload = multer({ dest: 'uploads/' });
    }

    uploadMiddleware() {
        return this.upload.single('image');
    }

    async handleUpload(req: Request): Promise<string> {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'invoice-app',
            });

            // Clean up local file
            fs.unlinkSync(req.file.path);

            return result.secure_url;
        } catch (error) {
            // Clean up on error too
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            throw error;
        }
    }
}
