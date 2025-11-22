import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    store: Schema.Types.ObjectId;
    name: string;
    email: string;
    passwordHash?: string;
    role: 'owner' | 'admin' | 'staff';
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['owner', 'admin', 'staff'], default: 'admin' }
}, { timestamps: true });

export default model<IUser>('User', UserSchema);
