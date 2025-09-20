import mongoose, { Schema, Document, model } from "mongoose";

export interface ReportDocument extends Document {
  _id: string;
  reporter: mongoose.Types.ObjectId;          // User who filed the report
  creator?: mongoose.Types.ObjectId | null;   // Creator being reported (optional if reporting a user/post only)
  post?: mongoose.Types.ObjectId | null;      // Post being reported (optional)
  reason: string;                              // e.g. harassment, spam, etc.
  details?: string;                             // Additional description
  status: "pending" | "reviewed" | "action_taken" | "dismissed";
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId | null; // Admin/mod who reviewed
  action?: string;                              // Action taken (ban, warning, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<ReportDocument>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "OFUser", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "Creator", default: null },
    post: { type: Schema.Types.ObjectId, ref: "Post", default: null },

    reason: { type: String, required: true },
    details: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "reviewed", "action_taken", "dismissed"],
      default: "pending",
    },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "OFUser", default: null },
    action: { type: String, default: "" },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Report =
  mongoose.models.Report || model<ReportDocument>("Report", reportSchema);

export default Report;
