'use client'


// -------------------- SetPriceModal --------------------
type SetPriceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (price: number) => void;
  tempPrice: string;
  setTempPrice: (price: string) => void;
};

export default function SetPriceModal({ isOpen, onClose, onSave, tempPrice, setTempPrice }: SetPriceModalProps) {
  if (!isOpen) return null;

  const handleSavePrice = () => {
    onSave(parseFloat(tempPrice) || 0);
    onClose();
    setTempPrice("");
  };

  const handleCancelPrice = () => {
    onClose();
    setTempPrice("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-[9999]">
      <div className="bg-[#13072c] backdrop-blur-lg rounded-3xl border border-white/20 w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Set Message Price</h2>
          <button onClick={handleCancelPrice} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-white font-semibold">Price (USD)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">$</span>
            </div>
            <input
              type="number"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <p className="text-sm text-gray-400">Minimum price is $3.99</p>
        </div>
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={handleSavePrice}
            disabled={!tempPrice || parseFloat(tempPrice) < 3.99}
            className="flex-1 px-4 py-3 cursor-pointer 
                      bg-gradient-to-r from-pink-500 to-purple-500 
                      hover:from-pink-600 hover:to-purple-600 
                      text-white rounded-xl font-semibold 
                      shadow-lg 
                      transition-colors duration-300
                      hover:shadow-xl
                      disabled:from-gray-400 disabled:to-gray-500 
                      disabled:cursor-not-allowed"
          >
            Set Price
          </button>
        </div>
      </div>
    </div>
  );
}