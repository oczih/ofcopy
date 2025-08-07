import mongoose, { Schema, model} from "mongoose";
import { Message } from "./messagemodel";

// Subscription interface for better type safety
export interface Subscription {
  id: string;
  creatorId: mongoose.Types.ObjectId;
  creatorName: string;
  creatorUsername: string;
  creatorImage?: string;
  subscriptionDate: Date;
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate?: Date;
  autoRenew: boolean;
}
export interface Purchase {
  id: string
  price: number; 
  creatorId: mongoose.Types.ObjectId
  postId: string;
  date: Date;
}
// Following interface (reference only)
export interface Following {
  creatorId: mongoose.Types.ObjectId;
  followedAt: Date;
}

export type Comment = {
  _id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}
export type NotificationType =
  | 'newsub'
  | 'resub'
  | 'tip'
  | 'subcancel'
  | 'comment'
  | 'like'
  | 'newfollower';

export interface Notification {
  type: NotificationType;
  date: Date;
  seen: boolean
}
export interface UserDocument {
  _id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  googleId: string | null,
  avatarKey?: string;
  oauthProvider?: string;
  oauthId?: string;
  hasAccess?: boolean;
  customerId?: string;
  priceId?: string;
  membership?: boolean;
  lastUsernameChange?: Date;
  subscriptions: Subscription[];
  purchases: Purchase[];
  following: Following[];
  messages: Message[];
  notifications: Notification[];
  creator?: boolean;
  comments: Comment[];
  emailVerified: boolean;
  emailVerificationToken: string;
  emailVerificationExpires: Date;
  lastVerificationEmailSentAt: Date;
  lastPasswordResetSentAt: Date;
}


const userSchema = new Schema<UserDocument>({
  name: {
        type: String,
        required: [true, "Name is required"]
      },
  username: { type: String, required: false, unique: true },
  password: { type: String },
  email: {
    type: String,
    unique: true,
    required: function() {
      // Email is required only if no OAuth provider is specified (i.e., for credentials login)
      return !this.oauthProvider;
    },
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Email is invalid",
    ],
  },
  bio: {type: String},
  location: {type: String},
  googleId: {
    type: String,
    default: null,
  },
  avatarKey: { type: String },
  oauthProvider: { type: String },
  oauthId: { type: String },
  hasAccess: {
    type: Boolean,
    default: false,
  },
  customerId: {
    type: String,
    validate(value: string) {
      return value.includes("cus_");
    },
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  priceId: {
    type: String,
    validate(value: string) {
      return value.includes("price_");
    },
  },
  membership: {
    type: Boolean,
    default: false,
  },
  lastUsernameChange: {
    type: Date,
    default: null,
  },
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
  subscriptions: [{
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
      required: true
    },
    creatorName: {
      type: String,
      required: true
    },
    creatorUsername: {
      type: String,
      required: true
    },
    creatorImage: {
      type: String
    },
    subscriptionDate: {
      type: Date,
      default: Date.now
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    nextBillingDate: {
      type: Date
    },
    autoRenew: {
      type: Boolean,
      default: true
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
  notifications: [{
    type: {
      type: String,
      enum: ['newsub', 'resub', 'tip', 'subcancel', 'comment', 'like', 'newfollower'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    seen: {
      type: Boolean,
      default: false,
    }
  }],
  
  comments: [
    {
      commentId: { type: String, required: true },
      postId: { type: String, required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      username: { type: String },
      userId: { type: String },
    }
  ],
  lastVerificationEmailSentAt: {
    type: Date,
    default: null
  },
  lastPasswordResetSentAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: function (
    _doc: mongoose.Document,
    ret: Partial<UserDocument> & { _id?: string; id?: string; __v?: number; password?: string }
  ) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const verificationTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['email_verification', 'password_reset', 'password_add', 'password_confirm'] // Added password_add and password_confirm
  },
  tempPassword: { type: String },
  originalAction: { type: String, enum: ['add', 'reset'] },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index for automatic cleanup
  }
}, {
  timestamps: true
});
  
export const VerificationToken = mongoose.models?.VerificationToken || mongoose.model('VerificationToken', verificationTokenSchema);

  
const OFUser = mongoose.models?.OFUser || model<UserDocument>('OFUser', userSchema);

console.log("[OFUser] Model registered:", !!OFUser);

export default OFUser;