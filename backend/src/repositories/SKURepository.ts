import SKU, { ISKU } from '../models/SKU';

export class SKURepository {
    async create(data: Partial<ISKU>): Promise<ISKU> {
        return await SKU.create(data);
    }

    async findByProduct(storeId: string, productId: string): Promise<ISKU[]> {
        return await SKU.find({ store: storeId, product: productId });
    }

    async findById(storeId: string, id: string): Promise<ISKU | null> {
        return await SKU.findOne({ _id: id, store: storeId });
    }

    async findBySkuCode(storeId: string, sku: string): Promise<ISKU | null> {
        return await SKU.findOne({ store: storeId, sku });
    }

    async updateStock(storeId: string, skuId: string, newStock: number): Promise<ISKU | null> {
        return await SKU.findOneAndUpdate(
            { _id: skuId, store: storeId },
            { stock: newStock },
            { new: true }
        );
    }

    async update(storeId: string, id: string, data: Partial<ISKU>): Promise<ISKU | null> {
        return await SKU.findOneAndUpdate(
            { _id: id, store: storeId },
            data,
            { new: true }
        );
    }

    async deleteByProduct(storeId: string, productId: string): Promise<any> {
        return await SKU.deleteMany({ store: storeId, product: productId });
    }
}
