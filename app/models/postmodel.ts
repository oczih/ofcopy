import mongoose, { Schema, model } from 'mongoose';

const postSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  s3Key: { type: String, required: true },
  type: { type: String, required: true },
  caption: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  viewableFor: {type: String, enum: ['followers', 'subscribers'], default: 'followers'},
  comments: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
      username: { type: String, required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }
  ],
});

const Post = (mongoose.models?.Post) || model('Post', postSchema);

export default Post; 