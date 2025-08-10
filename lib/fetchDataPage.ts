// lib/fetchPageData.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import CreatorModel from "@/app/models/creatormodel";
import UserModel from "@/app/models/usermodel";
import { redirect } from "next/navigation";

function deepSanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj?.toString === "function" && obj._bsontype === "ObjectID") {
    return obj.toString();
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item));
  }

  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepSanitize(value)])
    );
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
  
  const creatorsRaw = await CreatorModel.find({}).populate("posts").lean();
  const usersRaw = await UserModel.find({}).lean();
  console.log("kakkak", deepSanitize(creatorsRaw))
  console.log("vitu", deepSanitize(usersRaw))
  console.log("homo", session)
  return {
    creators: deepSanitize(creatorsRaw),
    users: deepSanitize(usersRaw),
     safeSession: deepSanitize({
    ...session,
    user: { ...session.user, ...dbUser }
  }),
  };
}
