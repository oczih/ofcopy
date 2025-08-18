import mongoose from "mongoose";

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
    location?: string;
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
    price: number;
    category: string;
    posts?: Post[];
    user: string;
    totalEarnings: number;
    currentBalance: number;
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
  blurredKey?: string;   // Optional blurred version
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

export type SafeUser = Partial<
  Omit<
    User,
    | "password"
    | "accessToken"
    | "oauthProvider"
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
};
