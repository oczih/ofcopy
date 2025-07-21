'use client';

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Settings, User, Shield, Bell, Palette, CreditCard, LogOut, Save } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  return (
    <SessionProvider>
          <SettingsApp />
    </SessionProvider>
  );
}

function SettingsApp() {
  const { data: session, status } = useSession();
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [name, setName] = useState(session?.user.name);
  const [email, setEmail] = useState(session?.user.email);
  const [username, setUsername] = useState(session?.user.username);
  const router = useRouter();
  if (status === "loading") return null;
  if (!session?.user) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }
  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex h-[600px]">
              {/* Settings Sidebar */}
              <div className="w-80 border-r border-white/10 bg-white/5">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Settings</h2>
                      <p className="text-gray-400 text-sm">Manage your account</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSettingsTab === tab.id;
                    
                    return (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        className={`w-full justify-start py-3 px-4 rounded-2xl transition-all duration-300 mb-2 ${
                          isActive
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => setActiveSettingsTab(tab.id)}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{tab.label}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="p-4 mt-auto">
                  <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-6">
                {activeSettingsTab === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Profile Settings</h3>
                      <p className="text-gray-400">Update your personal information and preferences</p>
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
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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

                {activeSettingsTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Security Settings</h3>
                      <p className="text-gray-400">Manage your account security and privacy</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">Two-Factor Authentication</h4>
                        <p className="text-gray-400 text-sm mb-4">Add an extra layer of security to your account</p>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Enable 2FA
                        </Button>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">Change Password</h4>
                        <p className="text-gray-400 text-sm mb-4">Update your password regularly for better security</p>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Change Password
                        </Button>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-2">Active Sessions</h4>
                        <p className="text-gray-400 text-sm mb-4">Manage your active login sessions</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Current Session</p>
                            <p className="text-gray-400 text-xs">Chrome on macOS • Active now</p>
                          </div>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "notifications" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Notification Preferences</h3>
                      <p className="text-gray-400">Customize how you receive notifications</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">New Messages</h4>
                            <p className="text-gray-400 text-sm">Get notified when you receive new messages</p>
                          </div>
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                            Enabled
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">Creator Updates</h4>
                            <p className="text-gray-400 text-sm">Get notified when creators you follow post new content</p>
                          </div>
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                            Enabled
                          </Button>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">Email Notifications</h4>
                            <p className="text-gray-400 text-sm">Receive important updates via email</p>
                          </div>
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                            Enabled
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "appearance" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Appearance Settings</h3>
                      <p className="text-gray-400">Customize the look and feel of your experience</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">Theme</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-slate-950 to-purple-950 rounded-2xl p-4 border-2 border-purple-500 cursor-pointer">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2"></div>
                              <p className="text-white text-sm font-medium">Dark</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border-2 border-transparent cursor-pointer hover:border-white/20">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2"></div>
                              <p className="text-gray-400 text-sm">Light</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border-2 border-transparent cursor-pointer hover:border-white/20">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                              <p className="text-gray-400 text-sm">Auto</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "billing" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h3>
                      <p className="text-gray-400">Manage your subscription and payment methods</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-white font-semibold">Current Plan</h4>
                            <p className="text-gray-400 text-sm">Free Plan</p>
                          </div>
                          <Badge className="bg-gray-500 text-white">Free</Badge>
                        </div>
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                          Upgrade to Premium
                        </Button>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">Payment Methods</h4>
                        <p className="text-gray-400 text-sm mb-4">No payment methods added</p>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          </main>
    </div>
  );
}