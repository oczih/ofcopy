"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Creator, User } from "@/app/types";
import { Session } from "next-auth";
import Link from "next/link";
import { Home, Bell, MessageCircle, UserCircle } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Skeleton } from "./ui/skeleton";

export default function AppWrapper({
  children,
  creators,
  users,
  session,
  hideHotbar = false,
}: {
  children: React.ReactNode;
  creators: Creator[];
  users: User[];
  session: Session | null;
  hideHotbar?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const lastFetchedAvatarKey = useRef<string | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const pathname = usePathname();
  
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Find the creator
  useEffect(() => {
    if (session?.user?._id && creators) {
      const found = creators.find((c) => c.user === session.user._id);
      setCreator(found || null);
    }
  }, [session?.user?._id, creators]);

  const avatarKey = creator?.avatarKey || session?.user?.avatarKey;

  useEffect(() => {
    if (!avatarKey) {
      setAvatarUrl(null);
      setLoadingAvatar(false);
      return;
    }
    if (avatarKey === lastFetchedAvatarKey.current) {
      setLoadingAvatar(false);
      return;
    }

    const fetchAvatarUrl = async () => {
      setLoadingAvatar(true);
      if (avatarKey.startsWith("http")) {
        setAvatarUrl(avatarKey);
        lastFetchedAvatarKey.current = avatarKey;
        setLoadingAvatar(false);
        return;
      }
      try {
        setAvatarError(false);
        const key = avatarKey.replace(/^\/+/, "");
        const res = await fetch("/api/media/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: key }),
        });
        const data = await res.json();
        if (data.downloadUrl?.startsWith("http")) {
          setAvatarUrl(data.downloadUrl);
        } else setAvatarError(true);
      } catch {
        setAvatarError(true);
      } finally {
        setLoadingAvatar(false);
      }
    };

    fetchAvatarUrl();
  }, [avatarKey]);
  // Detect blog subdomain
  const [isBlogSubdomain, setIsBlogSubdomain] = useState<boolean | null>(null);
  useEffect(() => {
    const currentHost = window.location.host;
    setIsBlogSubdomain(currentHost.startsWith("blog."));
  }, []);

  // Don't render layout until we know if it's blog
  if (isBlogSubdomain === null) return null;

  const PUBLIC_ROUTES = [
    "tos",
    "privacy",
    "child-protection",
    "anti-slavery",
    "guidelines",
    "dmca",
    "cookiepolicy",
    "login",
    "signup",
    "verify",
    "forgot-password",
    "/", // homepage
    "about",
  ];

  const currentRoute = pathname === "/" ? "/" : pathname.split("/")[1];
  const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute);

  // Determine if sidebar should show
  const showSidebar = !isPublicRoute && !isBlogSubdomain;

  return (
    <div className="min-h-screen w-full bg-[#3b0364] relative overflow-hidden">
          <div className="w-full bg-pink-600 text-white py-2 px-4 text-center text-sm sm:text-base font-medium">
  ⚠️ We are currently in beta. Please contact{" "}
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      window.location.href = "mailto:" + "support" + "@" + "fanslio.com";
    }}
    className="underline font-semibold"
  >
    support@fanslio.com
  </a>{" "}
  if you face any issues.
</div>
      {showSidebar && (
        <>
          <Sidebar
            onCollapseChange={setSidebarCollapsed}
            creators={creators}
            users={users}
            session={session}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </>
      )}

      <div
        className={`transition-all duration-300 ${
          isPublicRoute || isBlogSubdomain
            ? "md:ml-0"
            : sidebarCollapsed
            ? "md:ml-20"
            : "md:ml-72"
        }`}
      >
        {showSidebar && (
          <div
            className={`fixed bottom-0 left-0 w-full bg-slate-900/90 border-t border-white/10 
            flex justify-around items-center py-2 md:hidden z-30
            ${isSidebarOpen || hideHotbar ? "hidden" : "flex"}`}
          >
            <Link href="/home">
              <Home className="w-6 h-6 text-white" />
            </Link>

            <Link href="/notifications">
              <Bell className="w-6 h-6 text-white" />
            </Link>

            <Link href="/upload">
              <button className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 
              rounded-full flex items-center justify-center text-white shadow-lg -mt-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </Link>

            <Link href="/messages">
              <MessageCircle className="w-6 h-6 text-white" />
            </Link>

            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {loadingAvatar ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : avatarUrl && !avatarError ? (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full border border-pink-500/40 shadow-md"
                />
              ) : (
                <UserCircle className="w-7 h-7 text-white" />
              )}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
