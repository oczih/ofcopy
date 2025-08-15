import React from "react";
import AppWrapper from "@/components/AppWrapper";
import App from "./ViewPostPage";
import { fetchPageData } from "@/lib/fetchDataPage";

interface Params {
  id: string;
}
export default async function Page(
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
    const { creators, users, safeSession, posts } = await fetchPageData();
  
    return (
      <AppWrapper creators={creators} users={users} session={safeSession}>
        <App
          creators={creators}
          users={users}
          session={safeSession}
          postId={id}
          posts={posts}
        />
      </AppWrapper>
    );
  }
  