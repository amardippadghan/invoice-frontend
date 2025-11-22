import { Router } from 'express';
import authRoutes from './auth.routes';
import storeRoutes from './store.routes';
import productRoutes from './product.routes';
import invoiceRoutes from './invoice.routes';
import customerRoutes from './customer.routes';
import { InvoiceController } from '../controllers/InvoiceController';
const invoiceController = new InvoiceController();

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Store related routes
router.use('/stores', storeRoutes);
router.use('/stores', productRoutes);
router.use('/stores', invoiceRoutes);
router.use('/stores', customerRoutes);

// Additional custom routes
router.get('/stores/customers/:customerId/invoices', invoiceController.getCustomerInvoices);
router.put('/stores/invoices/:id/payment', invoiceController.updatePayment);

export default router;
