import User, { IUser } from '../models/User';

export class UserRepository {
    async create(data: Partial<IUser>): Promise<IUser> {
        return await User.create(data);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    async findByStore(storeId: string): Promise<IUser[]> {
        return await User.find({ store: storeId });
    }
}
