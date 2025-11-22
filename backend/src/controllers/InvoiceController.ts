import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/InvoiceService';
import { AuthRequest } from '../middlewares/auth.middleware';

const invoiceService = new InvoiceService();

export class InvoiceController {
    async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const result = await invoiceService.createInvoice(storeId, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const result = await invoiceService.getInvoices(storeId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getInvoice(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const invoiceId = req.params.id;
            const result = await invoiceService.getInvoice(storeId, invoiceId);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Invoice not found' });
            }
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async printInvoice(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const invoiceId = req.params.id;
            const invoice = await invoiceService.getInvoice(storeId, invoiceId);

            if (!invoice) {
                return res.status(404).json({ success: false, message: 'Invoice not found' });
            }

            // In a real app, fetch store name from StoreService
            const storeName = 'My Store'; // Placeholder

            // Dynamic import to avoid circular dependency issues if any, or just standard import
            const { generateInvoicePDF } = await import('../utils/pdfGenerator');
            const pdfBuffer = await generateInvoicePDF(invoice, storeName);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    async getCustomerInvoices(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const customerId = req.params.customerId;
            const result = await invoiceService.getCustomerInvoices(storeId, customerId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updatePayment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const storeId = req.headers['x-store-id'] as string;
            const invoiceId = req.params.id;
            const { paidAmount } = req.body;
            const result = await invoiceService.updatePayment(storeId, invoiceId, paidAmount);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
