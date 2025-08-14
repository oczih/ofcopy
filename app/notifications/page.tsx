import React from "react";
import AppWrapper from "@/components/AppWrapper";
import App from "./NotificationsPage";
import { fetchPageData } from "@/lib/fetchDataPage";
import type { Notification, Notification as NotificationType } from "../types";
export default async function Page() {
  const { creators, users, safeSession, notifications: rawNotifications } = await fetchPageData();

  const notifications: NotificationType[] = (rawNotifications || []).map((n: Notification) => ({
    ...n,
    date: new Date(n.date),
  }));

  return (
    <AppWrapper creators={creators} users={users} session={safeSession}>
      <App
        creators={creators}
        users={users}
        session={safeSession}
        notifications={notifications}
      />
    </AppWrapper>
  );
}
