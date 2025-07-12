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