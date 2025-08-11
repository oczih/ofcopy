'use client';

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {CreditCard, ChevronRight, Calendar, Mail, Trash2, Wallet, ExternalLink, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionManagement from "@/components/SubscriptionManagement";
import PaymentHistory from "@/components/PaymentHistory";
import toast from "react-hot-toast";
import { Creator, User } from "../types";
import { Session } from "next-auth";

interface AppProps {
    creators: Creator[];
    session: Session | null;
    users: User[];
  }

export default function App({session}: AppProps) {
  console.log("sessioni:", session?.user)
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
    if (status === 'unauthenticated') {
      router.push("/login");
    }
  }, [router]);
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
  if (status === "loading") return null;
  

  const mainTabs = [
    { id: "creator", label: "Become a Creator", href: "/apply-creator" },
    { id: "account", label: "Account" },
    { id: "payments", label: "Payment & Subscriptions" },
    { id: "legal", label: "Privacy & Terms" },
  ];
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

  const legalSubTabs = [
    { id: "privacy", label: "Privacy Policy", href: "/privacy" },
    { id: "terms", label: "Terms of Service", href: "/tos" },
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
// Update your validate function to handle both scenarios:
const validate = () => {
  const errs: Record<string, string> = {};
  
  // For users with existing passwords, require current password
  if (session?.user.password && (!form.currentPassword || form.currentPassword.trim() === '')) {
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
    console.log("validate:", validate)

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
  const renderMainTabContent = () => {
    if (!activeTab) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Settings</h2>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="bg-white/5 backdrop-blur-xl cursor-pointer rounded-2xl hover:outline hover:outline-white p-6 text-left hover:bg-white/10 transition-all duration-300 group cursor-pointer"
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
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer duration-300 ${
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
                      <p className="text-white font-medium">{session?.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-medium">{new Date(session?.user?.createdAt ?? '').toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

{activeSubTab === "password" && !session?.user.password && (
  <div className="space-y-6">
    <div>
      <h3 className="text-2xl font-bold text-white mb-2">Add Password</h3>
      <p className="text-gray-400">Set up a password to secure your account and enable email login</p>
    </div>

    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="space-y-4 max-w-md">
        {/* New Password Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Create Password</label>
          <input
            type="password"
            placeholder="Enter your new password"
            value={form.password || ''}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password" 
            value={form.confirm || ''}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.confirm && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.confirm}
            </p>
          )}
        </div>

        {/* Add Password Button */}
        <button
          onClick={handlePasswordAction}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Setting up password..." : "Add Password"}
        </button>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            </div>
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Setting up a password allows you to:</p>
              <ul className="space-y-1 text-blue-300">
                <li>• Sign in with your email and password</li>
                <li>• Access your account if OAuth is unavailable</li>
                <li>• Have an additional layer of security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeSubTab === "password" && session?.user.password && (
  <div className="space-y-6">
    <div>
      <h3 className="text-2xl font-bold text-white mb-2">Change Password</h3>
      <p className="text-gray-400">Update your password to keep your account secure</p>
    </div>

    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="space-y-4 max-w-md">
        {/* Current Password Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Current Password</label>
          <input
            type="password"
            placeholder="Enter your current password"
            value={form.currentPassword || ''}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.currentPassword}
            </p>
          )}
        </div>

        {/* New Password Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">New Password</label>
          <input
            type="password"
            placeholder="Enter your new password"
            value={form.password || ''}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.password}
            </p>
          )}
        </div>

        {/* Confirm New Password Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm your new password"
            value={form.confirm || ''}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.confirm && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.confirm}
            </p>
          )}
        </div>

        {/* Change Password Button */}
        <button
          onClick={handlePasswordAction}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Changing password..." : "Change Password"}
        </button>

        {/* Security Info */}
        <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Password Security Tips:</p>
              <ul className="space-y-1 text-yellow-300">
                <li>• Use at least 8 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Add numbers and special characters</li>
                <li>• Don&#39;t reuse passwords from other accounts</li>
              </ul>
            </div>
          </div>
        </div>
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
                className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
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
            <SubscriptionManagement session={session}/>
          )}

          {activeSubTab === "history" && (
            <PaymentHistory session={session} /> 
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
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 cursor-pointer text-left hover:bg-white/10 transition-all duration-300 group"
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
    <div>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          {renderBreadcrumb()}
          {renderMainTabContent()}
        </div>
      </main>
    </div>
  );
}