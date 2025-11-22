import { Schema, model, Document } from 'mongoose';

export interface ICustomer extends Document {
    store: Schema.Types.ObjectId;
    externalId?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: any;
    meta?: any;
    createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    externalId: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, index: true },
    phone: { type: String },
    address: { type: Object, default: {} },
    meta: { type: Object, default: {} }
}, { timestamps: true });

export default model<ICustomer>('Customer', CustomerSchema);
