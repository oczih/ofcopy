import React from "react";

import App from "./FeedClient";
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, users, safeSession } = await fetchPageData();

  return (
    
      <App creators={creators} users={users} session={safeSession} />
    
  );
}
