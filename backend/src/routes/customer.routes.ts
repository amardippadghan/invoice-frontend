import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';

const router = Router();
const customerController = new CustomerController();

// Apply authentication and tenant middlewares
router.use(authMiddleware);
router.use(tenantMiddleware);

// Customer CRUD routes
router.post('/:storeId/customers', customerController.createCustomer);
router.get('/:storeId/customers', customerController.getCustomers);
router.get('/:storeId/customers/:id', customerController.getCustomerById);
router.put('/:storeId/customers/:id', customerController.updateCustomer);
router.delete('/:storeId/customers/:id', customerController.deleteCustomer);

// Customer invoices route
router.get('/:storeId/customers/:id/invoices', customerController.getCustomerInvoices);

export default router;

