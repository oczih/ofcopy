import mongoose, { Schema, model, Document } from 'mongoose';

export interface PaymentIntentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  creatorId?: mongoose.Types.ObjectId;
  mediaId?: mongoose.Types.ObjectId;
  type: "message" | "subscription" | "topup" | "post";
  amount: number;                // required amount in BTC/LTC
  address: string;               // unique receiving address
  status: "pending" | "paid" | "expired";
  txid?: string;
  createdAt: Date;
  paidAt?: Date;
}

const PaymentIntentSchema = new Schema<PaymentIntentDocument>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "OFUser" },
  creatorId: { type: Schema.Types.ObjectId, ref: "Creator" },
  mediaId: { type: Schema.Types.ObjectId, ref: "Post" },
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
