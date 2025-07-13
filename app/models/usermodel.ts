import mongoose, { Schema, model } from "mongoose";

// Subscription interface for better type safety
export interface Subscription {
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

export interface UserDocument {
    _id: string;
  username: string;
  password: string
  email: string
  name: string
  googleId: string | null,
  image?: string;
  oauthProvider?: string;
  oauthId?: string;
  hasAccess?: boolean;
  customerId?: string;
  priceId?: string;
  membership?: boolean;
  lastUsernameChange?: Date;
  subscriptions: Subscription[];
  messages: Messages[];
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

  googleId: {
    type: String,
    default: null,
  },
  image: { type: String },
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
    default: '',
  },
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
  }]
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    },
  });
const OFUser = mongoose.models?.OFUser || model<UserDocument>('OFUser', userSchema);

console.log("[OFUser] Model registered:", !!OFUser);

export default OFUser;