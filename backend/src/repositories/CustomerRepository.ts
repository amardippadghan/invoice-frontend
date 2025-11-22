import Customer, { ICustomer } from '../models/Customer';

export class CustomerRepository {
    async create(data: Partial<ICustomer>): Promise<ICustomer> {
        return await Customer.create(data);
    }

    async findByStore(storeId: string): Promise<ICustomer[]> {
        return await Customer.find({ store: storeId });
    }

    async findById(storeId: string, id: string): Promise<ICustomer | null> {
        return await Customer.findOne({ _id: id, store: storeId });
    }
}
