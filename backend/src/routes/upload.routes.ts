import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const uploadController = new UploadController();

router.post('/', authMiddleware, uploadController.getMiddleware(), uploadController.uploadImage);

export default router;
