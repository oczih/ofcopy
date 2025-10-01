'use client'

import { Button } from "./ui/button";
import {
  Home,
  Compass,
  MessageCircle,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  LogOut,
  DollarSign,
  BarChart3,
  UserCircle,
  Megaphone,
  Wallet,
  X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname} from "next/navigation";
import Image from "next/image";
import { Creator, User } from "../app/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Session } from "next-auth";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  session: Session | null;
  creators: Creator[];
  users: User[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const Sidebar = ({
  onCollapseChange,
  session,
  creators,
  isSidebarOpen,
  setIsSidebarOpen
}: SidebarProps) => {
  const pathname = usePathname();
  const status = session ? "authenticated" : "unauthenticated";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const user = session?.user as User | undefined;
  const isCreator = !!user?.creator;

  const [creator, setCreator] = useState<Creator | null>(null);
  const lastFetchedAvatarKey = useRef<string | null>(null);

  // Fetch creator
  useEffect(() => {
    if (session?.user?._id && creators) {
      const found = creators.find((c) => c.user === session.user._id);
      setCreator(found || null);
    }
  }, [session?.user?._id, creators]);

  const avatarKey = creator?.avatarKey || session?.user?.avatarKey;

  useEffect(() => {
    if (!avatarKey) return setLoadingAvatar(false);
    if (avatarKey === lastFetchedAvatarKey.current) return setLoadingAvatar(false);

    const fetchAvatar = async () => {
      setLoadingAvatar(true);
      if (avatarKey.startsWith("http")) {
        setAvatarUrl(avatarKey);
        lastFetchedAvatarKey.current = avatarKey;
        setLoadingAvatar(false);
        return;
      }

      try {
        const key = avatarKey.replace(/^\/+/, "");
        const res = await fetch("/api/media/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: key })
        });
        const data = await res.json();
        if (data.downloadUrl?.startsWith("http")) setAvatarUrl(data.downloadUrl);
        else setAvatarError(true);
      } catch {
        setAvatarError(true);
      } finally {
        setLoadingAvatar(false);
      }
    };

    fetchAvatar();
  }, [avatarKey]);

  useEffect(() => {
    if (status === "authenticated") setLoadingSession(false);
  }, [status]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    requestAnimationFrame(() => onCollapseChange?.(newState));
  };

  const handleSignOut = async () => {
    localStorage.removeItem("user");
    await signOut({ callbackUrl: "/login" });
  };

  const renderAvatar = () => {
    if (loadingSession || loadingAvatar)
      return <Skeleton className="w-12 h-12 rounded-full" />;

    if (avatarUrl && !avatarError) {
      return (
        <Image
          src={avatarUrl}
          alt={user?.name || "User"}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full border-2 border-pink-500/40 shadow-lg"
          onError={() => setAvatarError(true)}
          unoptimized
        />
      );
    }

    return (
      <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl border-2 border-pink-500/40 shadow-lg">
        {user?.name?.charAt(0).toUpperCase() || "U"}
      </div>
    );
  };

  // Menu logic
  const baseMenu = [
    { id: "feed", label: "Home Feed", icon: Home, href: "/home" },
    { id: "discover", label: "Discover", icon: Compass, href: "/discover" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/notifications" },
    { id: "messages", label: "Messages", icon: MessageCircle, href: "/messages" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" }
  ];

  const userOnlyMenu = [
    { id: "following", label: "Following", icon: UserCheck, href: "/following" },
    { id: "promotions", label: "Promotions", icon: Megaphone, href: "/promotions" },
    { id: "profile", label: "Profile", icon: UserCircle, href: `/${user?.username}` }
  ];

  const creatorOnlyMenu = [
    { id: "insights", label: "Insights", icon: BarChart3, href: "/insights" },
    { id: "earnings", label: "Earnings", icon: DollarSign, href: "/earnings" }
  ];

  // If no session → only show "Home" that goes to /login
  const menuItems = session
    ? isCreator
      ? [...baseMenu, ...creatorOnlyMenu]
      : [...baseMenu, ...userOnlyMenu]
    : [
        {
          id: "home",
          label: "Home",
          icon: Home,
          href: "/login" // force login if clicked
        }
      ];

  const getButtonStyles = (isActive: boolean) => {
    return isActive
      ? `bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl`
      : `text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer`;
  };

  const renderSidebarContent = () => (
    <>
      {session && (
        <Button
          onClick={toggleCollapse}
          variant="ghost"
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-800 border border-white/20 text-white hover:bg-slate-700 hidden md:flex items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      )}

      {/* Avatar and name (only if logged in) */}
      {session && (
        <div
          className={`flex flex-col items-center transition-all duration-300 ${
            isCollapsed ? "mt-6" : "mt-1"
          } mb-4`}
        >
          <Link
            href={`/${creator?.username || user?.username}`}
            className="flex flex-col items-center"
          >
            {renderAvatar()}
            {!isCollapsed && (
              <div className="text-center mt-2">
                <div className="text-white font-semibold">
                  {creator?.name || user?.name}
                </div>
                <div className="text-pink-400">
                  @{creator?.username || user?.username}
                </div>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 flex flex-col space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.id} href={item.href}>
              <button
                className={`w-full ${
                  isCollapsed ? "justify-center px-2" : "justify-start px-4"
                } py-3 rounded-2xl text-center flex flex-row transition-all duration-300 ${getButtonStyles(
                  isActive
                )}`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isCollapsed ? "mr-0" : "mr-3"
                  } transition-all duration-300`}
                />
                {!isCollapsed && (
                  <span className="font-medium opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
              </button>
            </Link>
          );
        })}
      </nav>
      {session?.user?.creator && (
          <div className="relative mt-2"
          >
            <Link href="/upload">
                    <button
          className={`w-full cursor-pointer
            ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-center py-4 px-4'}
            rounded-2xl
            transition-[outline-color,outline-width,outline-offset,background-color]
            hover:outline hover:outline-white transition-colors duration-300
            bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500
            text-white font-semibold
            ${isCollapsed ? 'text-base' : 'text-lg'}
            shadow-lg flex items-center
            ${isCollapsed ? 'gap-0' : 'gap-3'}
            mt-4 mb-2`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${isCollapsed ? 'mr-0' : ''} transition-all duration-300`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
          {!isCollapsed && (
            <span className="opacity-100 transition-opacity duration-300">
              Upload Content
            </span>
          )}
        </button>
            </Link>
          </div>
        )}
      {/* Sign out (only if logged in) */}
      {session && (
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-2 mt-4 w-full cursor-pointer ${
            isCollapsed
              ? "justify-center px-2 py-2"
              : "justify-start px-4 py-3"
          } rounded-full text-white hover:bg-red-500/40 transition duration-200`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 right-0 h-screen z-40 w-3/4 max-w-[75vw]
          bg-gradient-to-b from-slate-900/80 via-purple-900/70 to-slate-900/90
          backdrop-blur-xl border-l border-white/10 shadow-2xl p-4
          transform transition-transform
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} md:hidden`}
      >
        <button
          className="absolute top-4 left-4"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X />
        </button>
        {renderSidebarContent()}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 bg-gradient-to-b from-slate-900/80 via-purple-900/70 to-slate-900/90
          backdrop-blur-xl border-r border-white/10 shadow-2xl p-4 transition-all ${
            session && isCollapsed ? "w-20" : "w-72"
          }`}
      >
        {session && (
          <Button
            onClick={toggleCollapse}
            className="absolute -right-3 top-6 md:flex hidden w-6 h-6"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </Button>
        )}
        {renderSidebarContent()}
      </aside>
    </>
  );
};
