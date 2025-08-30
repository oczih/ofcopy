import React from "react";
import { connectDB } from "@/lib/mongoose";
import AppWrapper from "@/components/AppWrapper";
import App from "./usernamePage"; // Your client component
import { notFound } from "next/navigation";
import { fetchPageData } from "@/lib/fetchDataPage";
import UserModel from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
type PageParams = { username: string };

export default async function Page(props: unknown) {
  // Assert the type so TypeScript knows `params` exists
  const { params } = props as { params: PageParams };
  const username = await params.username.toLowerCase();
  await connectDB();
  const creator = await CreatorModel.findOne({ username: username.toLowerCase() })
 
  const user = await UserModel.findOne({ username: username.toLowerCase() });
  if (!creator && !user) notFound();
  const { creators, users, safeSession, chats } = await fetchPageData();

  // Sanitize your data if needed here
  
  return (
    <AppWrapper creators={creators ?? []} users={users} session={safeSession}>
    <App creators={creators} users={users} session={safeSession} username={username.toLowerCase()} chats={chats} />
    </AppWrapper>
  );
}
