import React from "react";
import AppWrapper from "@/components/AppWrapper";
import App from "./UploadingPage";
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, users, safeSession } = await fetchPageData();
  console.log("seffi", safeSession)
  return (
    <AppWrapper creators={creators} users={users} session={safeSession}>
      <App creators={creators} users={users} session={safeSession} />
    </AppWrapper>
  );
}
