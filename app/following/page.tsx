import React from "react";

import App from "./FollowingPage";
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, safeSession } = await fetchPageData();

  return (
    
      <App creators={creators} session={safeSession} />
    
  );
}
