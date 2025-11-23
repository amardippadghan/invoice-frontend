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

    async update(storeId: string, id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        return await Product.findOneAndUpdate(
            { _id: id, store: storeId },
            data,
            { new: true }
        );
    }

    async delete(storeId: string, id: string): Promise<IProduct | null> {
        return await Product.findOneAndDelete({ _id: id, store: storeId });
    }
}
