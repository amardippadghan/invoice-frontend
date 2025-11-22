import Product, { IProduct } from '../models/Product';

export class ProductRepository {
    async create(data: Partial<IProduct>): Promise<IProduct> {
        return await Product.create(data);
    }

    async findByStore(storeId: string): Promise<IProduct[]> {
        return await Product.find({ store: storeId });
    }

    async findById(storeId: string, id: string): Promise<IProduct | null> {
        return await Product.findOne({ _id: id, store: storeId });
    }
}
