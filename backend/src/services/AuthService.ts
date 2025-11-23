import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Need to install bcrypt
import { UserRepository } from '../repositories/UserRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { config } from '../config';

const userRepository = new UserRepository();
const storeRepository = new StoreRepository();

export class AuthService {
    async register(data: any) {
        // 1. Create Store
        const store = await storeRepository.create({
            name: data.storeName,
            slug: data.storeSlug,
            currency: data.currency,
        });

        // 2. Hash Password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(data.password, saltRounds);

        // 3. Create User
        const user = await userRepository.create({
            store: store._id as any,
            name: data.userName,
            email: data.email,
            passwordHash,
            role: 'owner',
        });

        // 4. Generate Token
        const token = jwt.sign(
            { userId: user._id, storeId: store._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '1d' }
        );

        return { user, store, token };
    }

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        if (!user.passwordHash) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user._id, storeId: user.store, role: user.role },
            config.jwtSecret,
            { expiresIn: '1d' }
        );

        return {
            user,
            token,
            storeId: user.store.toString()
        };
    }
}
