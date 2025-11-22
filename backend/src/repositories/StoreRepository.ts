import Store, { IStore } from '../models/Store';

export class StoreRepository {
    async create(data: Partial<IStore>): Promise<IStore> {
        return await Store.create(data);
    }

    async findById(id: string): Promise<IStore | null> {
        return await Store.findById(id);
    }

    async findBySlug(slug: string): Promise<IStore | null> {
        return await Store.findOne({ slug });
    }

    async findAll(): Promise<IStore[]> {
        return await Store.find();
    }
}
