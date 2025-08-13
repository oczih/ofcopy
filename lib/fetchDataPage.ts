// lib/fetchPageData.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import CreatorModel from "@/app/models/creatormodel";
import UserModel from "@/app/models/usermodel";
import { redirect } from "next/navigation";
import { Creator, User, Notification } from "@/app/types";
import NotificationModel from "@/app/models/notificationmodel";
import { Session } from "next-auth";

// Convert ObjectId and Dates recursively
function deepSanitize<T>(obj: T, seen = new WeakSet()): T {
  if (obj === null || obj === undefined) return obj as T;

  if (typeof obj === "object") {
    if (seen.has(obj)) return obj as T;
    seen.add(obj);
  }

  // @ts-expect-error ObjectId check
  if (obj && obj._bsontype === "ObjectId") return obj.toString() as unknown as T;
  if (obj instanceof Date) return obj.toISOString() as unknown as T;

  if (Array.isArray(obj)) return obj.map((item) => deepSanitize(item, seen)) as unknown as T;

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "password" || key === "__v") continue; // remove private fields
      sanitized[key] = deepSanitize(value, seen);
    }
    return sanitized as T;
  }

  return obj;
}

// Ensure the user object conforms to NextAuth.User
function normalizeUser(user: any): Session["user"] {
  return {
    _id: user._id?.toString() ?? "",
    username: user.username,
    age: user.age,
    googleId: user.googleId,
    membership: user.membership,
    bio: user.bio,
    createdAt: user.createdAt?.toString() ?? new Date().toISOString(),
    location: user.location,
    hasAccess: user.hasAccess,
    avatarKey: user.avatarKey,
    lastUsernameChange: user.lastUsernameChange,
    isUsernameChangeBlocked: user.isUsernameChangeBlocked,
    subscriptions: user.subscriptions ?? [],
    notifications: user.notifications ?? [],
    following: user.following ?? [],
    creator: user.creator,
    emailVerified: user.emailVerified,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export async function fetchPageData() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await connectDB();

  let dbUser: any = null;
  if (session.user?._id) {
    dbUser = await UserModel.findById(session.user._id).lean();
  } else if (session.user?.email) {
    dbUser = await UserModel.findOne({ email: session.user.email }).lean();
  }

  const creatorsRaw = await CreatorModel.find({}).populate("posts").lean<Creator[]>({ virtuals: true });
  const notificationsRaw = await NotificationModel.find({}).lean<Notification[]>({ virtuals: true });
  const usersRaw = await UserModel.find({}).lean<User[]>({ virtuals: true });

  const creatorsSanitized = deepSanitize(creatorsRaw) ?? [];
  const usersSanitized = deepSanitize(usersRaw) ?? [];
  const notificationsSanitized = deepSanitize(notificationsRaw) ?? [];

  const safeSession: Session | null = session
    ? {
        ...session,
        user: normalizeUser({ ...session.user, ...dbUser }),
      }
    : null;

  return {
    creators: creatorsSanitized as Creator[],
    users: usersSanitized as User[],
    notifications: notificationsSanitized as Notification[],
    safeSession,
  };
}
