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
router.get('/:storeId/products/:id', productController.getProductById);
router.put('/:storeId/products/:id', productController.updateProduct);
router.delete('/:storeId/products/:id', productController.deleteProduct);

router.post('/:storeId/products/:id/skus', productController.createSKU);
router.get('/:storeId/products/:id/skus', productController.getSKUs);
router.put('/:storeId/products/:id/skus/:skuId', productController.updateSKU);

export default router;
