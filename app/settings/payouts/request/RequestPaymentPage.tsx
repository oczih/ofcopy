'use client'
import React, { SVGProps, FC, useEffect, useState } from 'react';
import { DollarSign, CreditCard, Bitcoin, Wallet, AlertCircle, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
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

  const toggleOption = (optionId: string) => {
    setOpenOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

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
              <p className="text-xl font-semibold text-yellow-400">
                $75.00
              </p>
            </div>
          </div>
        </div>

        {/* Minimum Payout Notice */}
        {creator && creator.currentBalance < 75 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-semibold text-sm mb-1">Minimum Payout Not Met</h3>
              <p className="text-gray-300 text-xs">
                You need at least $75.00 in your balance to request a payout. 
                Current balance: ${creator.currentBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Payout Options */}
        <div className="space-y-4">
          {payoutOptions.map((option, index) => {
            const IconComponent = option.icon;
            const amount = getPayoutAmount(option.id);
            const disabled = isPayoutDisabled(option.id);
            const isProcessing = processing[option.id];
            const isOpen = openOptions[option.id];

            return (
              <div
                key={option.id}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 transition-all duration-300 hover:bg-white/10"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Gradient Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Header Button */}
                <button
                  onClick={() => toggleOption(option.id)}
                  className="w-full p-6 text-left flex cursor-pointer items-center justify-between relative z-10"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${option.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-emerald-400 group-hover:bg-clip-text transition-all duration-300">
                        {option.name}
                      </h3>
                      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {creator && (amount >= option.minAmount && amount <= creator.currentBalance) && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    )}
                  </div>
                </button>

                {/* Expandable Content */}
                {isOpen && (
                  <div className="px-6 pb-6 relative z-10 border-t border-white/10">
                    <div className="pt-4 space-y-4">
                      <p className="text-gray-400 text-sm">
                        Processing time: {option.processingTime}
                      </p>

                      {/* Amount Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Payout Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            $
                          </span>
                          <input
                            type="text"
                            value={payoutAmounts[option.id] || ''}
                            onChange={(e) => handleAmountChange(option.id, e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            disabled={creator && (creator.currentBalance < option.minAmount)}
                          />
                        </div>
                        {amount > 0 && amount < option.minAmount && (
                          <p className="text-red-400 text-xs mt-1">
                            Minimum amount is ${option.minAmount}
                          </p>
                        )}
                        {creator && (amount > creator.currentBalance) && (
                          <p className="text-red-400 text-xs mt-1">
                            Amount exceeds available balance
                          </p>
                        )}
                      </div>

                      {/* Payout Button */}
                      <button
                        onClick={() => handlePayout(option.id)}
                        disabled={disabled}
                        className={`w-full py-3 rounded-xl cursor-pointer font-semibold transition-all duration-300 ${
                          disabled
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : `bg-gradient-to-r ${option.color} text-white hover:shadow-lg hover:scale-105 active:scale-95`
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          `Request ${option.name} Payout`
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-3">Important Information</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• Minimum payout amount is $75.00 for all payment methods</p>
            <p>• Processing times may vary depending on the payment method and external factors</p>
            <p>• You can only request payouts up to your available balance</p>
            <p>• Fees may apply depending on the payment method chosen</p>
            <p>• Contact support if you experience any issues with your payout request</p>
          </div>
        </div>
      </main>
    </div>
  );
}