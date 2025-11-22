import { ProductRepository } from '../repositories/ProductRepository';
import { SKURepository } from '../repositories/SKURepository';

const productRepository = new ProductRepository();
const skuRepository = new SKURepository();

export class ProductService {
    async createProduct(storeId: string, data: any) {
        return await productRepository.create({ ...data, store: storeId });
    }

    async getProducts(storeId: string) {
        const products = await productRepository.findByStore(storeId);

        // Fetch SKUs for each product
        const productsWithSkus = await Promise.all(
            products.map(async (product) => {
                const skus = await skuRepository.findByProduct(storeId, product._id.toString());
                return {
                    ...product.toObject(),
                    skus
                };
            })
        );

        return productsWithSkus;
    }

    async createSKU(storeId: string, productId: string, data: any) {
        return await skuRepository.create({ ...data, store: storeId, product: productId });
    }

    async getSKUs(storeId: string, productId: string) {
        return await skuRepository.findByProduct(storeId, productId);
    }
}
