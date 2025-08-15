import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import AppWrapper from "@/components/AppWrapper";
import App from "./usernamePage"; // Your client component
import { notFound, redirect } from "next/navigation";
import { fetchPageData } from "@/lib/fetchDataPage";
import UserModel from "@/app/models/usermodel";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  const { username } = resolvedParams;
  await connectDB();
  const user = await UserModel.findOne({ username: username.toLowerCase() });
  console.log("user:", user)
  if (!user) {
    notFound();
  }
  const { creators, users, safeSession } = await fetchPageData();

  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect("/login");
  }
  console.log("paskat", creators)
  
  // Sanitize your data if needed here
  
  return (
    <AppWrapper creators={creators ?? []} users={users} session={safeSession}>
    <App creators={creators} users={users} session={safeSession} username={username.toLowerCase()} />
    </AppWrapper>
  );
}
