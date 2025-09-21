import mongoose, { ObjectId } from "mongoose";

export type User = {
    _id: string,
    avatarKey?: string;
    username: string
    email: string,
    bio?: string;
    name: string,
    googleId: string | null
    membership?: boolean
    hasAccess?: boolean
    lastUsernameChange: Date
    isUsernameChangeBlocked?: boolean
    accessToken?: string
    oauthProvider: string;
    subscriptions?: Subscription[]
    notifications?: Notification[]
    location?: UserLocation;
    creator?: boolean
    following: Following[];
    comments: Comment[];
    emailVerified: boolean;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
    lastVerificationEmailSentAt: Date;
    lastPasswordResetSentAt: Date;
    password: string;
    purchases: Purchase[];
    createdAt: string;
    wallet: number;
    paymentmethods?: PaymentMethod[];
    creatorApplication?: CreatorApplicationType[];
  }
  export type UserLocation = {
    ip?: string;
    country?: string;
    region?: string;
    city?: string;
    latitude?: string| null;
    longitude?: string| null;
    utcOffset?: number; 
    timezone?: string;
    currency?: string;
  }
  export type PaymentMethod = {
    provider: string;
    token: string;
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
    default: boolean;
    addedAt: Date;
  };
  export interface Subscriber {
    userId: mongoose.Types.ObjectId;
    username: string;
    avatarKey?: string;
    subscribedAt: Date;
    subscriptionPrice: number;
    status: 'active' | 'cancelled' | 'expired';
    nextBillingDate?: Date;
    autoRenew: boolean;
  }
  export interface Purchase<TPost = string> {
    id: string;
    price: number; 
    creatorId: mongoose.Types.ObjectId;
    postId: TPost;
    date: Date;
  }
  export  enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
    PreferNotToSay = 'PreferNotToSay'
  }
export type Creator = {
_id: string;
    name: string;
    username: string;
    avatarKey?: string;  
    bio: string;
    image?: string;
    subscribers: Subscriber[];
    followers: Follower[]
    isSubscribed: boolean;
    gender: Gender;
    twitter: string, // Twitter/X
    bluesky: string, // Bluesky
    tiktok: string, // TikTok
    instagram: string, // Instagram
    facebook: string, // Facebook
    youtube: string, // YouTube
    price: number;
    lastUsernameChange?: Date;
    category: string;
    posts?: Post[];
    user: string;
    totalEarnings: number;
    currentBalance: number;
    following: Following[];
    purchases: Purchase[];
    creatorCreatedAt: Date;
    country: string;
    promotions: Promotion[];
  }

  export type NotificationType = 'newsub' | 'resub' | 'tip' | 'subcancel' | 'comment' | 'like' | 'newfollower'| 'promotion' | 'purchase';

  export interface Notification {
    type: NotificationType;
    date: Date;
    by: User | Creator | string;
    seen: boolean;
    for: (User | Creator | string)[]; // add string to allow IDs
    postId?: string;
    commentId?: string;
  }
export interface Follower {
  userId: string;
  username: string;
  avatarKey?: string;
  followedAt: Date;
}
export type Subscription = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  avatarKey?: string;
  subscriptionDate: Date;
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate?: Date;
  autoRenew: boolean;
}
export interface Following {
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  avatarKey?: string;
  followingDate: Date;
}
export interface Comment {
  _id: string;
  postId: string;
  text: string;
  createdAt: string;
  username?: string;
  userId?: string;
}
export type MediaPost = Post & {
  title: string;
  description?: string;
  isPublic: boolean;
  subscriberOnly?: boolean;
  price?: number;
  thumbnailUrl?: string;
  duration?: number;
  tags?: string[];
};
export interface Like {
  userId: string
}
export type S3Key = {
  key: string;           // The actual S3 key for the file
  blurred_key?: string;   // Optional blurred version
};
export type Post = {
  _id: string;
  creator: string;            // Just the ID string, unless you populate the whole creator
  s3Key?: S3Key | string;
  type: string;
  caption?: string;
  likes: Like[];
  createdAt: string | Date;   // Depending on usage
  viewableFor: string;
  comments: Comment[];            // Replace with proper Comment type if you have it
  signedUrl?: string;         // Optional signed URL added at runtime (not stored in DB)
  width?: number;             // Optional image width
  height?: number;
  price: number; 
  isRepost: boolean;
  originalContentId?: string;
};
export interface Promotion {
  _id: string;
  title: string;
  description?: string;
  discountPercent: number;       // e.g. 20 for 20% off
  startDate: Date;
  endDate?: Date;                // optional if open-ended
  active: boolean;               // quick toggle
  createdAt: Date;
  updatedAt: Date;
}
declare module "next-auth" {
  interface User {
    _id: string;
    username?: string;
    age?: number;
    googleId?: string;
    password: string;
    membership?: boolean;
    bio?: string;
    createdAt: string;
    location?: string;
    hasAccess?: boolean;
    email?: string;
    lastUsernameChange?: Date;
    oauthProvider: string;
    isUsernameChangeBlocked?: boolean;
    accessToken?: string;
    subscriptions?: Subscription[] 
    notifications?: Notification[]
    creator?: boolean
    following?: Following[]
    comments?: Comment[];
    name?: string;
    avatarKey?: string;
    emailVerified?: boolean;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
    lastVerificationEmailSentAt: Date;
    lastPasswordResetSentAt: Date;
    purchases: Purchase[];
    wallet: number;
    paymentmethods?: PaymentMethod[]
    creatorApplication?: CreatorApplicationType[];
  }

  interface Session {
    user: SafeUser & {
      name?: string;
      email?: string;
      image?: string;
    };
    accessToken?: string;
  }
}
export type FileMetaType = {
  s3Key: string;
  fileName: string;
  type: string;
};

export type CreatorApplicationType = {
  _id: string;
  user: string; // ObjectId as string
  displayName: string;
  username: string;
  email: string;
  bio?: string;
  handle: string;
  category?: string;
  gender: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // ObjectId as string
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // ✅ New fields to match frontend
  country: string;
  subscriptionPrice: number;
  birthDate: string;
  fullLegalName: string;

  // ✅ File uploads
  profilePic?: FileMetaType;
  idFrontPhoto?: FileMetaType;
  idBackPhoto?: FileMetaType;
  selfieWithId?: FileMetaType;
};

export type SafeUser = Partial<
  Omit<
    User,
    | "password"
    | "accessToken"
    | "emailVerificationToken"
    | "emailVerificationExpires"
    | "lastVerificationEmailSentAt"
    | "lastPasswordResetSentAt"
  >
> & {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  oauthProvider: string; // <- required
};
export type MessageType = {
  id?: string; // optional if you want to store per-message IDs
  type: "text" | "photo" | "video" | "file" | "voice";
  chat_id: string;
  sender_id: string | ObjectId;
  content?: string;             // plain text OR caption
  created_at: string;           // ISO string
  image_key?: string;           // Supabase storage key for image
  video_key?: string;           // Supabase storage key for video
  file_key?: string;            // Supabase storage key for other files
  voice_key?: string;           // Supabase storage key for voice notes
  blurred_key?: string;         // optional: blurred image placeholder
  duration?: number;           // useful for voice or video messages
  size?: number;               // file size in bytes
  ismassmessage?: boolean;
  // New fields for paid content
  price?: number;              // cost to unlock/view
  requires_payment?: boolean;
  viewed?: string[];      // list of user IDs who viewed
  purchased?: string[];   // true if message is locked until purchased
};
export type SupabaseMessageRealtime = {
  id: number;
  chat_id: string;
  sender_id: string;
  content: string;
  image_key?: string;
  video_key?: string;
  voice_key?: string;
  file_key?: string;
  blurred_key?: string;
  duration?: number;
  size?: number;
  created_at: string;
  viewed: string[];
  purchased: string[];
  price: number;
  ismassmessage: boolean;
};
export interface ReportType {
  _id: string;
  reporter: string | ObjectId;      // user ID of the reporter
  reporterName?: string;            // optional, resolved name for display
  creator: string | ObjectId;     // reported creator ID
  creatorName?: string;             // optional, resolved name for display
  post?: string | ObjectId | null; // optional if reporting a specific post
  reason: string;                   // e.g. "harassment", "spam", "other"
  details?: string;                 // optional additional details
  status?: "pending" | "reviewed";  // optional, could track moderation
  createdAt: string | Date;
  updatedAt?: string | Date;
}
export type Chat = {
  id: string;              // text, can store Mongo ObjectId
  participants: string[];  // array of Mongo ObjectIds
  created_at: string;
  updated_at: string;
};