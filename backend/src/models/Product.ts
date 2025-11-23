import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    store: Schema.Types.ObjectId;
    name: string;
    description?: string;
    type: 'physical' | 'digital' | 'service';
    taxRate?: number;
    status: 'active' | 'inactive';
    images: string[];
    createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['physical', 'digital', 'service'], default: 'physical' },
    taxRate: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    images: { type: [String], default: [] }
}, { timestamps: true });

export default model<IProduct>('Product', ProductSchema);
