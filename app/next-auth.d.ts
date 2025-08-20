// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { Following, Subscription, Notification } from "./types";

declare module "next-auth" {
  interface User extends DefaultUser {
    _id: string;
    username?: string;
    age?: number;
    googleId?: string;
    membership?: boolean;
    bio?: string;
    createdAt: string;
    location?: string;
    hasAccess?: boolean;
    avatarKey?: string;
    lastUsernameChange?: Date;
    isUsernameChangeBlocked?: boolean;
    subscriptions?: Subscription[];
    notifications?: Notification[];
    following?: Following[];
    creator?: boolean;
    emailVerified?: boolean;
    oauthProvider: string; // optional to avoid TS errors
  }

  interface Session extends DefaultSession {
    user: User;
    accessToken?: string;
  }
}
