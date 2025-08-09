// app/yourpage/page.tsx (Server component)
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import CreatorModel from "@/app/models/creatormodel";
import UserModel from "@/app/models/usermodel";
import AppWrapper from "@/components/AppWrapper";
import App from "./FeedClient";
import { redirect } from "next/navigation";

// 🔹 Generic deep sanitizer
function deepSanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  // Convert MongoDB ObjectId to string
  if (typeof obj?.toString === "function" && obj._bsontype === "ObjectID") {
    return obj.toString();
  }

  // Convert Dates to ISO strings
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item));
  }

  // Handle plain objects
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepSanitize(value)])
    );
  }

  // Primitives remain unchanged
  return obj;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect("/login");
  }

  await connectDB();

  const creatorsRaw = await CreatorModel.find({}).populate("posts").lean();
  const usersRaw = await UserModel.find({}).lean();

  const creators = deepSanitize(creatorsRaw);
  const users = deepSanitize(usersRaw);
  const safeSession = deepSanitize(session);

  return (
    <AppWrapper>
      <App creators={creators} users={users} session={safeSession} />
    </AppWrapper>
  );
}
