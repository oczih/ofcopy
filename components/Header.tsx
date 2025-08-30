'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Bell, 
  MessageCircle,
  Settings, 
  LogOut,
  Crown,
  Sparkles,
  User as UserIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from "next/link";
export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    toast.success('Signed out successfully');
  };
  return (
    <>
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Fanslio
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Premium Content Platform</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-12">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-pink-400 transition-colors duration-300" />
                <Input
                  placeholder="Search creators, content, and more..."
                  className="pl-12 pr-4 py-3 bg-white/10 border-white/20 rounded-full text-white placeholder:text-gray-400 focus:border-pink-500/50 focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              {session?.user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10 hover:text-pink-400 rounded-full w-12 h-12 transition-all duration-300 hover:scale-110 relative"
                  >
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </Button>
                  <Link 
                    href={"/messages"}
                    className="text-white hover:bg-white/10 hover:text-blue-400 rounded-full w-12 h-12 transition-all duration-300 hover:scale-110 relative"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full p-0 hover:scale-110 transition-all duration-300">
                        <div className="relative">
                          <Avatar className="w-10 h-10 border-2 border-pink-500/50 hover:border-pink-500 transition-all duration-300">
                            <AvatarImage src={`${session.user?.image}`} />
                            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">JD</AvatarFallback>
                          </Avatar>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl rounded-2xl p-2" align="end">
                      <div className="px-3 py-2 border-b border-slate-700/50 mb-2">
                        <p className="text-white font-semibold">{session.user?.name}</p>
                        <p className="text-gray-400 text-sm">{session.user?.username}</p>
                      </div>
                      <DropdownMenuItem className="text-white hover:bg-slate-700/50 rounded-lg px-3 py-2 cursor-pointer">
                        <UserIcon className="mr-3 h-4 w-4 text-pink-400" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-slate-700/50 rounded-lg px-3 py-2 cursor-pointer">
                        <Link href="/settings"><Settings className="mr-3 h-4 w-4 text-gray-400" />
                        Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700/50 my-2" />
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-red-900/20 rounded-lg px-3 py-2 cursor-pointer"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10 rounded-full px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
                    onClick={() => router.push("/login")}
                  >
                    Log In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => router.push("/signup")}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

    </>
  );
};
