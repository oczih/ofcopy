import mongoose, { Schema, model } from "mongoose";


export interface TransactionDocument extends mongoose.Document {
  creatorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;   // Subscriber who paid
  amount: number;
  postId?: mongoose.Types.ObjectId;
  type: "subscription" | "tip" | "payout" | "purchase";
  status: "completed" | "pending" | "failed";
  createdAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>({
  creatorId: { type: Schema.Types.ObjectId, ref: "Creator", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "OFUser", required: true },
  amount: { type: Number, required: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post" },
  type: { type: String, enum: ["subscription", "tip", "payout", "purchase"], required: true },
  status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" },
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || model<TransactionDocument>("Transaction", transactionSchema);

export default Transaction;
