// lib/fetchPageData.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import CreatorModel from "@/app/models/creatormodel";
import UserModel from "@/app/models/usermodel";
import { redirect } from "next/navigation";
import { Creator, User } from "@/app/types";
import NotificationModel from "@/app/models/notificationmodel";

function deepSanitize<T>(obj: T, seen = new WeakSet()): T | null {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "object") {
    if (seen.has(obj)) {
      return null;
    }
    seen.add(obj);
  }

  // @ts-expect-error ObjectId has _bsontype but TS doesn't know
  if (obj && obj._bsontype === "ObjectId") {
    return obj.toString() as unknown as T;
  }

  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item, seen)) as unknown as T;
  }

  if (typeof obj === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedObj[key] = deepSanitize(value, seen);
    }
    return sanitizedObj as T;
  }

  return obj;
}




export async function fetchPageData() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  console.log("vittu",session)
  await connectDB();
  let dbUser = null;
  if (session.user?.id) {
    dbUser = await UserModel.findById(session.user.id).lean();
  } else if (session.user?.email) {
    dbUser = await UserModel.findOne({ email: session.user.email }).lean();
  }
  
  const creatorsRaw = await CreatorModel.find({}).populate("posts").lean<Creator>({ virtuals: true });
  const notificationsRaw = await NotificationModel.find({}).populate("users").lean<Notification>({virtuals: true})

  const usersRaw = await UserModel.find({}).lean<User>({ virtuals: true });
const creatorsSanitized = deepSanitize(creatorsRaw) ?? [];
const usersSanitized = deepSanitize(usersRaw) ?? [];
  const notificationsSanitized = deepSanitize(notificationsRaw) ?? [];
  return {
    creators: creatorsSanitized as Creator[],
    users: usersSanitized as User[],
    notifications: notificationsSanitized as Notification[], 
    safeSession: deepSanitize({
      ...session,
      user: { ...session.user, ...dbUser }
    }),
  };
}
