import mongoose from 'mongoose';
import { config } from '../config';
import { StoreRepository } from '../repositories/StoreRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { SKURepository } from '../repositories/SKURepository';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { InvoiceService } from '../services/InvoiceService';

const seed = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing data (optional, be careful in prod)
        // await mongoose.connection.db.dropDatabase();

        const storeRepo = new StoreRepository();
        const userRepo = new UserRepository();
        const productRepo = new ProductRepository();
        const skuRepo = new SKURepository();
        const customerRepo = new CustomerRepository();
        const invoiceService = new InvoiceService();

        // 1. Create Store
        const store = await storeRepo.create({
            name: 'Demo Store',
            slug: 'demo-store',
            currency: 'USD',
        });
        console.log('Store created:', store.name);

        // 2. Create Users
        const owner = await userRepo.create({
            store: store._id as any,
            name: 'Owner User',
            email: 'owner@demo.com',
            passwordHash: 'password', // Plain text for demo
            role: 'owner',
        });
        console.log('Owner created:', owner.email);

        // 3. Create Products & SKUs
        const product1 = await productRepo.create({
            store: store._id as any,
            name: 'T-Shirt',
            type: 'physical',
            taxRate: 10,
        });

        const sku1 = await skuRepo.create({
            store: store._id as any,
            product: product1._id as any,
            sku: 'TS-BLK-L',
            price: 20,
            stock: 100,
        });

        const product2 = await productRepo.create({
            store: store._id as any,
            name: 'E-Book',
            type: 'digital',
            taxRate: 0,
        });

        const sku2 = await skuRepo.create({
            store: store._id as any,
            product: product2._id as any,
            sku: 'EB-001',
            price: 15,
        });
        console.log('Products created');

        // 4. Create Customers
        const customer = await customerRepo.create({
            store: store._id as any,
            name: 'John Doe',
            email: 'john@example.com',
        });
        console.log('Customer created:', customer.name);

        // 5. Create Invoice
        const invoice = await invoiceService.createInvoice(store._id.toString(), {
            customerId: customer._id.toString(),
            items: [
                { skuId: sku1._id.toString(), quantity: 2 },
                { skuId: sku2._id.toString(), quantity: 1 },
            ],
        });
        console.log('Invoice created:', invoice.invoiceNumber);

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
