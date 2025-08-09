import React from "react";
import AppWrapper from "@/components/AppWrapper";
import App from "./DiscoverPage";
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, users, safeSession } = await fetchPageData();

  return (
    <AppWrapper>
      <App creators={creators} users={users} session={safeSession} />
    </AppWrapper>
  );
}
