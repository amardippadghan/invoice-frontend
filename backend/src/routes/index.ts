import { Router } from 'express';
import authRoutes from './auth.routes';
import storeRoutes from './store.routes';
import productRoutes from './product.routes';
import invoiceRoutes from './invoice.routes';
import customerRoutes from './customer.routes';
import uploadRoutes from './upload.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Store related routes
router.use('/stores', storeRoutes);
router.use('/stores', productRoutes);
router.use('/stores', invoiceRoutes);
router.use('/stores', customerRoutes);

// Analytics routes
router.use('/stores/:storeId/analytics', analyticsRoutes);

export default router;
