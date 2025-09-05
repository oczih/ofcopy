// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { fetchPageData } from "@/lib/fetchDataPage";
import ClientAppWrapper from "@/components/ClientAppWrapper";

export const metadata: Metadata = {
  title: "Fanslio",
  description: "Premium AI content platform for creators and fans.",
  icons: {
    icon: "/fanslioIconSVG.svg",
  },
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { creators, users, safeSession } = await fetchPageData();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProviderWrapper>
          <ClientAppWrapper creators={creators} users={users} session={safeSession}>
            {children}
          </ClientAppWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
