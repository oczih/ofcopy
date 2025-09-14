"use client";
import React, { useEffect, useState } from "react";
import { Session } from "next-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer,  LineChart, Line, YAxis, CartesianGrid, XAxis} from "recharts";
import {  Calendar, RefreshCw, ChevronDown } from "lucide-react";
import { Creator, User } from "../types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
} from "@mui/material";
import { MiniGraphCard } from "./MiniGraphCard";

interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}
// Group by month
interface DailyRevenue {
  day: string;        // e.g. "2025-09-05"
  total: number;
  subs: number;
  tips: number;
  posts: number;
  messages: number;
}
interface MonthlyRevenue {
  month: string;      // e.g. "September 2025"
  daily: DailyRevenue[];
  totals: {
    subs: number;
    tips: number;
    posts: number;
    messages: number;
  };
}
type GraphTransactionType = 'sub' | 'tip' | 'post' | 'message' | 'subscription';
interface Transaction {
  date: Date | string;
  price: number;
  type?: GraphTransactionType;
}

type GraphType = 'total' | 'subs' | 'tips' | 'posts' | 'messages'
function groupByWeekday(transactions: Transaction[]): { day: string; avg: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped = Array(7)
    .fill(null)
    .map((_, i) => ({ day: days[i], total: 0, count: 0 }));

  transactions.forEach((tx: Transaction) => {
    const d = new Date(tx.date);
    const weekday = d.getDay(); // 0 = Sun
    grouped[weekday].total += tx.price;
    grouped[weekday].count++;
  });

  return grouped.map(g => ({
    day: g.day,
    avg: g.count ? g.total / g.count : 0,
  }));
}

function groupByTime(transactions: Transaction[]): { time: string; avg: number }[] {
  const ranges = [
    { label: "12AM–4AM", start: 0, end: 4 },
    { label: "4AM–8AM", start: 4, end: 8 },
    { label: "8AM–12PM", start: 8, end: 12 },
    { label: "12PM–4PM", start: 12, end: 16 },
    { label: "4PM–8PM", start: 16, end: 20 },
    { label: "8PM–12AM", start: 20, end: 24 },
  ];
  const grouped = ranges.map(r => ({ label: r.label, total: 0, count: 0 }));

  transactions.forEach((tx: Transaction) => {
    const d = new Date(tx.date);
    const hour = d.getHours();
    const range = ranges.find(r => hour >= r.start && hour < r.end);
    if (range) {
      const idx = ranges.indexOf(range);
      grouped[idx].total += tx.price;
      grouped[idx].count++;
    }
  });

  return grouped.map(g => ({
    time: g.label,
    avg: g.count ? g.total / g.count : 0,
  }));
}


export default function CreatorInsights({ session, users, creators }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const correctCreator = creators.find((c: Creator) => c.user === session?.user._id);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [selectedGraphs, setSelectedGraphs] = useState<Record<string, GraphType>>({});
  const [mediaType, setMediaType] = useState<"solo" | "bundle">("solo")
  const fetchUserAvatarUrl = async (user: User) => {
    if (!user.avatarKey) return;
  
  
    try {
      const key = user.avatarKey.replace(/^\/+/, '');
      if(key.startsWith("http")){
        setUserAvatars(prev => ({ ...prev, [user._id]: key }));
        return null
      }
      const res = await fetch("/api/media/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key: key }),
      });
  
      const data = await res.json();
  
      if (res.ok && data.downloadUrl?.startsWith("https://")) {
        setUserAvatars(prev => ({ ...prev, [user._id]: data.downloadUrl }));
      }
    } catch (err) {
      console.error(err);
    } finally {
    }
  };
  useEffect(() => {
    if (!Array.isArray(users)) return;
  
    users.forEach(user => {
      if (user.avatarKey && !userAvatars[user._id]) {
        fetchUserAvatarUrl(user);
      }
    });
  }, [users, userAvatars]);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-700">Loading...</span>
        </div>
      </div>
    );
  }
  if (!correctCreator) return <div className="text-center py-12">No creator found.</div>;


// Start from creator’s first purchase/subscription
const allTransactions: Transaction[] = [
  ...users.flatMap(u =>
    u.purchases.filter(p => p.creatorId.toString() === correctCreator._id.toString())
  ),
  ...users.flatMap(u =>
    u.subscriptions
      ?.filter(s => s.creatorId === correctCreator._id && s.status === "active")
      .map(s => ({ date: s.subscriptionDate, type: "sub" as GraphTransactionType, price: s.price })) ?? []
  ),
  // add tips/messages/posts if you track them separately
];

const groupedByMonth: Record<string, DailyRevenue[]> = {};

allTransactions.forEach(tx => {
  const d = new Date(tx.date);
  const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
  const dayKey = d.toISOString().split("T")[0];

  if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = [];

  let day = groupedByMonth[monthKey].find(d => d.day === dayKey);
  if (!day) {
    day = { day: dayKey, total: 0, subs: 0, tips: 0, posts: 0, messages: 0 };
    groupedByMonth[monthKey].push(day);
  }

  day.total += tx.price;

  // Only check 'type' if it exists
  if ('type' in tx) {
    if (tx.type === "sub") day.subs += tx.price;
    if (tx.type === "tip") day.tips += tx.price;
    if (tx.type === "post") day.posts += tx.price;
    if (tx.type === "message") day.messages += tx.price;
  }
});
function generateMonthRange(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const date = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (date <= endDate) {
    months.push(date.toLocaleString("default", { month: "long", year: "numeric" }));
    date.setMonth(date.getMonth() + 1);
  }

  return months;
}
const today = new Date();
const creatorStartDate = new Date(correctCreator.creatorCreatedAt); // or use first purchase date
const monthLabels = generateMonthRange(creatorStartDate, today);
// Build MonthlyRevenue[]
const monthlyRevenueData: MonthlyRevenue[] = monthLabels.reverse().map(label => {
  // find the month’s real data
  const found = Object.entries(groupedByMonth).find(([key]) => {
    const d = new Date(key + "-01");
    const l = d.toLocaleString("default", { month: "long", year: "numeric" });
    return l === label;
  });

  if (found) {
    const daily = found[1];
    return {
      month: label,
      daily,
      totals: {
        subs: daily.reduce((s, d) => s + d.subs, 0),
        tips: daily.reduce((s, d) => s + d.tips, 0),
        posts: daily.reduce((s, d) => s + d.posts, 0),
        messages: daily.reduce((s, d) => s + d.messages, 0),
      },
    };
  }

  // empty month
  return {
    month: label,
    daily: [],
    totals: { subs: 0, tips: 0, posts: 0, messages: 0 },
  };
});

  // 🔹 Key Stats
  /*const totalEarnings = correctCreator.totalEarnings ?? 0;
  const activeSubscribers = correctCreator.subscribers.filter(s => s.status === "active").length;
  const allPurchases = users.flatMap(u => {
    // Filter purchases for this creator
    const creatorPurchases = u.purchases.filter(
      p => p.creatorId.toString() === correctCreator._id.toString()
    );
  
    // Sum active subscriptions for this creator
    const creatorSubsTotal =
      u.subscriptions
        ?.filter(s => s.creatorId === correctCreator._id && s.status === "active")
        .reduce((sum, sub) => sum + sub.price, 0) ?? 0;
  
    // Return an array combining purchases and subscriptions as “pseudo-purchases”
    return [
      ...creatorPurchases,
      // create a pseudo purchase object for subscriptions if you want uniformity
      { date: new Date(), price: creatorSubsTotal, type: "subscription" }
    ];
  }); */

  
  // 🔹 Revenue Trend (12 months, just for this creator)
  const revenueData = monthlyRevenueData.map(m => ({
    month: m.month,
    revenue: m.totals.subs + m.totals.tips + m.totals.posts + m.totals.messages,
  }));
    // Inside your component
const weekdayData = groupByWeekday(allTransactions);
const timeData = groupByTime(allTransactions);
   /* const currentMonthLabel = today.toLocaleString("default", { month: "long", year: "numeric" });
 const thisMonth = monthlyRevenueData.find(m => m.month === currentMonthLabel);
  // 🔹 Top Fans (spending)
  const topFans = correctCreator.followers
    .map(f => {
      const user = users.find(u => u._id === f.userId);
      if (!user) return null;

      const spentPurchases = user.purchases
        .filter(p => p.creatorId.toString() === correctCreator._id.toString())
        .reduce((s, p) => s + p.price, 0);

      const spentSubs = user.subscriptions
        ?.filter(s => s.creatorId === correctCreator._id && s.status === "active")
        .reduce((s, sub) => s + sub.price, 0) ?? 0;

      return {
        ...f,
        user,
        totalSpent: spentPurchases + spentSubs,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.totalSpent ?? 0) - (a?.totalSpent ?? 0))
    .slice(0, 10); */

  // 🔹 Recent Subscribers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSubs = correctCreator.subscribers
    .filter(s => s.status === "active" && new Date(s.subscribedAt) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
    

    const selectGraph = (month: string, type: GraphType) => {
      setSelectedGraphs(prev => ({
        ...prev,
        [month]: type
      }));
    };
  const getGraphData = (
    monthData: MonthlyRevenue,
    type: GraphType
  ): Array<{ day: string; [key: string]: number | string }> => {
    if (type === 'total') return monthData.daily.map(d => ({ day: d.day, total: d.total }));
    return monthData.daily.map(d => ({ day: d.day, [type]: d[type] || 0 }));
  };
  
  const getGraphColor = (type: GraphType): string => {
    const colors: Record<GraphType, string> = {
      total: "#3b82f6",
      subs: "#10b981", 
      tips: "#f59e0b",
      posts: "#8b5cf6",
      messages: "#ef4444"
    };
    return colors[type] || "#3b82f6";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8 border-b-1 border-gray-500 flex justify-between items-center">
  <h1 className="text-2xl font-bold text-white">My Insights</h1>
  <div className="flex flex-row gap-5 items-center">
    <button className="cursor-pointer text-xl flex font-bold flex-row gap-3 cursor-pointer rounded-full transition-colors transition-all duration-300 px-4 py-2 items-center">
      <RefreshCw className="h-7 w-7 text-white" />
      Refresh
    </button>
    {session?.user.location?.utcOffset !== undefined && (
      <div className="text-xl text-white font-bold flex items-center">
        GMT{" "}
        {session.user.location.utcOffset >= 0 ? "+" : "-"}
        {Math.floor(Math.abs(session.user.location.utcOffset))}
        {Math.abs(session.user.location.utcOffset % 1) ? `:${Math.abs(session.user.location.utcOffset % 1) * 60}` : ""}
      </div>
    )}
  </div>
</div>
        {/* Tabs */}
        <Tabs defaultValue="earnings" className="space-y-6">
  {/* Tabs aligned top-left */}
  <div className="flex justify-start mb-4">
  <TabsList className="flex gap-3 bg-transparent p-0">
  <TabsTrigger
    value="earnings"
    className="rounded-xl bg-white/30 cursor-pointer px-3 py-1 text-white transition-colors duration-200 
               hover:bg-white/40 data-[state=active]:bg-white/60 data-[state=active]:text-black"
  >
    Earnings
  </TabsTrigger>

  <TabsTrigger
    value="monthly"
    className="rounded-xl bg-white/30 cursor-pointer px-3 py-1 text-white transition-colors duration-200 
               hover:bg-white/40 data-[state=active]:bg-white/60 data-[state=active]:text-black"
  >
    Monthly Earnings
  </TabsTrigger>

  <TabsTrigger
    value="subs"
    className="rounded-xl bg-white/30 cursor-pointer px-3 py-1 text-white transition-colors duration-200 
               hover:bg-white/40 data-[state=active]:bg-white/60 data-[state=active]:text-black"
  >
    Subscribers
  </TabsTrigger>

  <TabsTrigger
    value="content"
    className="rounded-xl bg-white/30 cursor-pointer px-3 py-1 text-white transition-colors duration-200 
               hover:bg-white/40 data-[state=active]:bg-white/60 data-[state=active]:text-black"
  >
    Content
  </TabsTrigger>
</TabsList>

  </div>

  {/* Revenue Trend */}
  <TabsContent value="earnings">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* All-Time Earnings - line chart */}
  <MiniGraphCard
    title="All-Time Earnings"
    total={revenueData.reduce((sum, m) => sum + m.revenue, 0)}
    data={revenueData}
    dataKey="revenue"
    lineColor="#3b82f6"
    subtitle="All time"
  />

  {/* Average Earnings by Day - line chart */}
  <MiniGraphCard
    title="Average Earnings by Day"
    total={weekdayData.reduce((sum, d) => sum + d.avg, 0)}
    data={weekdayData}
    dataKey="avg"
    lineColor="#10b981"
    subtitle="Top days"
  />

  {/* Average Earnings by Time - vertical bar chart */}
  <MiniGraphCard
    title="Average Earnings by Time"
    total={timeData.reduce((sum, d) => sum + d.avg, 0)}
    data={timeData.map((d, idx) => ({ ...d, label: d.time|| `T${idx + 1}` }))} // Add X labels
    dataKey="avg"
    lineColor="#f59e0b"
    subtitle="Top times"
    chartType="bar"
  />
</div>

</TabsContent>
    
  <TabsContent value="monthly">
  {monthlyRevenueData.map((m) => {
  const selectedGraph: GraphType = selectedGraphs[m.month] || "total";

  return (
    <Accordion
      key={m.month}
      sx={{
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 2,
        mb: 2,
        "&:before": { display: "none" },
      }}
    >
        <AccordionSummary
          expandIcon={<ChevronDown color="white" />}
          sx={{
            px: 2,
            py: 1,
            "& .MuiAccordionSummary-content": {
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
        <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
          {m.month}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
          Total: ${(m.totals.subs + m.totals.tips + m.totals.posts + m.totals.messages).toFixed(2)}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
        {/* Graph Selection Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "total", label: "Total", color: "bg-blue-500" },
            { key: "subs", label: "Subs", color: "bg-green-500" },
            { key: "tips", label: "Tips", color: "bg-yellow-500" },
            { key: "posts", label: "Posts", color: "bg-purple-500" },
            { key: "messages", label: "Messages", color: "bg-red-500" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => selectGraph(m.month, key as GraphType)}
              className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all duration-200 transform ${
                selectedGraph === key
                  ? `${color} text-white shadow-lg`
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Graph */}
        <div className="h-64 w-full bg-white/5 rounded-lg p-4 border border-white/20 transition-all duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getGraphData(m, selectedGraph)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#ffffff80" fontSize={12} />
              <YAxis
                stroke="#ffffff80"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Line
                type="monotone"
                dataKey={selectedGraph === "total" ? "total" : selectedGraph}
                stroke={getGraphColor(selectedGraph)}
                strokeWidth={3}
                dot={{
                  fill: getGraphColor(selectedGraph),
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: getGraphColor(selectedGraph),
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white font-medium mt-4">
          <div
            className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 cursor-pointer transition-all duration-300 hover:bg-green-500/30 hover:shadow-lg"
            onClick={() => selectGraph(m.month, "subs")}
          >
            <div className="text-green-400 text-sm font-semibold mb-1">Subs</div>
            <div className="text-xl font-bold">${m.totals.subs.toFixed(2)}</div>
          </div>
          <div
            className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30 cursor-pointer transition-all duration-300 hover:bg-yellow-500/30 hover:shadow-lg"
            onClick={() => selectGraph(m.month, "tips")}
          >
            <div className="text-yellow-400 text-sm font-semibold mb-1">Tips</div>
            <div className="text-xl font-bold">${m.totals.tips.toFixed(2)}</div>
          </div>
          <div
            className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/30 cursor-pointer transition-all duration-300 hover:bg-purple-500/30 hover:shadow-lg"
            onClick={() => selectGraph(m.month, "posts")}
          >
            <div className="text-purple-400 text-sm font-semibold mb-1">Posts</div>
            <div className="text-xl font-bold">${m.totals.posts.toFixed(2)}</div>
          </div>
          <div
            className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 cursor-pointer transition-all duration-300 hover:bg-red-500/30 hover:shadow-lg"
            onClick={() => selectGraph(m.month, "messages")}
          >
            <div className="text-red-400 text-sm font-semibold mb-1">Messages</div>
            <div className="text-xl font-bold">${m.totals.messages.toFixed(2)}</div>
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
})}
</TabsContent>


  {/* Subscribers */}
  <TabsContent value="subs">
    <Card className="bg-white/10 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>
          <Calendar className="inline-block mr-2 text-blue-400" />
          Recent Subscribers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSubs.map((sub) => (
            <div
              key={sub.userId.toString()}
              className="flex items-center justify-between bg-white/5 p-4 rounded-lg"
            >
              <p className="font-semibold">@{sub.username}</p>
              <p className="text-sm text-green-500">${sub.subscriptionPrice}/mo</p>
            </div>
          ))}
          {recentSubs.length === 0 && (
            <p className="text-center text-gray-400">
              No new subscribers in the last 30 days
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
  <TabsContent value="content">
      <Card className="border-0">
        <CardHeader>
          <CardTitle>Content Insights</CardTitle>
          <CardDescription>
            View your content insights here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium">Top Posts</h3>
              <p className="text-sm text-gray-400">
                View your top performing posts.
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-3 mt-5">
            <button onClick={() => setMediaType("solo")} className={`${mediaType === "solo" ? "border-2 border-white" : "border-none"} rounded-full bg-white/10 transition-all duration-200 cursor-pointer`}>
            <Chip label={<span className="text-white">Solo Media</span>} />
            </button>
            <button onClick={() => setMediaType("bundle")} className={`${mediaType === "bundle" ? "border-2 border-white" : "border-none"} rounded-full hover:bg-white/30 bg-white/10 transition-all duration-200 cursor-pointer`}>
            <Chip label={<span className="text-white">Bundles</span>} />
            </button>
          </div>
          {mediaType === "solo" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Top Solo Posts
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Highest earning solo uploads this month.
            </p>
            <div className="space-y-3">
              {[1, 2, 3].map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between bg-white/5 p-4 rounded-lg hover:bg-white/10 transition"
                >
                  <span className="font-medium text-white">
                    Solo Post #{id}
                  </span>
                  <span className="text-green-400 font-bold">
                    ${(Math.random() * 200 + 50).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Engagement Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={[
                  { day: "Mon", views: 120 },
                  { day: "Tue", views: 90 },
                  { day: "Wed", views: 150 },
                  { day: "Thu", views: 200 },
                  { day: "Fri", views: 170 },
                  { day: "Sat", views: 130 },
                  { day: "Sun", views: 100 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="day" stroke="#ffffff80" fontSize={12} />
                <YAxis stroke="#ffffff80" fontSize={12} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6" }}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bundle Insights */}
      {mediaType === "bundle" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Top Bundles
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Best performing bundles by sales.
            </p>
            <div className="space-y-3">
              {[1, 2].map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between bg-white/5 p-4 rounded-lg hover:bg-white/10 transition"
                >
                  <span className="font-medium text-white">
                    Bundle #{id}
                  </span>
                  <span className="text-green-400 font-bold">
                    {(Math.random() * 300 + 100).toFixed(2)} sales
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={[
                  { week: "W1", revenue: 500 },
                  { week: "W2", revenue: 800 },
                  { week: "W3", revenue: 650 },
                  { week: "W4", revenue: 900 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="week" stroke="#ffffff80" fontSize={12} />
                <YAxis
                  stroke="#ffffff80"
                  fontSize={12}
                  tickFormatter={(v) => `$${v}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
        </CardContent>
      </Card>
  </TabsContent>
</Tabs>

      </div>
    </div>
  );
}
