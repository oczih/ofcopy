'use client';

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Settings, User, Shield, Bell, Palette, CreditCard, LogOut, Save, ChevronRight, Calendar, Mail, Eye, EyeOff, Trash2, Star, Wallet, History, X, ExternalLink } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppWrapper from "../../components/AppWrapper";

export default function SettingsPage() {
  return (
    <SessionProvider>
      <AppWrapper>
        <SettingsApp/>
      </AppWrapper>
    </SessionProvider>
  );
}

function SettingsApp() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("");
  const [name, setName] = useState(session?.user.name || "");
  const [email, setEmail] = useState(session?.user.email || "");
  const [username, setUsername] = useState(session?.user.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  if (status === "loading") return null;
  if (!session?.user) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  const mainTabs = [
    { id: "creator", label: "Become a Creator", href: "/apply" },
    { id: "account", label: "Account" },
    { id: "payments", label: "Payment & Subscriptions" },
    { id: "legal", label: "Privacy & Terms" },
  ];

  const accountSubTabs = [
    { id: "info", label: "Account Info" },
    { id: "password", label: "Password" },
    { id: "delete", label: "Delete Account" },
  ];

  const paymentSubTabs = [
    { id: "subscriptions", label: "Subscriptions" },
    { id: "history", label: "Payment History" },
    { id: "wallet", label: "Wallet" },
  ];

  const legalSubTabs = [
    { id: "privacy", label: "Privacy Policy", href: "/privacy" },
    { id: "terms", label: "Terms of Service", href: "/tos" },
  ];

  const handleTabClick = (tabId) => {
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
    else setActiveSubTab("");
  };

  const handleSubTabClick = (subTabId) => {
    const currentSubTabs = activeTab === "account" ? accountSubTabs : 
                          activeTab === "payments" ? paymentSubTabs : legalSubTabs;
    const subTab = currentSubTabs.find(t => t.id === subTabId);
    if (subTab?.href) {
      window.open(subTab.href, '_blank');
      return;
    }
    setActiveSubTab(subTabId);
  };

  const renderBreadcrumb = () => {
    const currentMainTab = mainTabs.find(t => t.id === activeTab);
    const currentSubTabs = activeTab === "account" ? accountSubTabs : 
                          activeTab === "payments" ? paymentSubTabs : legalSubTabs;
    const currentSubTab = currentSubTabs?.find(t => t.id === activeSubTab);

    return (
      <div className="flex items-center space-x-2 text-sm mb-8">
        <button
          onClick={() => setActiveTab("")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Settings
        </button>
        {currentMainTab && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => handleTabClick(activeTab)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {currentMainTab.label}
            </button>
          </>
        )}
        {currentSubTab && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <span className="text-white font-medium">{currentSubTab.label}</span>
          </>
        )}
      </div>
    );
  };

  const renderMainTabContent = () => {
    if (!activeTab) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Settings</h2>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-left hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                      {tab.label}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {tab.id === "creator" && "Apply to become a content creator"}
                      {tab.id === "account" && "Manage your personal information"}
                      {tab.id === "payments" && "Handle subscriptions and payments"}
                      {tab.id === "legal" && "View privacy policy and terms"}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "account") {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            {accountSubTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => handleSubTabClick(subTab.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeSubTab === subTab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {subTab.label}
              </button>
            ))}
          </div>

          {activeSubTab === "info" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Account Information</h3>
                <p className="text-gray-400">View and update your account details</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Email Address</p>
                      <p className="text-white font-medium">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-medium">January 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 bg-white/10 border-white/20 text-white focus:border-green-500"
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 bg-white/10 border-white/20 text-white focus:border-green-500"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "password" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Change Password</h3>
                <p className="text-gray-400">Update your password to keep your account secure</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="relative">
                  <Label htmlFor="current-password" className="text-white">Current Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white focus:border-green-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="new-password" className="text-white">New Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white focus:border-green-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white focus:border-green-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    Update Password
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "delete" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Delete Account</h3>
                <p className="text-gray-400">Permanently delete your account and all associated data</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-400 font-semibold mb-2">Danger Zone</h4>
                    <p className="text-gray-300 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <ul className="text-gray-400 text-sm space-y-1 mb-6">
                      <li>• All your personal data will be permanently deleted</li>
                      <li>• Your subscriptions will be cancelled</li>
                      <li>• Your creator content (if any) will be removed</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                      Delete My Account
                    </Button>
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
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            {paymentSubTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => handleSubTabClick(subTab.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeSubTab === subTab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {subTab.label}
              </button>
            ))}
          </div>

          {activeSubTab === "subscriptions" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Active Subscriptions</h3>
                <p className="text-gray-400">Manage your current subscriptions</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Star className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Premium Plan</h4>
                        <p className="text-gray-400 text-sm">$9.99/month • Next billing: Feb 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-500 text-white">Active</Badge>
                      <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No other active subscriptions</p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Browse Creators
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "history" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Payment History</h3>
                <p className="text-gray-400">View your past transactions</p>
              </div>

              <div className="space-y-3">
                {[
                  { date: "Jan 15, 2024", amount: "$9.99", description: "Premium Plan - Monthly", status: "Completed" },
                  { date: "Dec 15, 2023", amount: "$9.99", description: "Premium Plan - Monthly", status: "Completed" },
                  { date: "Nov 15, 2023", amount: "$9.99", description: "Premium Plan - Monthly", status: "Completed" },
                ].map((payment, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <History className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-white font-medium">{payment.description}</p>
                          <p className="text-gray-400 text-sm">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{payment.amount}</p>
                        <Badge className="bg-green-500 text-white text-xs">{payment.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "wallet" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Wallet</h3>
                <p className="text-gray-400">Manage your payment methods and balance</p>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-6 h-6 text-green-400" />
                    <h4 className="text-white font-semibold text-lg">Account Balance</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">$25.00</p>
                    <p className="text-green-400 text-sm">Available</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button className="bg-green-500 hover:bg-green-600">
                    Add Funds
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Withdraw
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-semibold">Payment Methods</h4>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-center py-6">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No payment methods added</p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "legal") {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Privacy & Terms</h3>
            <p className="text-gray-400">Review our policies and terms of service</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalSubTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => handleSubTabClick(subTab.id)}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-left hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                      {subTab.label}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {subTab.id === "privacy" && "Learn how we protect your data"}
                      {subTab.id === "terms" && "Review our terms and conditions"}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          {renderBreadcrumb()}
          {renderMainTabContent()}
        </div>
      </main>
    </div>
  );
}