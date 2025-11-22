import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';

const router = Router();
const storeController = new StoreController();

// Public or Protected? Usually protected or public depending on use case.
// For now, let's make it protected to verify tenant access, or public if we want to fetch store info by ID.
// Requirement says "GET /api/stores/:id".
router.get('/:id', storeController.getStore);

export default router;
