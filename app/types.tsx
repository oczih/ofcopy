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