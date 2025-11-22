import { Schema, model, Document } from 'mongoose';

export interface IStore extends Document {
    name: string;
    slug: string;
    timezone?: string;
    currency: string;
    billing?: { plan: string; limits: any };
    createdAt: Date;
    updatedAt: Date;
    meta?: Record<string, any>;
}

const StoreSchema = new Schema<IStore>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    billing: { type: Object, default: {} },
    meta: { type: Object, default: {} }
}, { timestamps: true });

export default model<IStore>('Store', StoreSchema);
