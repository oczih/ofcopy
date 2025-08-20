import mongoose, { Schema, model, Document } from "mongoose";
import { Message } from "./messagemodel";
import { PostDocument } from "./postmodel";

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
  id: string;
  price: number;
  creatorId: mongoose.Types.ObjectId;
  postId: string | PostDocument;
  date: Date;
}

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
};

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
  seen: boolean;
}

// 🔹 This now extends Document
export interface OFUserDocument extends Document {
  _id: mongoose.Types.ObjectId
  username: string;
  password: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  googleId: string | null;
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
  wallet: number;
  paymentmethods?: {
    provider: string;
    token: string;
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
    default: boolean;
    addedAt: Date;
  }[];
}

const userSchema = new Schema<OFUserDocument>({
  name: {
        type: String,
        required: [true, "Name is required"]
      },
  username: { type: String, required: false, unique: true },
  password: { type: String, required: false, select: false },
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
  wallet: {
    type: Number,
    default: 0, // initial user balance
    min: 0
  },
  paymentmethods: [
    {
      provider: { type: String, required: true },
      token: { type: String, required: true },
      last4: { type: String, required: true },
      brand: { type: String, required: true },
      expMonth: { type: Number, required: true },
      expYear: { type: Number, required: true },
      default: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

// Hide private fields in JSON


userSchema.set('toJSON', {
  transform: (
    doc: Document & OFUserDocument,
    ret: Partial<OFUserDocument>, // Use 'any' to simplify the type definition
  ) => {
    // Narrow _id safely using a type guard
    if (typeof ret._id === 'object' && ret._id !== null && 'toString' in ret._id) {
      ret.id = ret._id.toString();
    } else {
      ret.id = undefined;
    }
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

export interface VerificationTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const verificationTokenSchema = new Schema<VerificationTokenDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'OFUser' },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
const VerificationToken = mongoose.models.VerificationToken || model<VerificationTokenDocument>('VerificationToken', verificationTokenSchema);

export { VerificationToken };
const OFUser = mongoose.models?.OFUser || model<OFUserDocument>('OFUser', userSchema);
export default OFUser;
