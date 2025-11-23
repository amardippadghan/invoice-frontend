import { Schema, model, Document } from 'mongoose';
import { ISKU } from './SKU';

export interface ILineItem {
    sku: Schema.Types.ObjectId | ISKU;
    title: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discountAmount?: number;
    total: number;
    meta?: any;
}

export interface IPayment {
    amount: number;
    date: Date;
    method?: string;
    note?: string;
    createdBy?: Schema.Types.ObjectId;
}

export interface IInvoice extends Document {
    store: Schema.Types.ObjectId;
    invoiceNumber: string;
    customer: Schema.Types.ObjectId;
    billingAddress?: any;
    shippingAddress?: any;
    currency: string;
    status: 'draft' | 'issued' | 'paid' | 'void' | 'refunded';
    lineItems: ILineItem[];
    subTotal: number;
    totalTax: number;
    totalDiscount: number;
    shippingAmount?: number;
    adjustments?: number;
    total: number;
    paidAmount: number;
    dueAmount: number;
    paymentStatus: 'paid' | 'partial' | 'unpaid';
    payments: IPayment[];
    issuedAt?: Date;
    dueAt?: Date;
    createdBy?: Schema.Types.ObjectId;
    meta?: any;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'cash' },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    invoiceNumber: { type: String, required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    billingAddress: { type: Object, default: {} },
    shippingAddress: { type: Object, default: {} },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['draft', 'issued', 'paid', 'void', 'refunded'], default: 'draft' },
    lineItems: { type: [Object], default: [] },
    subTotal: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    adjustments: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' },
    payments: { type: [PaymentSchema], default: [] },
    issuedAt: { type: Date },
    dueAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    meta: { type: Object, default: {} }
}, { timestamps: true });

InvoiceSchema.index({ store: 1, invoiceNumber: 1 }, { unique: true });

export default model<IInvoice>('Invoice', InvoiceSchema);
