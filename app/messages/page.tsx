import React from "react";
import AppWrapper from "@/components/AppWrapper";
import ChatApp from "./MessagesApp"
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, users, safeSession } = await fetchPageData();

  return (
    <AppWrapper creators={creators} users={users} session={safeSession}>
      <ChatApp creators={creators} users={users} session={safeSession} />
    </AppWrapper>
  );
}