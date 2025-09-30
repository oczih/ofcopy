import { ReactNode } from "react";
import BlogLayout from "./BlogLayout";
import { Analytics } from "@vercel/analytics/next";

export default function BlogRootLayout({ children }: { children: ReactNode }) {
  return (
    <BlogLayout>
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
    </BlogLayout>
  );
}