import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SubscribeModal({ open, onClose, creator, avatarUrl }) {
  const [step, setStep] = useState('select');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  useEffect(() => {
    if (open) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure scroll is unlocked when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);
  if (!open) return null;
  
  const handleClose = () => {
    if (step === 'pay') {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleLeave = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const handleStay = () => {
    setShowExitConfirm(false);
  };
  const date30DaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const month = String(date30DaysFromNow.getMonth() + 1).padStart(2, '0');
  const day = String(date30DaysFromNow.getDate()).padStart(2, '0');
  const year = date30DaysFromNow.getFullYear();
  const formattedDate = `${month}/${day}/${year}`; 
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-scale-in overflow-hidden">
          {/* Gradient overlay for visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 pointer-events-none" />
          
          <button
            className="absolute cursor-pointer top-4 right-4 text-gray-400 transition-colors duration-200 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800/70"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {step === 'select' ? 'Subscribe to Creator' : 'Complete Your Payment'}
            </h2>

            <div className="text-gray-300 text-sm">
              {step === 'select' && (
                <div className="text-center">
                  {/* Creator Image */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                          <Image
                            src={avatarUrl || '/api/placeholder/128/128'}
                            alt={creator.name || creator.username}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'auto' }}
                            height={200}
                            width={200}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      {creator.name || creator.username}
                    </h3>
                    <p className="text-gray-400">
                      Subscribe to access exclusive content and support your favorite creator
                    </p>
                  </div>

                  <div>

                  </div>

                  {/* Additional benefits */}
                  <div className="mt-6 pt-6 border-t border-b pb-6 mb-6 border-slate-700/50">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Exclusive content
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Direct messaging
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Early access
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Cancel anytime
                      </div>
                    </div>
                  </div>
                  <div className='border border-slate-700/40 rounded-md p-2 mb-5 flex items-center justify-center'>
  <div>
    <div className='flex flex-col text-left'>
      <span className='text-white text-xl font-bold'>${creator.price}/MONTH</span>
      <span className='text-gray-400 text-sm mt-1'>
        Renews for ${creator.price}/month on {formattedDate}. Risk free, cancel anytime
      </span>
    </div>
  </div>
</div>
                  <div className="flex justify-center">
                    <button
                      className="bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 hover:from-pink-600 hover:via-red-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform transition-all duration-200 text-lg cursor-pointer"
                      onClick={() => setStep('pay')}
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
                
              )}

              {step === 'pay' && (
                <PayPanel onCancel={() => setStep('select')} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Leave subscription?
            </h3>
            <p className="text-gray-300 text-center mb-6">
              Your payment information will be lost if you leave now.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                onClick={handleLeave}
              >
                Leave
              </button>
              <button
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                onClick={handleStay}
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PayPanel({ onCancel }) {
  return (
    <div className="space-y-6">
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

        <div className="pt-4">
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-lg cursor-pointer">
            💳 Pay & Subscribe
          </button>
        </div>

        <button
          className="w-full text-sm text-gray-400 underline hover:text-gray-200 transition-colors py-2 cursor-pointer"
          onClick={onCancel}
        >
          ← Back to subscription details
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center pt-4 border-t border-slate-700/50">
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}