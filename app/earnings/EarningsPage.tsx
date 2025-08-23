'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Creator, User } from '../types';
import { Session } from 'next-auth';

interface Payment {
  id: number;
  amount: number;
  date: Date;
  type: string;
}

interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}

export default function App({creators, session}: AppProps) {  
  // Mock creator data - replace with actual props
  const [creator, setCreator] = useState<Creator>();
  useEffect(() => {
    if (session) {
      const creatorCorrect = creators.find(c => c.user === session.user._id);
      setCreator(creatorCorrect)
    }
  }, [session, creators])

  // Dummy data — replace with real transaction history from backend
  const payments = useMemo(() => [
    { id: 1, amount: 25, date: new Date("2025-08-10T14:35:00"), type: "subscription" },
    { id: 2, amount: 50, date: new Date("2025-08-10T18:10:00"), type: "purchase" },
    { id: 3, amount: 15, date: new Date("2025-08-09T09:20:00"), type: "tip" },
  ], []);

  // Simple date formatting function
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group by day
  const groupedPayments = useMemo(() => {
    return payments.reduce((acc: Record<string, Payment[]>, payment) => {
      const dateKey = payment.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(payment);
      return acc;
    }, {});
  }, [payments]);


  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <header>
          <h2 className="text-2xl font-bold text-white mb-2">Earnings</h2>
          <p className="text-gray-400 text-sm">View your earnings and payment history</p>
        </header>

        {/* All Earnings */}
        <section className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2">All Earnings</h2>
          <p className="text-3xl font-bold text-green-400">
            ${creator?.totalEarnings.toFixed(2)}
          </p>
        </section>

        {/* Current payout & pending */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col justify-center items-center">
              <h3 className="text-sm text-gray-400 mb-1">Current Amount for Payout</h3>
              <p className="text-2xl font-bold text-green-400">
                ${creator?.currentBalance?.toFixed(2) ?? "0.00"}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col justify-center items-center">
              <h3 className="text-sm text-gray-400 mb-1">Pending Balance</h3>
              <p className="text-2xl font-bold text-yellow-400">
                ${((creator?.totalEarnings ?? 0) - (creator?.currentBalance ?? 0)).toFixed(2)}
              </p>
            </div>
          </div>

        {/* Request payout button full width */}
        <Link
          href="/settings/payouts/request"
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg"
        >
          Request Payout
        </Link>

        {/* Payments list */}
        <section className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Payment History</h3>
          {Object.entries(groupedPayments).map(([date, dayPayments]) => (
            <div key={date} className="space-y-3">
              <h4 className="text-gray-300 font-medium">
                {formatDate(new Date(date))}
              </h4>
              {dayPayments.map((p, index) => {
                const fee = p.amount * 0.1;
                const net = p.amount - fee;
                const payoutDate = new Date(p.date);
                payoutDate.setDate(payoutDate.getDate() + 7);

                return (
                  <div
                    key={p.id}
                    className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex justify-between items-center hover:bg-white/10 transition-all duration-300 shadow-2xl"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Left side: details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white capitalize font-semibold">{p.type}</span>
                        <span className="text-sm text-gray-400">
                          {formatTime(p.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Gross: ${p.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-300">
                        Fanslio Fee (10%): ${fee.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Payout available on {formatDate(payoutDate)}
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
      </main>
    </div>
  );
}