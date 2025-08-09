import mongoose, { Schema, model, Document} from "mongoose";
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
}

const userSchema = new Schema<OFUserDocument>({
  // ... your schema fields unchanged
}, { timestamps: true });

// Hide private fields in JSON


userSchema.set("toJSON", {
  transform: (
    _doc: Document & OFUserDocument,
    ret: OFUserDocument & { _id: unknown; __v: number; password?: string },
  ): void => {
    // Cast ret to a mutable type for safe modification
    const mutableRet = ret as Partial<OFUserDocument> & { _id?: { toString: () => string } | string; id?: string; __v?: number; password?: string };

    if (mutableRet._id && typeof mutableRet._id === "object" && "toString" in mutableRet._id) {
      mutableRet.id = mutableRet._id.toString();
    } else if (typeof mutableRet._id === "string") {
      mutableRet.id = mutableRet._id;
    }

    delete mutableRet._id;
    delete mutableRet.__v;
    delete mutableRet.password;
  },
});
export interface VerificationTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const verificationTokenSchema = new Schema<VerificationTokenDocument>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'OFUser' },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
const VerificationToken = mongoose.models.VerificationToken || model<VerificationTokenDocument>('VerificationToken', verificationTokenSchema);

export { VerificationToken };
const OFUser = mongoose.models?.OFUser || model<OFUserDocument>('OFUser', userSchema);
export default OFUser;
