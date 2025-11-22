import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';

const router = Router();
const invoiceController = new InvoiceController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/:storeId/invoices', invoiceController.createInvoice);
router.get('/:storeId/invoices', invoiceController.getInvoices);
router.get('/:storeId/invoices/:id', invoiceController.getInvoice);
router.get('/:storeId/invoices/:id/print', invoiceController.printInvoice);

export default router;
