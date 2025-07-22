import mongoose, { Schema, model, Document } from 'mongoose';

export interface PurchaseDocument extends Document {
  userId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  mediaId?: mongoose.Types.ObjectId; // Optional: for content-specific purchases
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<PurchaseDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mediaId: { type: Schema.Types.ObjectId, ref: 'Media', required: false },
  amount: { type: Number, required: true },
}, {
  timestamps: true,
});

const Purchase = mongoose.models?.Purchase || model<PurchaseDocument>('Purchase', purchaseSchema);
export default Purchase; 