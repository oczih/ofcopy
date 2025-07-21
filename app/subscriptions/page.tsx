'use client';

import { useState, useEffect } from "react";
import { Header } from "../components/Header";
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
import { SessionProvider, useSession } from "next-auth/react";
import { Subscription } from "../types";

export default function SubscriptionsPage() {
  return (
    <SessionProvider>
      <Subscriptions />
    </SessionProvider>
  );
}

function Subscriptions() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("active");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.subscriptions) {
      setSubscriptions(session.user.subscriptions);
      setLoading(false);
    } else {
      setSubscriptions([]);
      setLoading(false);
    }
  }, [session]);

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
      
      <div className="flex max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        {/* Content */}
      </div>
    </div>
  );
}
