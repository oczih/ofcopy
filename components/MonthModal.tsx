"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

interface DailyRevenue {
  day: string; // "2025-09-01"
  total: number;
  subs: number;
  messages: number;
  posts: number;
  tips: number;
}

interface MonthlyProps {
  revenueData: DailyRevenue[];
  month: string;
  onOpen: boolean;
  onClose: () => void;
}

export default function MonthlyModal({ revenueData, month, onOpen, onClose }: MonthlyProps) {
  // calculate totals for summary
  const totals = revenueData?.reduce(
    (acc, d) => {
      acc.total += d.total;
      acc.subs += d.subs;
      acc.messages += d.messages;
      acc.posts += d.posts;
      acc.tips += d.tips;
      return acc;
    },
    { total: 0, subs: 0, messages: 0, posts: 0, tips: 0 }
  );

  return (
    <Dialog open={onOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{month} Earnings</DialogTitle>
        </DialogHeader>

        <Card className="bg-white/10 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="day" tick={{ fill: "white" }} />
                <YAxis tick={{ fill: "white" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                  formatter={(v, name) => [`$${v}`, name]}
                />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 border-0 text-center">
            <CardHeader><CardTitle>Total</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">${totals?.total.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-white/10 border-0 text-center">
            <CardHeader><CardTitle>Subs</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">${totals?.subs.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-white/10 border-0 text-center">
            <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">${totals?.messages.toFixed(2)}</CardContent>
          </Card>
          <Card className="bg-white/10 border-0 text-center">
            <CardHeader><CardTitle>Posts / Tips</CardTitle></CardHeader>
            <CardContent className="text-xl font-bold">
              ${(totals?.posts + totals?.tips).toFixed(2)}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}