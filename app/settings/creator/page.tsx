'use client';

import { FC, SVGProps, useEffect, useState } from "react";
import { ChevronLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Session } from "next-auth";

// Example sub-components for each tab
import TrackingLinks from "@/components/creator/TrackingLinks";
import CreatorSubscription from "@/components/creator/Subscription";
import CreatorProfile from "@/components/creator/Profile";
import MyAI from "@/components/creator/MyAI";
import Commenting from "@/components/creator/Commenting";
import AutomatedMessages from "@/components/creator/AutomatedMessages";
import Tutorials from "@/components/creator/Tutorials";
import RequestAPIKeys from "@/components/creator/RequestAPIKeys";

interface CreatorSettingsPageProps {
  session: Session | null;
}

type SubTab = {
  id: string;
  label: string;
};

const creatorSubTabs: SubTab[] = [
  { id: "tracking", label: "Tracking Links" },
  { id: "subscription", label: "Subscription" },
  { id: "profile", label: "Profile" },
  { id: "my-ai", label: "My AI" },
  { id: "commenting", label: "Commenting" },
  { id: "automated-messages", label: "Automated Messages" },
  { id: "tutorials", label: "Tutorials" },
  { id: "api-keys", label: "Request API Keys" },
];

export default function CreatorSettingsPage({ session }: CreatorSettingsPageProps) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("tracking");

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "tracking":
        return <TrackingLinks session={session} />;
      case "subscription":
        return <CreatorSubscription session={session} />;
      case "profile":
        return <CreatorProfile session={session} />;
      case "my-ai":
        return <MyAI session={session} />;
      case "commenting":
        return <Commenting session={session} />;
      case "automated-messages":
        return <AutomatedMessages session={session} />;
      case "tutorials":
        return <Tutorials session={session} />;
      case "api-keys":
        return <RequestAPIKeys session={session} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-white mb-6"
        >
          <ChevronLeft className="w-6 h-6" />
          Back to Settings
        </button>

        {/* Page Container */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none"></div>
          <div className="relative z-10">

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Creator Settings
              </h2>
              <p className="text-gray-400 text-lg">
                Manage your creator profile, content, and automation tools
              </p>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 overflow-x-auto md:overflow-x-visible mb-8 bg-white/5 rounded-2xl p-1 md:p-2 border border-white/10 scrollbar-hide">
              {creatorSubTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-xl cursor-pointer transition-all duration-300 font-medium text-sm whitespace-nowrap ${
                    activeSubTab === tab.id
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div>{renderSubTabContent()}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
