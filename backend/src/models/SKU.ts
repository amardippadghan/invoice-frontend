import { Schema, model, Document } from 'mongoose';

export interface ISKU extends Document {
    product: Schema.Types.ObjectId;
    store: Schema.Types.ObjectId;
    sku: string;
    price: number;
    currency?: string;
    stock?: number;
    attributes?: Record<string, string>;
    createdAt: Date;
}

const SKUSchema = new Schema<ISKU>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    stock: { type: Number, default: null },
    attributes: { type: Object, default: {} }
}, { timestamps: true });

SKUSchema.index({ store: 1, sku: 1 }, { unique: true });

export default model<ISKU>('SKU', SKUSchema);
