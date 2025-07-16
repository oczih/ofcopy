'use client'

import { Button } from "./ui/button";
import { 
  Home, 
  Compass, 
  MessageCircle, 
  Settings,
  Crown,
  TrendingUp,
  Bell
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  console.log(session?.user)
  const menuItems = [
    { id: "feed", label: "Home Feed", icon: Home, color: "pink", href: "/" },
    { id: "discover", label: "Discover", icon: Compass, color: "purple", href: "/discover" },
    { id: "messages", label: "Messages", icon: MessageCircle, color: "blue", href: "/messages" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "red", href: "/notifications" },
    { id: "subscriptions", label: "Subscriptions", icon: Crown, color: "yellow", href: "/subscriptions" },
    // Settings will be conditionally rendered below
  ];

  const getButtonStyles = (isActive: boolean) => {
    if (isActive) {
      return `bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl`;
    }
    return `text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105`;
  };

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 z-30 bg-gradient-to-b from-slate-900/80 via-purple-900/70 to-slate-900/90 backdrop-blur-xl border-r border-white/10 shadow-2xl p-6 flex flex-col">
      {/* User Profile Section */}
      {session?.user && (
        <div className="flex flex-col items-center mb-10 mt-2">
          <Avatar className="w-20 h-20 border-4 border-pink-500/40 shadow-lg mb-3">
            <AvatarImage src={session.user.image} alt={session.user.name || session.user.username} />
            <AvatarFallback>{session.user.name?.[0] || session.user.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <div className="text-lg font-semibold text-white truncate max-w-[12rem]">{session.user.name}</div>
            <div className="text-sm text-pink-400 truncate max-w-[12rem]">@{session.user.username}</div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {/* Removed TrendingUp and Navigation title */}
        </div>
        {/* Removed subtitle */}
      </div>

      <nav className="space-y-2 mb-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.id} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start py-3 px-4 rounded-2xl transition-all duration-300 ${getButtonStyles(isActive)}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Button>
            </Link>
          );
        })}
        {/* Only show Settings if user is logged in */}
        {session?.user && !session.user.creator && (
          <div>
          <Link key="settings" href="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start py-3 px-4 rounded-2xl transition-all duration-300 ${getButtonStyles(pathname === "/settings")}`}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium">Settings</span>
              {pathname === "/settings" && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Button>
          </Link>
          <Link href="/apply-creator">
          <Button
              variant="ghost"
              className={`w-full justify-start py-3 px-4 rounded-2xl transition-all duration-300 ${getButtonStyles(pathname === "/apply-creator")}`}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium">Apply Creator</span>
              {pathname === "/apply-creator" && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Button>
          </Link>
          </div>
        )}
      </nav>
      {session?.user?.creator && 
        <Link href="/upload">
          <Button
            variant="default"
            className="w-full justify-center py-4 px-4 rounded-2xl transition-all duration-300 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-semibold text-lg shadow-lg hover:scale-105 flex items-center gap-3 mt-4 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
            Upload Content
          </Button>
        </Link>
      }
      {/* Stats section */}
      <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
        <h4 className="text-white font-semibold mb-3 text-sm">Your Activity</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subscriptions</span>
            <span className="text-pink-400 font-medium">{session?.user?.subscriptions?.length || 0}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Total Creators</span>
            <span className="text-purple-400 font-medium">{session?.user?.subscriptions?.length || 0}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Active Subscriptions</span>
            <span className="text-blue-400 font-medium">
              {session?.user?.subscriptions?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
