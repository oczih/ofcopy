import mongoose, { Schema, model, Types } from "mongoose";
import Post, {PostDocument} from "./postmodel"; // Assuming you have PostDocument exported
export interface Subscriber {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatarKey: string;
  subscribedAt: Date;
  subscriptionPrice: number;
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate?: Date;
  autoRenew: boolean;
}
export interface Follower {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatarKey?: string;
  followedAt: Date;
}
enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  PreferNotToSay = 'PreferNotToSay'
}
export interface CreatorDocument extends mongoose.Document {
  username: string;
  _id: string;
  name: string;
  email: string;
  password: string;
  bio: string;
  googleId: string | null;
  avatarKey?: string;
  oauthProvider?: string;
  oauthId?: string;
  gender: Gender;
  lastUsernameChange?: Date;
  price?: number;
  category?: string;
  subscriptions?: Subscriber[];
  followers: Follower[];
  user: Types.ObjectId;  // Link to OFUser
  posts?: PostDocument[];  // Virtual populated posts
}

const creatorSchema = new Schema<CreatorDocument>({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String },
  email: {
    type: String,
    unique: true,
    required: function() { return !this.oauthProvider },
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Email is invalid"]
  },
  googleId: { type: String, default: null },
  avatarKey: { type: String },
  oauthProvider: { type: String },
  oauthId: { type: String },
  lastUsernameChange: { type: Date, default: null },
  price: { type: Number, default: 9.99 },
  bio: {type: String, default: ''},
  gender: { type: String, enum: Object.values(Gender) },
  category: { type: String, default: 'General' },
  subscriptions: [{
    userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
    username: { type: String, required: true },
    avatarKey: { type: String },
    subscribedAt: { type: Date, default: Date.now },
    subscriptionPrice: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], required: true },
    nextBillingDate: { type: Date, default: null },
    autoRenew: { type: Boolean, default: true }
  }],
  followers: [{
    userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
    username: { type: String, required: true },
    avatarKey: { type: String },
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
