import { useState } from 'react';

export default function SubscribeModal({ open, onClose, creator }) {
  const [step, setStep] = useState<'select' | 'pay'>('select');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-scale-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-pink-400"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {step === 'select' ? 'Subscribe to Creator' : 'Complete Your Payment'}
        </h2>
        <div className="text-gray-300 text-sm max-h-[60vh] overflow-y-auto">
          {step === 'select' && (
            <>
              <p className="mb-4">
                Subscribe to <strong>{creator.name || creator.username}</strong> to access exclusive content.
              </p>
              <button
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
                onClick={() => setStep('pay')}
              >
                Subscribe Now
              </button>
            </>
          )}
          {step === 'pay' && (
            <PayPanel onCancel={() => setStep('select')} />
          )}
        </div>
      </div>
    </div>
  );
}

function PayPanel({ onCancel }: { onCancel: () => void }) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm">Enter your payment details below.</p>
        <input
          type="text"
          placeholder="Card Number"
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="MM/YY"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="CVC"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
          />
        </div>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
        >
          Pay & Subscribe
        </button>
        <button
          className="text-sm text-gray-400 underline hover:text-gray-200"
          onClick={onCancel}
        >
          Back
        </button>
      </div>
    );
  }
  