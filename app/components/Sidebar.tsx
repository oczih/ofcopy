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
    <aside className="w-72 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-fit sticky top-28 shadow-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-pink-400" />
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
        </div>
        <p className="text-gray-400 text-sm">Explore and create amazing content</p>
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
        {session?.user && (
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
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-pink-500/20 rounded-2xl border border-yellow-500/30 p-6 group hover:scale-105 transition-all duration-300 cursor-pointer">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Link href="/upload" className="text-center">
          Upload Content
        </Link>
          
      </div>
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
