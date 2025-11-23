import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { AuthRequest } from '../middlewares/auth.middleware';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
    async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const result = await analyticsService.getDashboardStats(storeId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getSalesChart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const result = await analyticsService.getSalesChart(storeId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getTopProducts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const result = await analyticsService.getTopProducts(storeId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
