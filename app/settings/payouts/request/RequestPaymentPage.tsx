'use client'
import React, { SVGProps, FC, useEffect, useState } from 'react';
import { DollarSign, CreditCard, Bitcoin, Wallet, AlertCircle, ChevronRight } from 'lucide-react';
import { Creator, User } from '@/app/types';
import { Session } from 'next-auth';

interface PayoutOption {
  id: string;
  name: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  color: string;
  description: string;
  minAmount: number;
  processingTime: string;
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
  const [payoutAmounts, setPayoutAmounts] = useState<{[key: string]: string}>({});
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});
  const [openOptions, setOpenOptions] = useState<{[key: string]: boolean}>({});

  const payoutOptions: PayoutOption[] = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      description: 'Direct deposit to your bank account',
      minAmount: 75,
      processingTime: '3-5 business days'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Bitcoin,
      color: 'from-orange-500 to-yellow-500',
      description: 'Bitcoin, Ethereum, and other cryptocurrencies',
      minAmount: 75,
      processingTime: '1-2 hours'
    },
    {
      id: 'cosmo',
      name: 'Cosmo Wallet',
      icon: Wallet,
      color: 'from-purple-500 to-pink-500',
      description: 'Instant transfer to your Cosmo digital wallet',
      minAmount: 75,
      processingTime: 'Instant'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: DollarSign,
      color: 'from-blue-600 to-blue-700',
      description: 'Transfer to your PayPal account',
      minAmount: 75,
      processingTime: '1-3 business days'
    }
  ];


  const handleAmountChange = (optionId: string, value: string) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setPayoutAmounts(prev => ({
      ...prev,
      [optionId]: cleanValue
    }));
  };

  const handlePayout = async (optionId: string) => {
    const amount = parseFloat(payoutAmounts[optionId] || '0');
    const option = payoutOptions.find(opt => opt.id === optionId);
    if(!creator) return;
    if (!option || amount < option.minAmount || amount > creator.currentBalance) {
      return;
    }

    setProcessing(prev => ({ ...prev, [optionId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      setProcessing(prev => ({ ...prev, [optionId]: false }));
    }, 2000);
  };

  const getPayoutAmount = (optionId: string): number => {
    return parseFloat(payoutAmounts[optionId] || '0');
  };

  const isPayoutDisabled = (optionId: string): boolean => {
    if(!creator) return true;
    const amount = getPayoutAmount(optionId);
    const option = payoutOptions.find(opt => opt.id === optionId);
    return !option || amount < option.minAmount || amount > creator.currentBalance || processing[optionId];
  };
  const getCategory = (country: string): string => {
    const normalized = country.trim().toUpperCase();
  
    const usa = ["USA", "UNITED STATES", "UNITED STATES OF AMERICA"];
    const canada = ["CANADA"];
    const europe = [
      "UNITED KINGDOM",
      "GERMANY",
      "FRANCE",
      "SPAIN",
      "ITALY",
      "NETHERLANDS",
      "SWEDEN",
      "NORWAY",
      "DENMARK",
      "BELGIUM",
      "IRELAND",
      "FINLAND",
      "AUSTRIA",
      "SWITZERLAND",
      "EUROPEAN UNION",
      // add more European countries if needed
    ];
    const australia = ["AUSTRALIA"];
  
    if (usa.includes(normalized)) return "USA";
    if (canada.includes(normalized)) return "CANADA";
    if (europe.includes(normalized)) return "EUROPE";
    if (australia.includes(normalized)) return "AUSTRALIA";
  
    return "OTHER"; // Rest of the World
  };
  const category = getCategory(creator?.country || "") || "OTHER";
  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <header>
          <h2 className="text-2xl font-bold text-white mb-2">Request Payout</h2>
          <p className="text-gray-400 text-sm">Request a payout here</p>
        </header>
  
        {/* Balance Overview */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-green-400">
                ${creator?.currentBalance.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
              <p className="text-xl font-semibold text-white">
                ${creator?.totalEarnings.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Minimum Payout</p>
              <p className="text-xl font-semibold text-yellow-400">$75.00</p>
            </div>
          </div>
        </div>
  
        {/* Minimum Payout Notice */}
        {creator && creator.currentBalance < 75 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-semibold text-sm mb-1">
                Minimum Payout Not Met
              </h3>
              <p className="text-gray-300 text-xs">
                You need at least $75.00 in your balance to request a payout. 
                Current balance: ${creator.currentBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}
  
        {/* Payout Options */}
        <div className="space-y-4">
          {/* Row 1: Bank Transfer */}
          {payoutOptions
            .filter((opt) => opt.id === "bank")
            .map((option) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  onClick={() => setOpenOptions({ [option.id]: true })}
                  className="cursor-pointer group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 transition-all duration-300 hover:bg-white/10 p-6 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${option.color} shadow-lg`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{option.name}</h3>
                      <p className="text-gray-400 text-sm">{option.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              );
            })}
  
          {/* Row 2: Other options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {payoutOptions
              .filter((opt) => opt.id !== "bank")
              .map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    onClick={() => setOpenOptions({ [option.id]: true })}
                    className="cursor-pointer group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 transition-all duration-300 hover:bg-white/10 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-xl bg-gradient-to-br ${option.color} shadow-lg`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{option.name}</h3>
                        <p className="text-gray-400 text-xs">{option.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                );
              })}
          </div>
        </div>
  
        {/* Shared Modal Section */}
        {/* Shared Modal Section */}
{Object.keys(openOptions).length > 0 && (
  <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
    {(() => {
      const selectedId = Object.keys(openOptions)[0];
      const option = payoutOptions.find((o) => o.id === selectedId);
      if (!option) return null;

      return (
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            {option.name} Payout
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {option.description} – Processing time: {option.processingTime}
          </p>

          {/* BANK TRANSFER: Country + Dynamic Fields */}
          {option.id === "bank" && (
            <div className="space-y-4 mb-6">
              {/* Country Selector */}

              {/* USA Fields */}
              {creator?.country === "USA" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="Routing Number"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
              )}

              {/* CANADA Fields */}
              {category === "CANADA" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Institute Number"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="Branch Code"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
              )}

              {/* EUROPE Fields */}
              {category === "EUROPE" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="IBAN"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="BIC / SWIFT"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="Sort Code"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
              )}

              {/* AUSTRALIA Fields */}
              {category === "AUSTRALIA" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="SWIFT / BIC Code"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="BSB Number"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
              )}

              {/* REST OF WORLD Fields */}
              {category === "OTHER" && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Enter your full international payment details"
                    rows={4}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payout Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="text"
                value={payoutAmounts[option.id] || ""}
                onChange={(e) => handleAmountChange(option.id, e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePayout(option.id)}
              disabled={isPayoutDisabled(option.id)}
              className={`flex-1 py-3 rounded-xl font-semibold ${
                isPayoutDisabled(option.id)
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : `bg-gradient-to-r ${option.color} text-white`
              }`}
            >
              {processing[option.id] ? "Processing..." : "Request Payout"}
            </button>
            <button
              onClick={() => setOpenOptions({})}
              className="px-4 py-3 rounded-xl border border-white/20 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    })()}
  </div>
)}
      </main>
    </div>
  );
  
  
}