'use client';

import { FC, SVGProps, useEffect, useState } from "react";
import {CreditCard, ChevronRight, Calendar, Mail, Trash2, Wallet, ExternalLink, AlertCircle, UserCog, Shield, Settings, Star, ChevronLeft, SquareUser } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionManagement from "@/components/SubscriptionManagement";
import PaymentHistory from "@/components/PaymentHistory";
import toast from "react-hot-toast";
import { Creator, User } from "../types";
import { Session } from "next-auth";
import WalletPage from "@/app/wallet/WalletPage"
interface AppProps {
    creators: Creator[];
    session: Session | null;
    users: User[];
  }

export default function App({session, creators, users}: AppProps) {
  const [activeTab, setActiveTab] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState<string | null>(null);
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);
  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email ?? "");
    }
  }, [session?.user]);
  useEffect(() => {
    if (!token) return;

    const confirmAction = async () => {
      try {
        const res = await fetch('/api/auth/confirm-password-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        
        if (res.ok) {
          const actionType = data.isAddingPassword ? 'Password setup' : 'Password reset';
          toast.success(`${actionType} confirmed! You can now log in with your ${data.isAddingPassword ? 'new' : 'updated'} password.`);
        } else {
          toast.error(data.error || 'Confirmation failed');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (error) {
        console.error(error)
        toast.error('Something went wrong');
      }
    };

    confirmAction();
  }, [token, router]);
  
  interface MainTab {
    id: string;
    label: string;
    href?: string;
    icon: FC<SVGProps<SVGSVGElement>>;
    description: string;
    color: string;
    restrictedTo?: "creator" | "noncreator"; // optional
  }
  
  const mainTabs: MainTab[] = [
    { 
      id: "creator", 
      label: "Become a Creator", 
      href: "/apply-creator",
      icon: Star,
      description: "Apply to become a content creator and start earning",
      color: "from-purple-500 to-pink-500",
      restrictedTo: "noncreator" // only non-creators
    },
    { 
      id: "account", 
      label: "Account",
      icon: UserCog,
      description: "Manage your personal information and settings",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      id: "payments", 
      label: "Payment & Subscriptions",
      icon: CreditCard,
      description: "Handle subscriptions, payments, and billing",
      color: "from-green-500 to-emerald-500",
      restrictedTo: "creator" // only creators
    },
    { 
      id: "legal", 
      label: "Privacy & Terms",
      icon: Shield,
      description: "View privacy policy and terms of service",
      color: "from-orange-500 to-red-500"
    },
    { 
      id: "payout", 
      label: "Request A Payout", 
      href: "/settings/payouts/request",
      icon: Wallet,
      description: "Request a payout with your preferred method",
      color: "from-emerald-500 to-teal-500",
      restrictedTo: "creator" // only creators
    },
    {
      id: "creator-settings",
      label: "Creator Settings",
      href: "/settings/creator",
      icon: SquareUser,
      description: "Manage your creator tools and settings",
      color: "from-emerald-500 to-teal-500",
      restrictedTo: "creator",
    }
  ];
  
  // Filter tabs based on session.user.creator
  const getVisibleTabs = (isCreator: boolean) => {
    return mainTabs.filter(tab => {
      if (!tab.restrictedTo) return true; // visible to all
      return (isCreator && tab.restrictedTo === "creator") || (!isCreator && tab.restrictedTo === "noncreator");
    });
  };
  
  // Example usage
  
  
  type SubTab = {
    id: string;
    label: string;
    href?: string;
  };
  const accountSubTabs: SubTab[] = [
    { id: "info", label: "Account Info" },
    { id: "password", label: "Password" },
    { id: "delete", label: "Delete Account" },
  ];

  const paymentSubTabs: SubTab[]  = [
    { id: "subscriptions", label: "Subscriptions" },
    { id: "history", label: "Payment History" },
    { id: "wallet", label: "Wallet" },
  ];
  const subTabsMap = {
    account: [
      { id: "info", label: "Personal Info" },
      { id: "security", label: "Security" },
    ],
    payments: [
      { id: "subscriptions", label: "Subscriptions" },
      { id: "payouts", label: "Payouts" },
    ],
    legal: [
      { id: "privacy", label: "Privacy" },
      { id: "terms", label: "Terms" },
    ],
    "creator-settings": [
      { id: "tracking-links", label: "Tracking Links" },
      { id: "subscription", label: "Subscription" },
      { id: "profile", label: "Profile" },
      { id: "my-ai", label: "My AI" },
      { id: "commenting", label: "Commenting" },
      { id: "automated-messages", label: "Automated Messages" },
      { id: "tutorials", label: "Tutorials" },
      { id: "api-keys", label: "Request API Keys" },
    ],
  };
  
  const legalSubTabs = [
    { id: "privacy", label: "Privacy Policy", href: "/privacy" },
    { id: "terms", label: "Terms of Service", href: "/tos" },
    { id: "childprotection", label: "Child Protection", href: "/child-protection"},
    { id: "anti-slavery", label: "Anti-Slavery", href: "/anti-slavery" },
    { id: "dmca", label: "DMCA", href: "/dmca" },
    {id: "cookie", label: "Cookie Policy", href: "/cookiepolicy"},
    {id: "guideline", label: "Community Guidelines", href: "/guidelines"}

  ];

  const handleTabClick = (tabId: string) => {
    const tab = mainTabs.find(t => t.id === tabId);
    if (tab?.href) {
      router.push(tab.href);
      return;
    }
    setActiveTab(tabId);
    // Set default subtab when switching main tabs
    if (tabId === "account") setActiveSubTab("info");
else if (tabId === "payments") setActiveSubTab("subscriptions");
else if (tabId === "legal") setActiveSubTab("privacy");
else if (tabId === "creator-settings") setActiveSubTab(""); // support for Creator Settings breadcrumb
else setActiveSubTab("");
  };

  const handleSubTabClick = (subTabId: string) => {
    const currentSubTabs = activeTab === "account" ? accountSubTabs : 
                          activeTab === "payments" ? paymentSubTabs : legalSubTabs;
    const subTab = currentSubTabs.find(t => t.id === subTabId);
    if (subTab?.href) {
      window.open(subTab.href, '_blank');
      return;
    }
    setActiveSubTab(subTabId);
  };
  const CreatorTrackingLinks = () => <div className="text-gray-300">Tracking Links Page</div>;
const CreatorSubscription = () => <div className="text-gray-300">Subscription Settings</div>;
const CreatorProfile = () => <div className="text-gray-300">Profile Settings</div>;
const CreatorMyAI = () => <div className="text-gray-300">My AI Settings</div>;
const CreatorCommenting = () => <div className="text-gray-300">Comment Control Settings</div>;
const CreatorAutomatedMessages = () => <div className="text-gray-300">Automated Messages Settings</div>;
const CreatorTutorials = () => <div className="text-gray-300">Tutorials & Tips</div>;
const CreatorAPIKeys = () => <div className="text-gray-300">API Key Request</div>;

  if (activeTab === "creator-settings") {
    switch (activeSubTab) {
      case "tracking-links":
        return <CreatorTrackingLinks />;
      case "subscription":
        return <CreatorSubscription />;
      case "profile":
        return <CreatorProfile />;
      case "my-ai":
        return <CreatorMyAI />;
      case "commenting":
        return <CreatorCommenting />;
      case "automated-messages":
        return <CreatorAutomatedMessages />;
      case "tutorials":
        return <CreatorTutorials />;
      case "api-keys":
        return <CreatorAPIKeys />;
      default:
        return (
          <div className="text-gray-400">
            <h3 className="text-2xl font-bold text-white mb-2">Creator Settings</h3>
            <p>See information about your subscriptions, edit profile preferences or set automated messages.</p>
          </div>
        );
    }
  }
  const renderBreadcrumb = () => {
    const mainTab = mainTabs.find((tab) => tab.id === activeTab);
    type SubTabsMap = typeof subTabsMap;

    const subTab = (subTabsMap as SubTabsMap)[activeTab as keyof SubTabsMap]?.find(
      (sub) => sub.id === activeSubTab
    )
  
    return (
      <div className="text-sm text-gray-400 mb-4">
        <span className="cursor-pointer hover:text-white" onClick={() => setActiveTab("")}>
          Settings
        </span>
        {mainTab && (
          <>
            {" • "}
            <span
              className="cursor-pointer hover:text-white"
              onClick={() => setActiveSubTab("")}
            >
              {mainTab.label}
            </span>
          </>
        )}
        {subTab && <> • <span className="text-white font-medium">{subTab.label}</span></>}
      </div>
    );
  };
  

const validate = () => {
  const errs: Record<string, string> = {};
  
  // For users with existing passwords, require current password
  if ((session?.user as User).password && (!form.currentPassword || form.currentPassword.trim() === '')) {
    errs.currentPassword = 'Current password is required';
  }
  
  // Validate new password
  if (!form.password || form.password.length < 8) {
    errs.password = "Password must be at least 8 characters";
  }
  
  // Validate password confirmation
  if (!form.confirm) {
    errs.confirm = 'Please confirm your password';
  } else if (form.confirm !== form.password) {
    errs.confirm = "Passwords do not match";
  }
  
  setErrors(errs);
  return Object.keys(errs).length === 0;
};

  const handlePasswordAction = async () => {


    if (!validate()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: form.password }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Action failed");
      } else {
        const actionType = data.isAddingPassword ? "Password setup" : "Password reset";
        toast.success(`Verification email sent! Please check your email to confirm your ${actionType.toLowerCase()}.`);
        // Don't redirect yet - wait for email confirmation
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const visibleTabs = getVisibleTabs(session?.user.creator ?? false);
  const renderMainTabContent = () => {
    if (!activeTab) {
      return (
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Settings
            </h2>
            <p className="text-xl text-gray-400 max-w-md mx-auto">
              Customize your account and manage your preferences
            </p>
          </div>
          
          {/* Main Tabs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {visibleTabs.map((tab, index) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="group relative overflow-hidden cursor-pointer bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-left hover:bg-white/10 transition-all duration-500 -105 hover:shadow-2xl cursor-pointer"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Gradient Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${tab.color} shadow-lg group--110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-emerald-400 group-hover:bg-clip-text transition-all duration-300">
                      {tab.label}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {tab.description}
                    </p>
                  </div>
                  
                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300"></div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeTab === "account") {
      return (
        <div className="space-y-8">
          {/* Sub Navigation */}
          <div className="flex gap-2 overflow-x-auto md:overflow-x-visible mb-8 bg-white/5 rounded-2xl p-1 md:p-2 border border-white/10 scrollbar-hide">
  {accountSubTabs.map((subTab) => (
    <button
      key={subTab.id}
      onClick={() => handleSubTabClick(subTab.id)}
      className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-xl cursor-pointer transition-all duration-300 font-medium text-xs sm:text-sm whitespace-nowrap
        ${
          activeSubTab === subTab.id
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105"
            : "text-gray-400 hover:text-white hover:bg-white/10"
        }`}
    >
      {subTab.label}
    </button>
  ))}
</div>

          {activeSubTab === "info" && (
  <div className="space-y-6 md:space-y-8 px-4 md:px-0">
    {/* Header */}
    <div className="text-center">
      <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 md:mb-3">
        Account Information
      </h3>
      <p className="text-gray-400 text-sm md:text-lg">
        View and update your account details
      </p>
    </div>

    {/* Info Cards */}
    <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/20 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Email Card */}
        <div className="group p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
  <div className="flex items-center space-x-3 md:space-x-4">
    <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg flex-shrink-0">
      <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">
        Email Address
      </p>
      <p className="text-white font-semibold text-sm md:text-lg break-words truncate">
        {session?.user.email}
      </p>
    </div>
  </div>
</div>

        {/* Member Since Card */}
        <div className="group p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
  <div className="flex items-center space-x-3 md:space-x-4">
    <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg flex-shrink-0">
      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">
        Member Since
      </p>
      <p className="text-white font-semibold text-sm md:text-lg truncate">
        {new Date(session?.user?.createdAt ?? '').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  </div>
</div>
      </div>
    </div>
  </div>
)}


{activeSubTab === "password" && !(session?.user as User).password && (
  <div className="space-y-8">
    <div className="text-center">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
        Add Password
      </h3>
      <p className="text-gray-400 text-lg">Set up a password to secure your account and enable email login</p>
    </div>

    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-xl">
        <div className="space-y-6">
          {/* New Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mb-3">Create Password</label>
            <div className="relative group">
              <input
                type="password"
                placeholder="Enter your new password"
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl shadow-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-pulse">
                <AlertCircle className="w-4 h-4" /> 
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mb-3">Confirm Password</label>
            <div className="relative group">
              <input
                type="password"
                placeholder="Confirm your password" 
                value={form.confirm || ''}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl shadow-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.confirm && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-pulse">
                <AlertCircle className="w-4 h-4" /> 
                <span>{errors.confirm}</span>
              </div>
            )}
          </div>

          {/* Add Password Button */}
          <button
            onClick={handlePasswordAction}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 cursor-pointer hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Setting up password...
              </div>
            ) : "Add Password"}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <div className="w-3 h-3 rounded-full bg-blue-200 animate-pulse"></div>
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-3 text-blue-200 text-lg">Setting up a password allows you to:</p>
            <ul className="space-y-2 text-blue-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Sign in with your email and password
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Access your account if OAuth is unavailable
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Have an additional layer of security
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeSubTab === "password" && (session?.user as User).password && (
  <div className="space-y-8">
    <div className="text-center">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
        Change Password
      </h3>
      <p className="text-gray-400 text-lg">Update your password to keep your account secure</p>
    </div>

    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-xl">
        <div className="space-y-6">
          {/* Current Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mb-3">Current Password</label>
            <div className="relative group">
              <input
                type="password"
                placeholder="Enter your current password"
                value={form.currentPassword || ''}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl shadow-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.currentPassword && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-pulse">
                <AlertCircle className="w-4 h-4" /> 
                <span>{errors.currentPassword}</span>
              </div>
            )}
          </div>

          {/* New Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mb-3">New Password</label>
            <div className="relative group">
              <input
                type="password"
                placeholder="Enter your new password"
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl shadow-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.password && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-pulse">
                <AlertCircle className="w-4 h-4" /> 
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Confirm New Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mb-3">Confirm New Password</label>
            <div className="relative group">
              <input
                type="password"
                placeholder="Confirm your new password"
                value={form.confirm || ''}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl shadow-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.confirm && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-pulse">
                <AlertCircle className="w-4 h-4" /> 
                <span>{errors.confirm}</span>
              </div>
            )}
          </div>

          {/* Change Password Button */}
          <button
            onClick={handlePasswordAction}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 cursor-pointer hover:to-cyan-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Changing password...
              </div>
            ) : "Change Password"}
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="mt-8 bg-gradient-to-br from-yellow-900/30 to-orange-800/20 border border-yellow-500/30 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-3 text-yellow-200 text-lg">Password Security Tips:</p>
            <ul className="space-y-2 text-yellow-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                Use at least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                Include uppercase and lowercase letters
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                Add numbers and special characters
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                Don&apos;t reuse passwords from other accounts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

          {activeSubTab === "delete" && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-red-400 mb-3">Delete Account</h3>
                <p className="text-gray-400 text-lg">Permanently delete your account and all associated data</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <div className="flex items-start space-x-6">
                    <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                      <Trash2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-red-400 font-bold text-xl mb-3">Danger Zone</h4>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <div className="bg-red-950/50 rounded-2xl p-4 mb-6 border border-red-500/20">
                        <ul className="text-gray-300 space-y-3">
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            All your personal data will be permanently deleted
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            Your subscriptions will be cancelled
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            Your creator content (if any) will be removed
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            This action cannot be undone
                          </li>
                        </ul>
                      </div>
                      <button 
                        className="bg-gradient-to-r from-red-600 to-red-700 cursor-pointer hover:from-red-700 hover:to-red-800 border-0 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 -105 hover:shadow-xl"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "payments") {
      return (
        <div className="space-y-8">
          {/* Sub Navigation */}
          <div className="flex items-center space-x-2 mb-8 bg-white/5 rounded-2xl p-2 border border-white/10">
            {paymentSubTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => handleSubTabClick(subTab.id)}
                className={`flex-1 px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm cursor-pointer ${
                  activeSubTab === subTab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {subTab.label}
              </button>
            ))}
          </div>

          {activeSubTab === "subscriptions" && (
            <SubscriptionManagement session={session} creators={creators}/>
          )}

          {activeSubTab === "history" && (
            <PaymentHistory session={session} /> 
          )}

          {activeSubTab === "wallet" && (
            <WalletPage session={session} creators={creators} users={users}/>
          )}
        </div>
      );
    }

    if (activeTab === "legal") {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              Privacy & Terms
            </h3>
            <p className="text-gray-400 text-lg">Review our policies and terms of service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {legalSubTabs.map((subTab, index) => (
              <button
                key={subTab.id}
                onClick={() => handleSubTabClick(subTab.id)}
                className="group relative overflow-hidden bg-gradient-to-br cursor-pointer from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 cursor-pointer text-left hover:bg-white/15 transition-all duration-500 -105 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg group--110 transition-transform duration-300">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <ExternalLink className="w-6 h-6 text-gray-400 group-hover:text-white group--110 transition-all duration-300" />
                  </div>
                  
                  <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 group-hover:bg-clip-text transition-all duration-300">
                    {subTab.label}
                  </h4>
                </div>
                
                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-orange-500/30 transition-colors duration-300"></div>
              </button>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background */}
      

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 relative z-10">
      <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-white md:hidden"
        >
          <ChevronLeft className="w-6 h-6"/>
        </button>
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl p-10 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none"></div>
          
          <div className="relative z-10">
            {renderBreadcrumb()}
            {renderMainTabContent()}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}