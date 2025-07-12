import { Button } from "./ui/button";
import { 
  Home, 
  Compass, 
  MessageCircle, 
  Heart, 
  Settings,
  Crown,
  Sparkles,
  TrendingUp
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: "feed", label: "Home Feed", icon: Home, color: "pink" },
    { id: "discover", label: "Discover", icon: Compass, color: "purple" },
    { id: "messages", label: "Messages", icon: MessageCircle, color: "blue" },
    { id: "favorites", label: "Favorites", icon: Heart, color: "red" },
    { id: "subscriptions", label: "Subscriptions", icon: Crown, color: "yellow" },
    { id: "settings", label: "Settings", icon: Settings, color: "green" },
  ];

  const getButtonStyles = (isActive: boolean, color: string) => {
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
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start py-3 px-4 rounded-2xl transition-all duration-300 ${getButtonStyles(isActive, item.color)}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Button>
          );
        })}
      </nav>

      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-pink-500/20 rounded-2xl border border-yellow-500/30 p-6 group hover:scale-105 transition-all duration-300 cursor-pointer">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <Crown className="w-10 h-10 text-yellow-400" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Go Premium</h3>
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            Unlock exclusive features, premium content, and advanced creator tools
          </p>
          <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* Stats section */}
      <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
        <h4 className="text-white font-semibold mb-3 text-sm">Your Activity</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subscriptions</span>
            <span className="text-pink-400 font-medium">12</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Favorites</span>
            <span className="text-purple-400 font-medium">47</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Messages</span>
            <span className="text-blue-400 font-medium">8</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
