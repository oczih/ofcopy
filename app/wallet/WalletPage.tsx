"use client";

import { useState } from "react";
import { Creator, User } from "../types";
import { Session } from "next-auth";

interface AppProps {
    creators: Creator[];
    session: Session | null;
    users: User[];
  }

interface PayPanelProps {
  onCancel: () => void;
}


  const amounts = ["$10", "$25", "$50", "$100", "$200", "$500"]
  function TopUpPanel({
    onContinue,
  }: {
    onContinue: (amount: string) => void;
  }) {
    const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  
    return (
      <div className="space-y-6 p-4 bg-slate-900 rounded-xl">
        <div className="text-center mb-6">
          <p className="text-gray-300 font-bold">Add Wallet Credits</p>
        </div>
  
        <div className="flex flex-wrap gap-4 justify-center">
          {amounts.map((amount) => (
            <button
              key={amount}
              className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
                selectedAmount === amount
                  ? "bg-pink-500 outline-2 outline-white"
                  : "bg-pink-500 hover:bg-pink-600 text-white"
              }`}
              onClick={() => setSelectedAmount(amount)}
            >
              {amount}
            </button>
          ))}
        </div>
  
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedAmount}
          onClick={() => selectedAmount && onContinue(selectedAmount)}
        >
          Continue
        </button>
      </div>
    );
  }
  
  
function PayPanel({ onCancel }: PayPanelProps) {
  return (
    <div className="space-y-6 p-4 bg-slate-900 rounded-xl">
      <div className="text-center mb-6">
        <p className="text-gray-300">Secure payment powered by Epoch</p>
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-xs bg-slate-800 px-2 py-1 rounded">🔒 SSL</span>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded">💳 Encrypted</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Number
          </label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            className="w-full hover:border-white bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full hover:border-white bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full hover:border-white bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-lg cursor-pointer">
          💳 Add Payment / Top Up
        </button>

        <button
          className="w-full text-sm text-gray-400 underline hover:text-gray-200 transition-colors py-2 cursor-pointer"
          onClick={onCancel}
        >
          ← Back
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center pt-4 border-t border-slate-700/50">
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}

export default function App({ creators, users, session }: AppProps) {
  const [showPayPanel, setShowPayPanel] = useState(false);
  const [showTopUpPanel, setShowTopUpPanel] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState<string | null>(null);
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Wallet Credit */}
      <div className="text-2xl font-bold">Your Wallet & Payment Methods</div>
      <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-center">
        <p className="text-gray-300 text-sm">Wallet Credit</p>
        <p className="text-white text-2xl font-bold">${session?.user?.wallet || 0}</p>
      </div>
      
      <div>
        <button
          className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          onClick={() => setShowTopUpPanel(true)}
        >
          Top Up
        </button>
      </div>
      {/* PayPanel modal */}
      {showPayPanel && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4">
          <div className="w-full max-w-md">
            <PayPanel
              onCancel={() => {
                setShowPayPanel(false);
                setTopUpAmount(null);
              }}
            />
          </div>
        </div>
      )}
      {showTopUpPanel && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4">
          <div className="w-full max-w-md">
            <TopUpPanel
              onContinue={(amount) => {
                setTopUpAmount(amount);
                setShowTopUpPanel(false);
                setShowPayPanel(true);
              }}
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <p className="text-gray-300 text-sm mb-2">My Payment Methods</p>
        {session?.user.paymentmethods?.length ? (
          <ul className="space-y-2">
            {session.user.paymentmethods.map((method, index) => (
              <li
                key={index}
                className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white flex justify-between items-center"
              >
                <span>{method.brand}</span>
                <button className="text-xs text-pink-500 hover:underline">Use</button>
              </li>
            ))}
          </ul>
        ) : (
        <div>
            <button
              className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              onClick={() => setShowPayPanel(true)}
            >
              💳 Add Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
