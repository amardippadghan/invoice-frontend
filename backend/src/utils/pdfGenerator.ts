import puppeteer from 'puppeteer';
import { IInvoice } from '../models/Invoice';

export const generateInvoicePDF = async (invoice: any, storeName: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Helper to get full image path
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `file://${process.cwd()}${path}`;
  };

  const customerName = invoice.customer?.name || invoice.billingAddress?.name || 'Valued Customer';
  const customerEmail = invoice.customer?.email || invoice.billingAddress?.email || '';
  const customerAddress = invoice.customer?.address?.line1 || invoice.billingAddress?.line1 || '';

  const issuedDate = invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : new Date().toLocaleDateString();
  const dueDate = invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : 'N/A';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .brand { font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: -1px; }
        .invoice-title { font-size: 48px; font-weight: 700; color: #e5e7eb; text-align: right; line-height: 1; }
        .meta-group { margin-top: 20px; text-align: right; }
        .meta-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-value { font-size: 16px; font-weight: 600; color: #111827; }
        
        .addresses { display: flex; justify-content: space-between; margin-bottom: 50px; }
        .address-block h3 { font-size: 14px; color: #6b7280; text-transform: uppercase; margin-bottom: 10px; }
        .address-block p { margin: 0; font-weight: 500; }
        .address-block .email { color: #2563eb; margin-top: 5px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 15px 10px; color: #6b7280; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #f3f4f6; }
        td { padding: 15px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
        .product-cell { display: flex; alignItems: center; gap: 12px; }
        .product-img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; background: #f3f4f6; }
        .product-info div { font-weight: 600; font-size: 14px; }
        .product-info span { font-size: 12px; color: #6b7280; }
        .text-right { text-align: right; }
        .font-mono { font-family: monospace; }

        .summary-section { display: flex; justify-content: flex-end; }
        .summary-table { width: 300px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .summary-row.total { border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 15px; }
        .summary-row.total .label { font-size: 16px; font-weight: 700; }
        .summary-row.total .value { font-size: 20px; font-weight: 800; color: #2563eb; }

        .footer { margin-top: 60px; border-top: 1px solid #f3f4f6; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
        
        .status-badge { 
            display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; 
            margin-top: 10px;
        }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-unpaid { background: #fee2e2; color: #991b1b; }
        .status-partial { background: #fef9c3; color: #854d0e; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">${storeName}</div>
          <div class="status-badge status-${invoice.paymentStatus || 'unpaid'}">${invoice.paymentStatus || 'Unpaid'}</div>
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <div class="meta-group">
            <div class="meta-label">Invoice #</div>
            <div class="meta-value">${invoice.invoiceNumber}</div>
          </div>
          <div class="meta-group">
            <div class="meta-label">Date Issued</div>
            <div class="meta-value">${issuedDate}</div>
          </div>
          <div class="meta-group">
            <div class="meta-label">Due Date</div>
            <div class="meta-value">${dueDate}</div>
          </div>
        </div>
      </div>

      <div class="addresses">
        <div class="address-block">
          <h3>Billed To</h3>
          <p>${customerName}</p>
          <p>${customerAddress}</p>
          <p class="email">${customerEmail}</p>
        </div>
        <div class="address-block text-right">
          <h3>Pay To</h3>
          <p>${storeName}</p>
          <p>123 Business Street</p>
          <p>City, Country</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th width="50%">Item</th>
            <th width="10%" class="text-right">Qty</th>
            <th width="20%" class="text-right">Price</th>
            <th width="20%" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lineItems.map((item: any) => {
    const product = item.sku?.product;
    const imagePath = product?.images?.[0];
    const imageUrl = imagePath ? getImageUrl(imagePath) : '';

    return `
            <tr>
              <td>
                <div class="product-cell">
                  ${imageUrl ? `<img src="${imageUrl}" class="product-img" />` : ''}
                  <div class="product-info">
                    <div>${item.title}</div>
                    <span>${item.description || ''}</span>
                  </div>
                </div>
              </td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right font-mono">${invoice.currency} ${item.unitPrice.toFixed(2)}</td>
              <td class="text-right font-mono">${invoice.currency} ${item.total.toFixed(2)}</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-table">
          <div class="summary-row">
            <span class="label">Subtotal</span>
            <span class="value font-mono">${invoice.currency} ${invoice.subTotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span class="label">Tax</span>
            <span class="value font-mono">${invoice.currency} ${invoice.totalTax.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span class="label">Discount</span>
            <span class="value font-mono">-${invoice.currency} ${invoice.totalDiscount.toFixed(2)}</span>
          </div>
           <div class="summary-row">
            <span class="label">Paid</span>
            <span class="value font-mono">${invoice.currency} ${(invoice.paidAmount || 0).toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span class="label">Total Due</span>
            <span class="value font-mono">${invoice.currency} ${invoice.dueAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};
