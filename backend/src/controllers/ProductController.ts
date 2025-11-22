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
}
