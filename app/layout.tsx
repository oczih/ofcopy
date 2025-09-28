// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";
import { fetchPageData } from "@/lib/fetchDataPage";
import ClientAppWrapper from "@/components/ClientAppWrapper";
import Script from "next/script"; // 👈 import Script
import { Analytics } from "@vercel/analytics/next"
import { faqData } from "./data/faqData";
export const metadata: Metadata = {
  title: "Fanslio | New Generation Fan Interaction Platform",
  description: "Premium content platform for creators and fans – share exclusive content, connect with your audience, and grow your community.",
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
      <head>
        <link rel="canonical" href="https://fanslio.com/" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/* ✅ Cookiebot script */}
                <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="eb8887b2-69db-41fc-b9c9-a9bc5574d2b1"
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />
        <Script
          id="faq-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqData.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.answer,
                },
              })),
            }),
          }}
        />
        <SessionProviderWrapper>
          <ClientAppWrapper creators={creators} users={users} session={safeSession}>
            {children}
            {process.env.NODE_ENV === "production" && <Analytics />}
          </ClientAppWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
