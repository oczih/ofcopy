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
  Wallet
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname} from "next/navigation";
import Image from "next/image";
import { Creator, User } from "../app/types";
import { Skeleton } from "@/components/ui/skeleton"
import { Session } from "next-auth";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  session: Session | null
  creators: Creator[]
  users: User[]
}

export const Sidebar = ({ onCollapseChange, session, creators }: SidebarProps) => {
  const pathname = usePathname();
  const status = session ? "authenticated" : "unauthenticated";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const user = session?.user as User | undefined;
  const isCreator = !!user?.creator; 
  const baseMenu = [
    { id: "feed", label: "Home Feed", icon: Home, color: "pink", href: "/home" },
    { id: "discover", label: "Discover", icon: Compass, color: "purple", href: "/discover" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "red", href: "/notifications" },
    { id: "messages", label: "Messages (Coming Soon!)", icon: MessageCircle, color: "blue", href: "/messages" },
    { id: "settings", label: "Settings", icon: Settings, color: "green", href: "/settings" },
    { id: "wallet", label: "Wallet", icon: Wallet, color: "orange", href: "/wallet" },
  ];

  // Menu for non-creators only
  const userOnlyMenu = [
    { id: "following", label: "Following", icon: UserCheck, color: "blue", href: "/following" },
    { id: "promotions", label: "Promotions", icon: Megaphone, color: "pink", href: "/promotions" },
    { id: "profile", label: "Profile", icon: UserCircle, color: "cyan", href: `/${user?.username}` },
  ];

  // Menu for creators only
  const creatorOnlyMenu = [
    { id: "insights", label: "Insights", icon: BarChart3, color: "indigo", href: "/insights" },
    { id: "earnings", label: "Earnings", icon: DollarSign, color: "emerald", href: "/earnings" },
  ];

  const menuItems = isCreator
    ? [...baseMenu, ...creatorOnlyMenu]
    : [...baseMenu, ...userOnlyMenu]; 

  const [creator, setCreator] = useState<Creator | null>(null);

  useEffect(() => {
    const fetchCreator = async () => {
      if (session?.user?._id) {
        try {
          if (creators) {
            const found = creators.find((c: Creator) => c.user === session.user._id);
            setCreator(found || null);
          }
          
        } catch (error) {
          setCreator(null);
          throw error
        }
      }
    };
    fetchCreator();
  }, [session?.user?._id, creators]);
  useEffect(() => {
    if (status === 'authenticated') {
      setLoadingSession(false);
    }
  }, [status]);
  const avatarKey = session?.user?.avatarKey;
  const lastFetchedAvatarKey = useRef<string | null>(null);
  useEffect(() => {
    if (!avatarKey) {
      setAvatarUrl(null);
      setLoadingAvatar(false); // ✅ Prevent skeleton forever
      return;
    }
    if (avatarKey === lastFetchedAvatarKey.current) {
      // Already fetched this key, no need to fetch again
      setLoadingAvatar(false);
      return;
    }
    const fetchAvatarUrl = async () => {
  
      try {
        setAvatarError(false);
        const key = avatarKey.replace(/^\/+/, '');
        const res = await fetch("/api/media/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: key }),
        });
  
        const data = await res.json();
        console.log("Avatar API response:", data);
  
        if (data.downloadUrl?.startsWith('http')) {
          setAvatarUrl(data.downloadUrl);
        } else {
          console.error('Invalid avatar URL:', data.downloadUrl);
          setAvatarError(true);
        }
      } catch (err) {
        console.error('Error fetching avatar:', err);
        setAvatarError(true);
      } finally {
        setLoadingAvatar(false);
      }
    };
  
    fetchAvatarUrl();
  }, [avatarKey]);

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
    if (loadingSession || loadingAvatar) {
      return <Skeleton className="w-12 h-12 rounded-full" />;
    }
  
    if (avatarUrl && !avatarError) {
      return (
        <Image
          src={avatarUrl}
          alt={session?.user.name || session?.user.username || "User profile image"}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full border-2 border-pink-500/40 shadow-lg"
          onError={() => setAvatarError(true)}
          unoptimized
        />
      );
    }
  
    // fallback to first letter of name if no avatar
    return (
      <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl border-2 border-pink-500/40 shadow-lg">
        {session?.user?.name?.charAt(0).toUpperCase() || "U"}
      </div>
    );
  };
  
  
  return (
    <aside
  className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen fixed left-0 top-0 z-30
    bg-gradient-to-b from-slate-900/80 via-purple-900/70 to-slate-900/90
    backdrop-blur-xl border-r border-white/10 shadow-2xl p-4
    flex flex-col justify-between transition-all duration-300 ease-in-out overflow-hidden`}
>
      
      {/* Collapse Toggle Button */}
      <Button
        onClick={toggleCollapse}
        variant="ghost"
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-800 border border-white/20 text-white hover:bg-slate-700 transition-all duration-300 p-0 flex items-center justify-center cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>
      
      {/* User Profile Section */}
      {session ? (
        <>
        <div
  className={`flex flex-col items-center relative transition-all duration-300 ${
    isCollapsed ? 'mt-6' : 'mt-1'
  } ${isCreator && creator && !isCollapsed ? 'mb-3' : 'mb-1'}`}
>
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
                    {user?.name}
                  </div>
                  <div className="text-sm text-pink-400 truncate max-w-[12rem]">
                    @{user?.username}
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
          {isCreator && creator && session?.user && !isCollapsed && (
  <div className="flex gap-8 mt-4 justify-center items-center">
    <div className="flex flex-col items-center">
      <span className="text-white font-bold text-lg">{creator?.followers?.length ?? 0}</span>
      <span className="text-xs text-gray-400">Followers</span>
    </div>
    <div className="flex flex-col items-center">
      <span className="text-pink-400 font-bold text-lg">{creator?.subscribers?.length ?? 0}</span>
      <span className="text-xs text-gray-400">Subscribers</span>
    </div>
  </div>
)}
        </div>


        <nav className="space-y-1 mb-40"> 
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

          
          {/* Lisää myöhemmin tämä testaa eka influenssereilla
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
              
              
              {isCollapsed && hoveredItem === 'apply-creator' && (
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-100 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50 pointer-events-none">
                  Apply Creator
                </div>
              )}
            </div>
          )}
          */}
        </nav>

        {/* Upload Content Button */}
        {session?.user?.creator && (
          <div 
            className="relative mt-2 mb-1"
            onMouseEnter={() => setHoveredItem('upload')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link href="/upload">
                    <button
          className={`w-full cursor-pointer
            ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-center py-4 px-4'}
            rounded-2xl
            transition-[outline-color,outline-width,outline-offset,background-color] duration-1000
            hover:outline hover:outline-white
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

            {/* Upload hover tooltip for collapsed state */}
            {isCollapsed && hoveredItem === 'upload' && (
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-100 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50 pointer-events-none">
                Upload Content
              </div>
            )}
          </div>
        )}
        {/* Sign Out Button */}
        <div
  className={`border-t border-gray-700 pt-3 ${isCollapsed ? 'mt-auto' : ''} relative `}
  onMouseEnter={() => setHoveredItem('signout')}
  onMouseLeave={() => setHoveredItem(null)}
>
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-2 w-full cursor-pointer ${
              isCollapsed ? 'justify-center px-2 py-2' : 'justify-start px-4 py-3'
            } rounded-full text-white hover:bg-red-500/40 transition duration-200`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-1">Sign Out</span>}
          </button>

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