import mongoose, { Schema, model, Types } from "mongoose";
import Post, {PostDocument} from "./postmodel"; // Assuming you have PostDocument exported
export interface Subscription {
  userId: mongoose.Types.ObjectId;
  username: string;
  userImage?: string;
  subscribedAt: Date;
  subscriptionPrice: number;
}
export interface Follower {
  userId: mongoose.Types.ObjectId;
  username: string;
  userImage?: string;
  followingDate: Date;
}
export interface CreatorDocument extends mongoose.Document {
  username: string;
  _id: string;
  name: string;
  email: string;
  password: string;
  googleId: string | null;
  image?: string;
  oauthProvider?: string;
  oauthId?: string;
  lastUsernameChange?: Date;
  price?: number;
  category?: string;
  subscriptions?: Subscription[];
  followers: Follower[];
  user: Types.ObjectId;  // Link to OFUser
  posts?: PostDocument[];  // Virtual populated posts
}

const creatorSchema = new Schema<CreatorDocument>({
  name: { type: String, required: true },
  username: { type: String, unique: true },
  password: { type: String },
  email: {
    type: String,
    unique: true,
    required: function() { return !this.oauthProvider },
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Email is invalid"]
  },
  googleId: { type: String, default: null },
  image: { type: String },
  oauthProvider: { type: String },
  oauthId: { type: String },
  lastUsernameChange: { type: Date, default: '' },
  price: { type: Number, default: 9.99 },
  category: { type: String, default: 'General' },
  subscriptions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
    username: { type: String, required: true },
    userImage: { type: String },
    subscribedAt: { type: Date, default: Date.now },
    subscriptionPrice: {type: Number, required: true}
  }],
  followers: [{
    userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
    username: { type: String, required: true },
    userImage: { type: String },
    followedAt: { type: Date, default: Date.now }
  }],
  user: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Posts
creatorSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',     // Creator._id
  foreignField: 'creator' // Post.creator
});

const Creator = mongoose.models.Creator || model<CreatorDocument>("Creator", creatorSchema);

export default Creator;
