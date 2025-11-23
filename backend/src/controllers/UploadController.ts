import { Request, Response, NextFunction } from 'express';
import { CloudinaryImageService } from '../services/ImageService';

const imageService = new CloudinaryImageService();

export class UploadController {
    getMiddleware() {
        return imageService.uploadMiddleware();
    }

    async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            const imageUrl = await imageService.handleUpload(req);
            res.status(200).json({ success: true, url: imageUrl });
        } catch (error) {
            next(error);
        }
    }
}
