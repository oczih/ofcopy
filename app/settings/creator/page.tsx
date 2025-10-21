import React from "react";

import CreatorSettingsPage from "./CreatorSettings";
import { fetchPageData } from "@/lib/fetchDataPage";
export default async function Page() {
  const { creators, users, safeSession } = await fetchPageData();

  return (
    
      <CreatorSettingsPage creators={creators} users={users} session={safeSession} />
    
  );
}
