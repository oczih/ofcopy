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
  s3Key?: string;
  type: string;
  caption?: string;
  likes: Like[];  // Updated from number to Like[]
  createdAt: Date;
  viewableFor: 'followers' | 'subscribers';
  comments: Comment[];
  width?: number;
  height?: number;
  price?: number;
}

const postSchema = new Schema<PostDocument>({
  creator: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  s3Key: { type: String },  // no required
  type: { type: String },
  caption: { type: String },  // no required
  likes: [
    { userId: {type: Schema.Types.ObjectId, ref: 'OFUser', required: true} }
  ],
  createdAt: { type: Date, default: Date.now },
  viewableFor: { type: String, enum: ['followers', 'subscribers'], default: 'followers' },
  comments: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
      username: { type: String, required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  width: { type: Number },
  height: { type: Number },
  price: { type: Number },
});

const Post = mongoose.models?.Post || model<PostDocument>('Post', postSchema);

export default Post;
export type { PostDocument };
