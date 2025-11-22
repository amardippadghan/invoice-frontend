import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const tenantMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const storeId = req.headers['x-store-id'] || req.user?.storeId;

    if (!storeId) {
        return res.status(400).json({ success: false, message: 'Store ID is required' });
    }

    // Attach storeId to request for easy access
    req.headers['x-store-id'] = storeId as string;

    next();
};
