import Invoice, { IInvoice } from '../models/Invoice';

export class InvoiceRepository {
    async create(data: Partial<IInvoice>): Promise<IInvoice> {
        return await Invoice.create(data);
    }

    async findByStore(storeId: string): Promise<IInvoice[]> {
        return await Invoice.find({ store: storeId });
    }

    async findById(storeId: string, id: string): Promise<IInvoice | null> {
        return await Invoice.findOne({ _id: id, store: storeId });
    }

    async findByInvoiceNumber(storeId: string, invoiceNumber: string): Promise<IInvoice | null> {
        return await Invoice.findOne({ store: storeId, invoiceNumber });
    }

    async findByCustomer(storeId: string, customerId: string): Promise<IInvoice[]> {
        return await Invoice.find({ store: storeId, customer: customerId }).sort({ createdAt: -1 });
    }

    async updatePayment(storeId: string, invoiceId: string, paymentData: { paidAmount: number; dueAmount: number; paymentStatus: string }): Promise<IInvoice | null> {
        return await Invoice.findOneAndUpdate(
            { _id: invoiceId, store: storeId },
            { $set: paymentData },
            { new: true }
        );
    }
}
