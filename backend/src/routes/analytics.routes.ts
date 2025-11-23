import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/stats', authMiddleware, analyticsController.getDashboardStats);
router.get('/sales-chart', authMiddleware, analyticsController.getSalesChart);
router.get('/top-products', authMiddleware, analyticsController.getTopProducts);

export default router;
