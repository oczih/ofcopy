import React from "react";
import AppWrapper from "@/components/AppWrapper";
import App from "./ViewPostPage";
import { fetchPageData } from "@/lib/fetchDataPage";

export default async function Page({
    params,
  }: {
    params: { id: string };
  }) {
    const { id } = params;
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
  