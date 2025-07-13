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