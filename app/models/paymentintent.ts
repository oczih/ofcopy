import mongoose, { Schema, model, Document } from 'mongoose';

export interface PaymentIntentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  creatorId?: mongoose.Types.ObjectId;
  mediaId?: string; // change from ObjectId to string
  type: "message" | "subscription" | "topup" | "post";
  amount: number;
  address: string;
  status: "pending" | "paid" | "expired";
  txid?: string;
  createdAt: Date;
  paidAt?: Date;
}

const PaymentIntentSchema = new Schema<PaymentIntentDocument>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "OFUser" },
  creatorId: { type: Schema.Types.ObjectId, ref: "Creator" },
  mediaId: { type: Schema.Types.Mixed }, 
  type: { type: String, enum: ["message", "subscription", "topup", "post"], required: true },
  amount: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ["pending", "paid", "expired"], default: "pending" },
  txid: String,
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
});

const PaymentIntent = mongoose.models.PaymentIntent || model<PaymentIntentDocument>('PaymentIntent', PaymentIntentSchema);

export default PaymentIntent;
