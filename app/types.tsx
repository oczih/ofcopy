export type User = {
    id: string,
    avatar: string;
    username: string
    password: string
    email: string,
    name: string,
    googleId: string | null
    membership?: boolean
    hasAccess?: boolean
    lastUsernameChange: Date
    isUsernameChangeBlocked: boolean
    accessToken?: string
    subscriptions?: Subscription[]
    notifications?: Notification[]
    creator?: boolean
    following: Following[];
    comments: Comment[];
    emailVerified: boolean;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
    lastVerificationEmailSentAt: Date;
    lastPasswordResetSentAt: Date;
  }
  
export type Creator = {
    id: string;
    name: string;
    username: string;
    avatar: string;
    subscribers: number;
    followers: number
    isSubscribed: boolean;
    price: number;
    category: string;
    posts: Post[];
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
  userImage?: string;
  followingDate: Date;
}
export type Subscription = {
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorImage?: string;
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
  creatorImage?: string;
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
  height?: number;            // Optional image height
};
declare module "next-auth" {
  interface User {
    id?: string;
    username?: string;
    age?: number;
    googleId?: string;
    membership?: boolean;
    hasAccess?: boolean;
    email?: string;
    lastUsernameChange?: Date;
    isUsernameChangeBlocked?: boolean;
    accessToken?: string;
    subscriptions?: Subscription[] 
    notifications?: Notification[]
    creator?: boolean
    following?: Following[]
    comments?: Comment[];
    name?: string;
    image?: string;
    emailVerified: boolean;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
    lastVerificationEmailSentAt: Date;
    lastPasswordResetSentAt: Date;
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