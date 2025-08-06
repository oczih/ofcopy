import mongoose, { Schema, Document, model } from 'mongoose';

export interface CreatorApplicationDocument extends Document {
  user: mongoose.Types.ObjectId;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  category: string;
  gender: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
}

const creatorApplicationSchema = new Schema<CreatorApplicationDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true, unique: true },
  displayName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  bio: { type: String, default: '' },
  category: { type: String, default: 'General' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'PreferNotToSay'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'OFUser' },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

const CreatorApplication = mongoose.models.CreatorApplication || model<CreatorApplicationDocument>('CreatorApplication', creatorApplicationSchema);

export default CreatorApplication;
