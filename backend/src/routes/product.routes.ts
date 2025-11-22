import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';

const router = Router();
const productController = new ProductController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/:storeId/products', productController.createProduct);
router.get('/:storeId/products', productController.getProducts);
router.post('/:storeId/products/:id/skus', productController.createSKU);
router.get('/:storeId/products/:id/skus', productController.getSKUs); // Changed to match controller method which gets SKUs for a product

export default router;
