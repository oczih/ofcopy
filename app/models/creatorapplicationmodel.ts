import mongoose, { Schema, Document, model } from 'mongoose';

export interface CreatorApplicationDocument extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  displayName: string;
  username: string;
  handle: string;
  email: string;
  bio: string;
  category: string;
  gender: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;

  // ✅ Extra fields matching frontend form
  country: string;
  subscriptionPrice: number;
  birthDate: string;
  fullLegalName: string;

  // ✅ File uploads (store s3Key + metadata)
  profilePic: {
    s3Key: { type: string, required: true },
  }
  idFrontPhoto?: {
    type: string,
    required: true };
  idBackPhoto?: {
    type: string,
    required: true };
  selfieWithId?: {
    type: string,
    required: true };
}



const creatorApplicationSchema = new Schema<CreatorApplicationDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "OFUser" },
    displayName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, default: '' },
    handle: { type: String, required: true },
    
    category: { type: String, default: 'General' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'PreferNotToSay'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'OFUser' },
    rejectionReason: { type: String },

    // ✅ New frontend fields
    country: { type: String },
    subscriptionPrice: { type: Number, min: 3.99, max: 100 },
    birthDate: { type: String },
    fullLegalName: { type: String },

    // ✅ File uploads
    profilePic: { type: String },
    idFrontPhoto: { type: String },
    idBackPhoto: { type: String },
    selfieWithId: { type: String },
  },
  {
    timestamps: true,
  }
);

const CreatorApplication =
  mongoose.models.CreatorApplication ||
  model<CreatorApplicationDocument>('CreatorApplication', creatorApplicationSchema);

export default CreatorApplication;
