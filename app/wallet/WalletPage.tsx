"use client";

import React, { useState } from "react";
import { Creator, User } from "../types";
import { Session } from "next-auth";
import { Bitcoin, Banknote, X } from "lucide-react";
import { CryptoPaymentModal } from "@/components/CryptoModal";
interface PayPanelProps {
  onCancel: () => void;
  topUpAmount: string | null;
  showAlternativeMethods?: boolean; // NEW
}

const amounts = ["$10", "$25", "$50", "$100", "$200", "$500"];

function TopUpPanel({
  onContinue,
}: {
  onContinue: (amount: string) => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);

  return (
    <div className="space-y-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <p className="text-white font-bold text-lg">Add Wallet Credits</p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {amounts.map((amount, index) => (
          <button
            key={amount}
            className={`px-6 py-3 rounded-xl font-bold cursor-pointer transition-all duration-300 shadow-lg ${
              selectedAmount === amount
                ? "bg-gradient-to-r from-pink-500 to-pink-600 outline-2 outline-white text-white"
                : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
            }`}
            onClick={() => setSelectedAmount(amount)}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {amount}
          </button>
        ))}
      </div>

      <button
        className="w-full bg-gradient-to-r from-blue-500 cursor-pointer to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedAmount}
        onClick={() => selectedAmount && onContinue(selectedAmount)}
      >
        Continue
      </button>
    </div>
  );
}

function PayPanel({ topUpAmount, showAlternativeMethods = true, onCancel }: PayPanelProps) {
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  return (
    <div className="space-y-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/20">🔒 SSL</span>
          <span className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/20">💳 Encrypted</span>
        </div>
      </div>

      <div className="text-center font-bold text-2xl text-white">${topUpAmount}</div>

      {/* Alternative Payment Options */}
      {showAlternativeMethods && (
        <div className="space-y-3">
          <div className="flex justify-end">
          <button
        className="absolute top-4 right-4 cursor-pointer text-white hover:text-pink-400 transition-colors"
        onClick={onCancel}
      >
        <X size={24} />
      </button>
          </div>

          <button
            onClick={() => setShowCryptoModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 cursor-pointer text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-colors duration-200"
          >
            <Bitcoin size={20} /> Pay with Crypto
          </button>

          {showCryptoModal && (
            <CryptoPaymentModal
              amountUsd={Number(topUpAmount) || 0}
              onClose={() => setShowCryptoModal(false)}
            />
          )}

          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 cursor-pointer text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-colors duration-200">
            <Banknote size={20} /> Bank Transfer
          </button>
        </div>
      )}


      {/* Card Payment */}
      {/* <div className="space-y-4 pt-4 border-t border-white/10">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Number
          </label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-white/40 transition-all duration-200"
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
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-white/40 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-white/40 transition-all duration-200"
            />
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 cursor-pointer text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 text-lg">
          <CreditCard size={20} /> Add Payment / Top Up
        </button>

        <button
          className="w-full text-sm text-gray-400 cursor-pointer hover:text-gray-200 transition-colors py-2 hover:underline"
          onClick={onCancel}
        >
          ← Back
        </button>
      </div>  */}

      <div className="text-xs text-gray-500 text-center pt-4 border-t border-white/10">
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}
interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}

export default function App({session}: AppProps) {  

  const [showPayPanel, setShowPayPanel] = useState(false);
  const [showTopUpPanel, setShowTopUpPanel] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <header>
          <h2 className="text-2xl font-bold text-white mb-2">Your Wallet & Payment Methods</h2>
          <p className="text-gray-400 text-sm">Manage your wallet credits and payment methods</p>
        </header>

        {/* Wallet Credit */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <p className="text-gray-300 text-sm mb-2">Wallet Credit</p>
          <p className="text-white text-3xl font-bold">${session?.user?.wallet || 0}</p>
        </div>
        
        {/* Top Up Button */}
        <div>
          <button
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 cursor-pointer text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setShowTopUpPanel(true)}
          >
            Top Up
          </button>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <p className="text-white text-lg font-semibold">My Payment Methods</p>
          {session?.user?.paymentmethods?.length ? (
            <div className="space-y-3">
              {session.user.paymentmethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 px-6 py-4 text-white flex justify-between items-center hover:bg-white/10 transition-all duration-300 shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <span className="font-medium">{method.brand}</span>
                  <button className="text-sm text-pink-400 hover:text-pink-300 hover:underline transition-colors">
                    Use
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <button
                className="w-full bg-gradient-to-r cursor-pointer from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  setShowPayPanel(true);
                  setTopUpAmount(null); // since we’re just adding a card
                }}
              >
                💳 Add Card
              </button>
            </div>
          )}
        </div>

        {/* PayPanel modal */}
        {showPayPanel && (
  <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
    <div className="w-full max-w-md">
      <PayPanel
        topUpAmount={topUpAmount}
        showAlternativeMethods={!!topUpAmount} // only show when topping up
        onCancel={() => {
          setShowPayPanel(false);
          setTopUpAmount(null);
        }}
      />
    </div>
  </div>
)}

        {/* TopUpPanel modal */}
        {showTopUpPanel && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
            <div className="w-full max-w-md">
            <TopUpPanel
                onContinue={(amount) => {
                  setTopUpAmount(parseFloat(amount.replace('$', '')).toString());
                  setShowTopUpPanel(false);
                  setShowPayPanel(true); // still shows alternatives
                }}
                />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}