import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import CreatorModel from "@/app/models/creatormodel";
import UserModel from "@/app/models/usermodel";
import AppWrapper from "@/components/AppWrapper";
import App from "./usernamePage"; // Your client component
import { redirect } from "next/navigation";
import type { Creator, User } from "../types";
import { fetchPageData } from "@/lib/fetchDataPage";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { creators, users, safeSession } = await fetchPageData();
  const { username } = params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect("/login");
  }

  await connectDB();

  const creatorsRaw = await CreatorModel.find({}).populate("posts").lean<Creator[]>();
  const usersRaw = await UserModel.find({}).lean<User[]>();

  // Sanitize your data if needed here

  return (
    <AppWrapper creators={creators} users={users} session={safeSession}>
      <App creators={creatorsRaw} users={usersRaw} session={session} username={username.toLowerCase()} />
    </AppWrapper>
  );
}
