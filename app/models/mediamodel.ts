import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'OFUser' },
  title: String,
  s3Key: String,
  type: String,
  isPaid: Boolean,
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models?.Media || mongoose.model('Media', mediaSchema);