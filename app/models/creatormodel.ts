import mongoose, { Schema, model, Types } from "mongoose";
import {PostDocument} from "./postmodel"; // Assuming you have PostDocument exported
export interface Subscriber {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatarKey: string;
  subscribedAt: Date;
  subscriptionPrice: number;
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate?: Date;
  autoRenew: boolean;
  subscriptionId?: string;
}
export interface Follower {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatarKey?: string;
  followedAt: Date;
}
export interface Promotion {
  type: string;
  message?: string;
  audience: string;
  discountPercent: number;       // e.g. 20 for 20% off
  startDate: Date;
  endDate?: Date;                // optional if open-ended
  active: boolean;               // quick toggle
  createdAt: Date;
  updatedAt: Date;
  peopleLimit?: number;
  trialDays?: number;
}
export interface Bundle {
  name: string;
  description: string;
  monthCount: number;
  percetangeOff: number;
  price: number;
  createdAt: Date;
  endDate: Date;
}

enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  PreferNotToSay = 'PreferNotToSay'
}
export interface Following {
  creatorId: mongoose.Types.ObjectId;
  followedAt: Date;
}
export interface Purchase {
  id: string;
  price: number;
  creatorId: mongoose.Types.ObjectId;
  postId: string | PostDocument;
  date: Date;
}
export interface CreatorDocument extends mongoose.Document {
  username: string;
  _id: string;
  name: string;
  email: string;
  password: string;
  bio: string;
  location?: string;
  googleId: string | null;
  avatarKey?: string;
  oauthProvider: string;
  oauthId?: string;
  gender: Gender;
  lastUsernameChange?: Date;
  twitter?: string;     // Twitter/X URL or handle
  bluesky?: string;     // Bluesky URL or handle
  tiktok?: string;      // TikTok profile link
  instagram?: string;   // Instagram profile link
  facebook?: string;    // Facebook profile link
  youtube?: string;     // YouTube channel link
  price?: number;
  category?: string;
  subscriptions?: Subscriber[];
  followers: Follower[];
  subscribers: Subscriber[];
  user: Types.ObjectId;  // Link to OFUser
  posts?: PostDocument[];
  totalEarnings: number,  // Lifetime earnings
  currentBalance: number, // Available for payout
  following: Following[];
  purchases: Purchase[];
  creatorCreatedAt: Date;
  country: string;
  promotions: Promotion[];
  bundles: Bundle[];
  freeTrial: boolean;
  commentingEnabled: boolean;
}
const promotionSchema = new Schema<Promotion>(
  {
    type: { type: String, required: true },
    message: { type: String, required: false },
    audience: { type: String, required: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    active: { type: Boolean, default: true },
    peopleLimit: { type: Number, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    trialDays: { type: Number, required: false }
  },
  { timestamps: true }
);
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
  location: {type: String, default: ""},
  oauthId: { type: String },
  lastUsernameChange: { type: Date, default: null },
  creatorCreatedAt: { type: Date, default: null },
  twitter:   { type: String, trim: true, default: "" },  // Twitter/X
  bluesky:   { type: String, trim: true, default: "" },  // Bluesky
  tiktok:    { type: String, trim: true, default: "" },  // TikTok
  instagram: { type: String, trim: true, default: "" },  // Instagram
  facebook:  { type: String, trim: true, default: "" },  // Facebook
  youtube:   { type: String, trim: true, default: "" },  // YouTube
  price: { type: Number, default: 9.99 },
  country: { type: String, default: '' },
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
  purchases: [{
    id: {
      type: String
    },
    price: {
      type: Number
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      required: true
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  following: [{
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator',
      required: true
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followers: [{
    userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
    username: { type: String, required: true },
    avatarKey: { type: String },
    followedAt: { type: Date, default: Date.now }
  }],
  subscribers: [{
    userId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
    username: { type: String, required: true },
    avatarKey: { type: String },
    subscribedAt: { type: Date, default: Date.now },
    subscriptionPrice: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], required: true },
    nextBillingDate: { type: Date, default: null },
    autoRenew: { type: Boolean, default: true },
    subscriptionId: {
      type: String,
      default: ''
    }
  }],
  user: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
  totalEarnings: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  promotions: [promotionSchema],
  freeTrial: {type: Boolean, default: false},
  commentingEnabled: {type: Boolean, default: true}
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
