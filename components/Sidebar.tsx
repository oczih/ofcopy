'use client'

import { Button } from "./ui/button";
import {
  Home,
  Compass,
  MessageCircle,
  Settings,
  Crown,
  Bell,
  ChevronLeft,
  ChevronRight, 
  UserCheck,
  LogOut
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname} from "next/navigation";
import Image from "next/image";
import creatorservice from "../app/services/creatorservice";
import { Creator } from "../app/types";
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
    console.log("moro: ", session?.user)
  const menuItems = [
    { id: "feed", label: "Home Feed", icon: Home, color: "pink", href: "/home" },
    { id: "discover", label: "Discover", icon: Compass, color: "purple", href: "/discover" },
    { id: "messages", label: "Messages (Coming Soon!)", icon: MessageCircle, color: "blue", href: "/messages" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "red", href: "/notifications" },
    { id: "subscriptions", label: "Subscriptions", icon: Crown, color: "yellow", href: "/subscriptions" },
    { id: "settings", label: "Settings", icon: Settings, color: "green", href: "/settings" },
  ];

  const [creator, setCreator] = useState<Creator | null>(null);

  useEffect(() => {
    const fetchCreator = async () => {
      if (session?.user?.id) {
        try {
          const creatorsData = await creatorservice.get();
          console.log("Creatordata:", creatorsData)
          const found = creatorsData.creators.find((c: Creator) => c.user === session.user.id);
          console.log("Found:", found)
          setCreator(found || null);
        } catch (error) {
          setCreator(null);
          throw error
        }
      }
    };
    fetchCreator();
  }, [session?.user?.id]);
  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (session?.user?.avatarKey) {
        try {
          setImageLoading(true);
          setAvatarError(false);
          
          const key = session.user.avatarKey.replace(/^\/+/, ''); // remove leading slash
          const res = await fetch("/api/media/download-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ s3Key: key }),
          });
          
          console.log("res:", res.body)
          
          if (!res.ok) {
            throw new Error(`Failed to fetch avatar URL: ${res.status}`);
          }
          
          const data = await res.json();
          
          // Validate that we got a proper URL
          if (data.downloadUrl && (data.downloadUrl.startsWith('http://') || data.downloadUrl.startsWith('https://'))) {
            setAvatarUrl(data.downloadUrl);
          } else {
            console.error('Invalid avatar URL received:', data.downloadUrl);
            setAvatarError(true);
          }
        } catch (error) {
          console.error('Error fetching avatar URL:', error);
          setAvatarError(true);
        } finally {
          setImageLoading(false);
        }
      } else {
        setImageLoading(false);
      }
    };

    fetchAvatarUrl();
  }, [session?.user?.avatarKey]);

  const getButtonStyles = (isActive: boolean) => {
    if (isActive) {
      return `bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl`;
    }
    return `text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer`;
  };

  const handleSignOut = async () => {
    localStorage.removeItem('user');
    await signOut({ callbackUrl: '/login' }); 
  };


  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const renderAvatar = () => {
    if (imageLoading) {
      return <Skeleton className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />;
    }

    if (!session?.user) {
      return <Skeleton className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />;
    }

    // If we have a valid avatar URL and no error, show the image
    if (avatarUrl && !avatarError && avatarUrl.startsWith('http')) {
      return (
        <Image
          src={avatarUrl}
          alt={session.user.name || session.user.username || "User profile image"}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full border-2 border-pink-500/40 shadow-lg transition-all duration-300 object-cover"
          onError={() => setAvatarError(true)}
          unoptimized
        />
      );
    }

    // Fallback: show user initials or default avatar
    const initials = session.user.name 
      ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : session.user.username 
        ? session.user.username[0].toUpperCase()
        : 'U';

    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-pink-500/40 shadow-lg">
        {initials}
      </div>
    );
  };
  if(loading){
    return (
      <div className="flex items-center justify-center h-full">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }
  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen fixed left-0 top-0 z-30 bg-gradient-to-b from-slate-900/80 via-purple-900/70 to-slate-900/90 backdrop-blur-xl border-r border-white/10 shadow-2xl p-6 flex flex-col transition-all duration-300 ease-in-out`}>
      
      {/* Collapse Toggle Button */}
      <Button
        onClick={toggleCollapse}
        variant="ghost"
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-800 border border-white/20 text-white hover:bg-slate-700 transition-all duration-300 p-0 flex items-center justify-center cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>
      
      {/* User Profile Section */}
      {session ? (
        <>
        <div className={`flex flex-col items-center ${isCollapsed ? 'mb-3 mt-8' : 'mb-5 mt-2'} relative transition-all duration-300`}>
          <div className="relative group">
            {/* Clickable Avatar and Name Container */}
            <Link 
              href={`/${session.user.username}`}
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                isCollapsed 
                  ? 'hover:bg-white/10 rounded-full p-2 hover:opacity-100' 
                  : 'hover:opacity-80'
              }`}
            >
              {/* Avatar */}
              <div className="mb-3">
                {renderAvatar()}
              </div>

              {/* Name and Username - Only show when not collapsed */}
              {!isCollapsed && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-white truncate max-w-[12rem]">
                    {session.user.name}
                  </div>
                  <div className="text-sm text-pink-400 truncate max-w-[12rem]">
                    @{session.user.username}
                  </div>
                </div>
              )}
            </Link>

            {/* Tooltip for collapsed state */}
            {isCollapsed && session?.user && (
              <div className="absolute left-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50 pointer-events-none">
                <div className="font-semibold">{session.user.name}</div>
                <div className="text-pink-400 text-xs">@{session.user.username}</div>
              </div>
            )}
          </div>

          {/* Followers/Subscribers if creator */}
          {creator && session?.user && !isCollapsed && (
            <div className="flex gap-8 mt-4 justify-center items-center opacity-100 transition-opacity duration-300">
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-lg">{creator.followers.length ?? 0}</span>
                <span className="text-xs text-gray-400">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-pink-400 font-bold text-lg">{creator.subscribers.length ?? 0}</span>
                <span className="text-xs text-gray-400">Subscribers</span>
              </div>
            </div>
          )}
        </div>

        <div className={`${isCollapsed ? 'mb-4' : 'mb-8'} transition-all duration-300`}></div>

        <nav className="space-y-2 mb-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <div 
                key={item.id} 
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} py-3 rounded-2xl transition-all duration-300 ${getButtonStyles(isActive)}`}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-3'} transition-all duration-300`} />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium opacity-100 transition-opacity duration-300">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </>
                    )}
                    {isCollapsed && isActive && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </Link>
                
                {/* Hover tooltip for collapsed state */}
                {isCollapsed && hoveredItem === item.id && (
                  <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-100 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
          
          {session?.user && !session.user.creator && (
            <div 
              className="relative"
              onMouseEnter={() => setHoveredItem('apply-creator')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href="/apply-creator">
                <Button
                  variant="ghost"
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} py-3 rounded-2xl transition-all duration-300 ${getButtonStyles(pathname === "/apply-creator")}`}
                >
                  <UserCheck className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-3'} transition-all duration-300`} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium opacity-100 transition-opacity duration-300">Apply Creator</span>
                      {pathname === "/apply-creator" && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                  {isCollapsed && pathname === "/apply-creator" && (
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Button>
              </Link>
              
              {/* Hover tooltip for collapsed state */}
              {isCollapsed && hoveredItem === 'apply-creator' && (
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-100 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50 pointer-events-none">
                  Apply Creator
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Upload Content Button */}
        {session?.user?.creator && (
          <div 
            className="relative"
            onMouseEnter={() => setHoveredItem('upload')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link href="/upload">
              <Button
                variant="default"
                className={`w-full ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-center py-4 px-4'} rounded-2xl transition-all duration-300 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-semibold ${isCollapsed ? 'text-base' : 'text-lg'} shadow-lg flex items-center ${isCollapsed ? 'gap-0' : 'gap-3'} mt-4 mb-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isCollapsed ? 'mr-0' : ''} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                </svg>
                {!isCollapsed && <span className="opacity-100 transition-opacity duration-300">Upload Content</span>}
              </Button>
            </Link>

            {/* Upload hover tooltip for collapsed state */}
            {isCollapsed && hoveredItem === 'upload' && (
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-100 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50 pointer-events-none">
                Upload Content
              </div>
            )}
          </div>
        )}

        {/* Stats section */}
        {!isCollapsed && (
          <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 opacity-100 transition-opacity duration-300">
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
        )}

        {/* Sign Out Button */}
        <div
          className={`border-t border-gray-700 pt-4 ${isCollapsed ? 'mt-auto' : ''} relative`}
          onMouseEnter={() => setHoveredItem('signout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Button
            onClick={handleSignOut}
            className={`flex items-center gap-2 w-full ${
              isCollapsed ? 'justify-center px-2 py-2' : 'justify-start px-4 py-3'
            } rounded-full text-white hover:bg-red-500/40 transition duration-200`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-1">Sign Out</span>}
          </Button>

          {/* Tooltip when collapsed */}
          {isCollapsed && hoveredItem === 'signout' && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-md shadow-md z-50 pointer-events-none whitespace-nowrap">
              Sign Out
            </div>
          )}
        </div>
        </>
      ) : (
        <>
        {/* Home link for non-authenticated users */}
        <Link href="/home">
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} py-3 rounded-2xl transition-all duration-300 ${getButtonStyles(pathname === "/home")}`}
          >
            <Home className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-3'} transition-all duration-300`} />
            {!isCollapsed && (
              <>
                <span className="font-medium opacity-100 transition-opacity duration-300">Home</span>
                {pathname === "/home" && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </>
            )}
            {isCollapsed && pathname === "/home" && (
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </Button>
        </Link>
        </>
      )}
    </aside>
  );
};