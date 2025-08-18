import mongoose, { Schema, Document, model } from 'mongoose';

export interface Comment {
  userId: mongoose.Types.ObjectId;
  username: string;
  text: string;
  createdAt: Date;
}
export interface Like {
  userId: mongoose.Types.ObjectId;
} 
export interface PostDocument extends Document {
  creator: mongoose.Types.ObjectId;
  s3Key: {
    key: { type: string, required: true },
    blurredKey: { type: string, required: true },
  },
  type: string;
  caption?: string;
  likes: Like[];  // Updated from number to Like[]
  createdAt: Date;
  viewableFor: 'followers' | 'subscribers';
  comments: Comment[];
  width?: number;
  height?: number;
  price?: number;
  isRepost: boolean;
  originalContentId: mongoose.Types.ObjectId
}

const postSchema = new Schema<PostDocument>({
  creator: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },

  // Media / text
  s3Key: {
    key: { type: String, required: true },
    blurredKey: { type: String, required: true },
  }, 
  caption: { type: String },  

  // Social
  likes: [{ userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true } }],
  comments: [
    {
      _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
      username: { type: String, required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // Access
  viewableFor: { type: String, enum: ['followers', 'subscribers'], default: 'followers' },
  price: { type: Number, default: 0 },

  // Media details
  width: { type: Number },
  height: { type: Number },

  // Repost logic
  originalContentId: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
  isRepost: { type: Boolean, default: false }, // 👈 safer than required:true

}, { timestamps: true });

const Post = mongoose.models?.Post || model<PostDocument>('Post', postSchema);

export default Post;