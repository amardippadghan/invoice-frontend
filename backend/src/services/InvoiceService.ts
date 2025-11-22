import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { SKURepository } from '../repositories/SKURepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { ISKU } from '../models/SKU';

const invoiceRepository = new InvoiceRepository();
const skuRepository = new SKURepository();
const productRepository = new ProductRepository();

export class InvoiceService {
    async createInvoice(storeId: string, data: any) {
        const { customerId, items, currency } = data;

        let subTotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        const lineItems: any[] = [];

        for (const item of items) {
            const sku = await skuRepository.findById(storeId, item.skuId) as ISKU;
            if (!sku) throw new Error(`SKU not found: ${item.skuId}`);

            const product = await productRepository.findById(storeId, sku.product.toString());
            if (!product) throw new Error(`Product not found for SKU: ${item.skuId}`);

            // Check stock availability
            const currentStock = sku.stock ?? 0;
            if (currentStock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name} (${sku.sku}). Available: ${currentStock}, Requested: ${item.quantity}`);
            }

            const unitPrice = sku.price;
            const quantity = item.quantity;
            const taxRate = product.taxRate || 0;

            const lineSubtotal = unitPrice * quantity;
            const taxAmount = lineSubtotal * (taxRate / 100);
            const discountAmount = item.discount || 0;
            const lineTotal = lineSubtotal + taxAmount - discountAmount;

            subTotal += lineSubtotal;
            totalTax += taxAmount;
            totalDiscount += discountAmount;

            lineItems.push({
                sku: sku._id,
                title: product.name + (sku.sku ? ` (${sku.sku})` : ''),
                description: product.description,
                quantity,
                unitPrice,
                taxRate,
                taxAmount,
                discountAmount,
                total: lineTotal,
            });

            // Reduce stock
            await skuRepository.updateStock(storeId, item.skuId, currentStock - quantity);
        }

        const shippingAmount = data.shippingAmount || 0;
        const adjustments = data.adjustments || 0;
        const total = subTotal + totalTax + shippingAmount + adjustments - totalDiscount;

        // Generate Invoice Number (Simple auto-increment or random for now)
        // In real app, use a counter collection per store
        const invoiceNumber = `INV-${Date.now()}`;

        return await invoiceRepository.create({
            store: storeId as any,
            customer: customerId,
            invoiceNumber,
            currency: currency || 'INR',
            status: 'draft',
            lineItems,
            subTotal,
            totalTax,
            totalDiscount,
            shippingAmount,
            adjustments,
            total,
            paidAmount: 0,
            dueAmount: total,
            paymentStatus: 'unpaid',
            issuedAt: new Date(),
        });
    }

    async getInvoices(storeId: string) {
        return await invoiceRepository.findByStore(storeId);
    }

    async getInvoice(storeId: string, id: string) {
        return await invoiceRepository.findById(storeId, id);
    }

    async getCustomerInvoices(storeId: string, customerId: string) {
        return await invoiceRepository.findByCustomer(storeId, customerId);
    }

    async updatePayment(storeId: string, invoiceId: string, paidAmount: number) {
        const invoice = await invoiceRepository.findById(storeId, invoiceId);
        if (!invoice) throw new Error('Invoice not found');

        const newPaidAmount = (invoice.paidAmount || 0) + paidAmount;
        const dueAmount = invoice.total - newPaidAmount;

        let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
        if (dueAmount <= 0) {
            paymentStatus = 'paid';
        } else if (newPaidAmount > 0) {
            paymentStatus = 'partial';
        }

        return await invoiceRepository.updatePayment(storeId, invoiceId, {
            paidAmount: newPaidAmount,
            dueAmount: Math.max(0, dueAmount),
            paymentStatus,
        });
    }
}
