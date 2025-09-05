import React from "react";

import  MassMessageApp from "./MassMessagesApp"
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page() {
  const { creators, users, safeSession } = await fetchPageData();

  return (
    
      <MassMessageApp creators={creators} users={users} session={safeSession} />
    
  );
}