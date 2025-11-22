import { StoreRepository } from '../repositories/StoreRepository';

const storeRepository = new StoreRepository();

export class StoreService {
    async getStore(id: string) {
        return await storeRepository.findById(id);
    }

    async updateStore(id: string, data: any) {
        const store = await storeRepository.findById(id);
        if (!store) throw new Error('Store not found');

        Object.assign(store, data);
        return await store.save();
    }
}
