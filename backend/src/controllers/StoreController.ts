import { Request, Response, NextFunction } from 'express';
import { StoreService } from '../services/StoreService';

const storeService = new StoreService();

export class StoreController {
    async getStore(req: Request, res: Response, next: NextFunction) {
        try {
            const storeId = req.params.id;
            const store = await storeService.getStore(storeId);
            if (!store) {
                return res.status(404).json({ success: false, message: 'Store not found' });
            }
            res.status(200).json({ success: true, data: store });
        } catch (error) {
            next(error);
        }
    }
}
