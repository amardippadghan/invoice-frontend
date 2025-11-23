import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { CustomerRepository } from '../repositories/CustomerRepository';

const invoiceRepository = new InvoiceRepository();
const productRepository = new ProductRepository();
const storeRepository = new StoreRepository();
const customerRepository = new CustomerRepository();

export class AnalyticsService {
    async getDashboardStats(storeId: string) {
        const invoices = await invoiceRepository.findByStore(storeId);
        const products = await productRepository.findByStore(storeId);
        const customers = await customerRepository.findByStore(storeId);

        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
        const totalUnpaid = invoices.reduce((sum, inv) => sum + (inv.dueAmount || 0), 0);
        const totalInvoices = invoices.length;
        const totalProducts = products.length;
        const totalCustomers = customers.length;

        return {
            totalRevenue,
            totalUnpaid,
            totalInvoices,
            totalProducts,
            totalCustomers
        };
    }

    async getSalesChart(storeId: string) {
        // Simple aggregation by date for the last 7 days
        // In a real app, use MongoDB aggregation pipeline for better performance
        const invoices = await invoiceRepository.findByStore(storeId);
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const salesData = last7Days.map(date => {
            const dayTotal = invoices
                .filter(inv => new Date(inv.createdAt).toISOString().split('T')[0] === date)
                .reduce((sum, inv) => sum + (inv.total || 0), 0);
            return dayTotal;
        });

        return {
            categories: last7Days,
            series: [{ name: 'Sales', data: salesData }]
        };
    }

    async getTopProducts(storeId: string) {
        // This would be better with a proper aggregation on line items
        // For now, we'll iterate invoices (not scalable but works for MVP)
        const invoices = await invoiceRepository.findByStore(storeId);
        const productSales: Record<string, number> = {};

        for (const inv of invoices) {
            for (const item of inv.lineItems) {
                const productName = item.title;
                productSales[productName] = (productSales[productName] || 0) + item.quantity;
            }
        }

        const sortedProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            categories: sortedProducts.map(([name]) => name),
            series: [{ name: 'Units Sold', data: sortedProducts.map(([, qty]) => qty) }]
        };
    }
}
