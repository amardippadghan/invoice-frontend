import { Request, Response, NextFunction } from 'express';
import { CustomerRepository } from '../repositories/CustomerRepository';

const customerRepository = new CustomerRepository();

export class CustomerController {
    // Create a new customer for a store
    async createCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            const { storeId } = req.params;
            const customer = await customerRepository.create({ ...req.body, store: storeId });
            res.status(201).json({ success: true, data: customer });
        } catch (error) {
            next(error);
        }
    }

    // Get all customers for a store
    async getCustomers(req: Request, res: Response, next: NextFunction) {
        try {
            const { storeId } = req.params;
            const customers = await customerRepository.findByStore(storeId);
            res.status(200).json({ success: true, data: customers });
        } catch (error) {
            next(error);
        }
    }

    // Get a single customer by ID
    async getCustomerById(req: Request, res: Response, next: NextFunction) {
        try {
            const { storeId, id } = req.params;
            const customer = await customerRepository.findById(storeId, id);
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }
            res.status(200).json({ success: true, data: customer });
        } catch (error) {
            next(error);
        }
    }
}
