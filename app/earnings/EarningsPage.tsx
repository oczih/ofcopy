'use client';

import { Session } from "next-auth";
import { Creator, User } from "../types";
import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}

export default function App({}: AppProps) {

  // Dummy data — replace with real transaction history from backend
  const payments = useMemo(() => [
    { id: 1, amount: 25, date: new Date("2025-08-10T14:35:00"), type: "subscription" },
    { id: 2, amount: 50, date: new Date("2025-08-10T18:10:00"), type: "purchase" },
    { id: 3, amount: 15, date: new Date("2025-08-09T09:20:00"), type: "tip" },
  ], []);

  

  // Group by day
  const groupedPayments = useMemo(() => {
    return payments.reduce((acc: Record<string, typeof payments>, payment) => {
      const dateKey = format(payment.date, "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(payment);
      return acc;
    }, {});
  }, [payments]);

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  const currentForPayout = 40; // Replace with backend calc
  const pendingBalance = 50; // Replace with backend calc

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* All Earnings */}
      <section className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-2">All Earnings</h2>
        <p className="text-3xl font-bold text-green-400">
          ${totalEarnings.toFixed(2)}
        </p>
      </section>

      {/* Current payout & pending */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col justify-center items-center">
          <h3 className="text-sm text-gray-400 mb-1">Current Amount for Payout</h3>
          <p className="text-2xl font-bold text-green-400">
            ${currentForPayout.toFixed(2)}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col justify-center items-center">
          <h3 className="text-sm text-gray-400 mb-1">Pending Balance</h3>
          <p className="text-2xl font-bold text-yellow-400">
            ${pendingBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Request payout button full width */}
      <Link
        href="/settings/payouts/request"
        className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition"
      >
        Request Payout
      </Link>

      {/* Payments list */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Payment History</h3>
        {Object.entries(groupedPayments).map(([date, dayPayments]) => (
          <div key={date} className="space-y-3">
            <h4 className="text-gray-300 font-medium">
              {format(new Date(date), "MMMM d, yyyy")}
            </h4>
            {dayPayments.map((p) => {
              const fee = p.amount * 0.1;
              const net = p.amount - fee;
              const payoutDate = new Date(p.date);
              payoutDate.setDate(payoutDate.getDate() + 7);

              return (
                <div
                  key={p.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-center"
                >
                  {/* Left side: details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white capitalize">{p.type}</span>
                      <span className="text-sm text-gray-400">
                        {format(p.date, "h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Gross: ${p.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-300">
                      Fanslio Fee (10%): ${fee.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Payout available on {format(payoutDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  {/* Right side: net */}
                  <p className="text-lg text-green-400 font-semibold">
                    ${net.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </div>
  );
}
