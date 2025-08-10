import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import AppWrapper from "@/components/AppWrapper";
import App from "./usernamePage"; // Your client component
import { redirect } from "next/navigation";
import { fetchPageData } from "@/lib/fetchDataPage";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { creators, users, safeSession } = await fetchPageData();

  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect("/login");
  }
  console.log("paskat", creators)
  await connectDB();
  const {username} = params
  // Sanitize your data if needed here

  return (
    <AppWrapper creators={creators} users={users} session={safeSession}>
  <App creators={creators} users={users} session={safeSession} username={username.toLowerCase()} />
</AppWrapper>
  );
}
