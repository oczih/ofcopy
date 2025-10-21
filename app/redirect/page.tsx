import React from "react";

import RedirectPage from "./RedirectPage";
import { fetchPageData } from "@/lib/fetchDataPage";
export default async function Page() {
  const { creators, safeSession} = await fetchPageData();

  return (
    
    <RedirectPage
      creators={creators}
      session={safeSession}
    />
  
);
}