import React from "react";
import ChatApp from "./MessagesApp"
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, users, safeSession } = await fetchPageData();

  return (
      <ChatApp creators={creators} users={users} session={safeSession} />
  );
}