'use client';

import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Crown, 
  Calendar, 
  Heart, 
  MoreVertical,
  Play,
  MessageCircle
} from "lucide-react";
import { SessionProvider } from "next-auth/react";
import { Subscription } from "../types";

export default function SubscriptionsPage() {
  return (
    <SessionProvider>
      <Subscriptions />
    </SessionProvider>
  );
}

function Subscriptions() {
  const [activeTab, setActiveTab] = useState("active");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock subscription data for demonstration
  const mockSubscriptions: Subscription[] = [
    {
      creatorId: "1",
      creatorName: "Emma Rose",
      creatorUsername: "@emmarose",
      creatorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      subscriptionDate: new Date("2024-01-15"),
      price: 19.99,
      status: "active",
      nextBillingDate: new Date("2024-02-15"),
      autoRenew: true
    },
    {
      creatorId: "2",
      creatorName: "Alex Turner",
      creatorUsername: "@alexturner",
      creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      subscriptionDate: new Date("2024-01-10"),
      price: 14.99,
      status: "active",
      nextBillingDate: new Date("2024-02-10"),
      autoRenew: false
    },
    {
      creatorId: "3",
      creatorName: "Sophia Chen",
      creatorUsername: "@sophiachen",
      creatorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      subscriptionDate: new Date("2023-12-20"),
      price: 24.99,
      status: "cancelled",
      nextBillingDate: new Date("2024-01-20"),
      autoRenew: false
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 1000);
  }, []);

  const subscriptionTabs = [
    { id: "active", label: "Active", icon: Heart, count: subscriptions.filter(s => s.status === 'active').length },
    { id: "cancelled", label: "Cancelled", icon: Crown, count: subscriptions.filter(s => s.status === 'cancelled').length },
    { id: "expired", label: "Expired", icon: Calendar, count: subscriptions.filter(s => s.status === 'expired').length },
  ];

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === "active") return sub.status === "active";
    if (activeTab === "cancelled") return sub.status === "cancelled";
    if (activeTab === "expired") return sub.status === "expired";
    return true;
  });

  const totalSpent = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header />
      
      <div className="flex max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        <Sidebar />
        
        <main className="flex-1">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex h-[600px]">
              {/* Subscriptions Sidebar */}
              <div className="w-80 border-r border-white/10 bg-white/5">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Subscriptions</h2>
                      <p className="text-gray-400 text-sm">Manage your creator subscriptions</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {subscriptionTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        className={`w-full justify-start py-3 px-4 rounded-2xl transition-all duration-300 mb-2 ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{tab.label}</span>
                        <Badge className="ml-auto bg-white/20 text-white text-xs">
                          {tab.count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>

                {/* Stats Section */}
                <div className="p-4 border-t border-white/10">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="text-white font-semibold mb-3 text-sm">Subscription Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Active Subscriptions</span>
                        <span className="text-pink-400 font-medium">
                          {subscriptions.filter(s => s.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Monthly Total</span>
                        <span className="text-purple-400 font-medium">
                          ${totalSpent.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Auto-Renew</span>
                        <span className="text-green-400 font-medium">
                          {subscriptions.filter(s => s.autoRenew).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscriptions Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Subscriptions
                    </h3>
                    <p className="text-gray-400">
                      {activeTab === 'active' && 'Manage your active creator subscriptions'}
                      {activeTab === 'cancelled' && 'View your cancelled subscriptions'}
                      {activeTab === 'expired' && 'View your expired subscriptions'}
                    </p>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                    </div>
                  ) : filteredSubscriptions.length === 0 ? (
                    <div className="text-center py-12">
                      <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-white font-semibold mb-2">No {activeTab} subscriptions</h4>
                      <p className="text-gray-400 mb-4">
                        {activeTab === 'active' && "You haven't subscribed to any creators yet"}
                        {activeTab === 'cancelled' && "No cancelled subscriptions found"}
                        {activeTab === 'expired' && "No expired subscriptions found"}
                      </p>
                      {activeTab === 'active' && (
                        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                          Discover Creators
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSubscriptions.map((subscription) => (
                        <div 
                          key={subscription.creatorId}
                          className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img 
                                  src={subscription.creatorImage} 
                                  alt={subscription.creatorName}
                                  className="w-16 h-16 rounded-full border-2 border-pink-500/50"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold text-lg">{subscription.creatorName}</h4>
                                <p className="text-gray-400 text-sm">{subscription.creatorUsername}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`${
                                      subscription.status === 'active' 
                                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                        : subscription.status === 'cancelled'
                                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                    }`}
                                  >
                                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                  </Badge>
                                  <span className="text-gray-400 text-sm">
                                    ${subscription.price}/month
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-gray-400 text-sm">Next billing</p>
                                <p className="text-white text-sm font-medium">
                                  {subscription.nextBillingDate?.toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {subscription.status === 'active' && (
                                  <>
                                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                      <Play className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {subscription.status === 'active' && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="checkbox" 
                                      checked={subscription.autoRenew}
                                      className="rounded border-white/20 bg-white/10"
                                    />
                                    <span className="text-gray-300 text-sm">Auto-renew</span>
                                  </div>
                                  <span className="text-gray-400 text-sm">
                                    Subscribed since {subscription.subscriptionDate.toLocaleDateString()}
                                  </span>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  Cancel Subscription
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
