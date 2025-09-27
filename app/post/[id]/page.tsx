import React from "react";

import App from "./ViewPostPage";
import { fetchPageData } from "@/lib/fetchDataPage";

interface Params {
  id: string;
}
export default async function Page(
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
    const { creators, users, safeSession, posts, purchases } = await fetchPageData();
  
    return (
      
        <App
          creators={creators}
          users={users}
          session={safeSession}
          postId={id}
          posts={posts}
          purchases={purchases}
        />
      
    );
  }
  