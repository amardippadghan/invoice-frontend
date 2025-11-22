import puppeteer from 'puppeteer';
import { IInvoice } from '../models/Invoice';

export const generateInvoicePDF = async (invoice: IInvoice, storeName: string): Promise<Buffer> => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; }
        .meta { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totals { margin-top: 20px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">${storeName}</div>
          <div>Invoice #${invoice.invoiceNumber}</div>
        </div>
        <div class="meta">
          <div>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
          <div>Status: ${invoice.status}</div>
        </div>
      </div>

      <h3>Bill To:</h3>
      <div>${invoice.billingAddress?.name || 'N/A'}</div>
      <div>${invoice.billingAddress?.email || ''}</div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lineItems.map(item => `
            <tr>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>${invoice.currency} ${item.unitPrice.toFixed(2)}</td>
              <td>${invoice.currency} ${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <p>Subtotal: ${invoice.currency} ${invoice.subTotal.toFixed(2)}</p>
        <p>Tax: ${invoice.currency} ${invoice.totalTax.toFixed(2)}</p>
        <p>Discount: ${invoice.currency} ${invoice.totalDiscount.toFixed(2)}</p>
        <h3>Total: ${invoice.currency} ${invoice.total.toFixed(2)}</h3>
      </div>
    </body>
    </html>
  `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();
    return Buffer.from(pdfBuffer);
};
