import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { AuthRequest } from '../middlewares/auth.middleware';

const productService = new ProductService();

export class ProductController {
    async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const result = await productService.createProduct(storeId, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getProducts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const result = await productService.getProducts(storeId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getProductById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const productId = req.params.id;
            const result = await productService.getProductById(storeId, productId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const productId = req.params.id;
            const result = await productService.updateProduct(storeId, productId, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const productId = req.params.id;
            await productService.deleteProduct(storeId, productId);
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async createSKU(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const productId = req.params.id;
            const result = await productService.createSKU(storeId, productId, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getSKUs(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const productId = req.params.id;
            const result = await productService.getSKUs(storeId, productId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateSKU(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const productId = req.params.id;
            const skuId = req.params.skuId;
            const result = await productService.updateSKU(storeId, productId, skuId, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
