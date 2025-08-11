import React from "react";
import AppWrapper from "@/components/AppWrapper";
import App from "./NotificationsPage";
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, users, safeSession, notifications } = await fetchPageData();
  return (
    <AppWrapper creators={creators} users={users} session={safeSession}>
      <App creators={creators} users={users} session={safeSession} notifications={notifications} />
    </AppWrapper>
  );
}
