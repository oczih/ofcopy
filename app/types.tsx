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
  }
  
export type Creator = {
    id: string;
    name: string;
    username: string;
    avatar: string;
    subscribers: number;
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
export type Comment = {
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
}

export type Post = {
  _id: string;
  creator: string;            // Just the ID string, unless you populate the whole creator
  s3Key: string;
  type: string;
  caption: string;
  createdAt: string | Date;   // Depending on usage
  viewableFor: string;
  comments: Comment[];            // Replace with proper Comment type if you have it
  signedUrl?: string;         // Optional signed URL added at runtime (not stored in DB)
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