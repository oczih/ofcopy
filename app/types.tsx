import mongoose from "mongoose";

export type User = {
    id: string,
    avatarKey?: string;
    username: string
    password: string
    email: string,
    bio?: string;
    name: string,
    googleId: string | null
    membership?: boolean
    hasAccess?: boolean
    lastUsernameChange: Date
    isUsernameChangeBlocked: boolean
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
    purchases: Purchase[];
    createdAt: string;
  }
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
    id: string;
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
  }
export type Notification = {
  type: 'newsub' | 'resub' | 'tip' | 'subcancel' | 'comment' | 'like' | 'newfollower',
  date: Date,
  seen: boolean
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
  commentId: string;
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
export type Post = {
  _id: string;
  creator: string;            // Just the ID string, unless you populate the whole creator
  s3Key?: string;
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
};
declare module "next-auth" {
  interface User {
    id: string;
    username?: string;
    age?: number;
    googleId?: string;
    membership?: boolean;
    bio?: string;
    password: string;
    createdAt: string;
    location: string;
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
    emailVerified: boolean;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
    lastVerificationEmailSentAt: Date;
    lastPasswordResetSentAt: Date;
    purchases: Purchase[];
  }

  interface Session {
    user: User & {
      name?: string;
      email?: string;
      image?: string;
    };
    accessToken?: string;
  }
}
