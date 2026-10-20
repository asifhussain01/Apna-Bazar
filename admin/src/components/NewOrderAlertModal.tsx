import React from 'react';
import { BellRing, Volume2, ArrowRight, X, MapPin, User, IndianRupee, ShoppingBag } from 'lucide-react';
import { orderAlertService } from '../utils/orderAlert';

export interface NewOrderData {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  village: string;
  itemsCount?: number;
  createdAt?: string;
}

interface Props {
  order: NewOrderData;
  onViewOrder: (orderId: string) => void;
  onDismiss: () => void;
}

export const NewOrderAlertModal: React.FC<Props> = ({ order, onViewOrder, onDismiss }) => {
  const handleReplay = () => {
    orderAlertService.playChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-orange-500 max-w-md w-full overflow-hidden transform scale-100 transition-all">
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-6 text-white text-center relative">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full text-orange-600 shadow-xl mb-3 animate-bounce">
            <BellRing className="w-10 h-10 animate-pulse text-orange-600" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">नया ऑर्डर प्राप्त हुआ!</h2>
          <p className="text-orange-100 text-sm font-medium mt-1">
            अभी-अभी ग्राहक ने अपना बाज़ार में ऑर्डर दिया है
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-4">
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">ऑर्डर संख्या</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">कुल राशि (COD)</p>
              <p className="text-2xl font-black text-emerald-700 flex items-center justify-end">
                <IndianRupee className="w-5 h-5" />
                {order.totalAmount}
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm">
            <div className="flex items-center text-slate-700">
              <User className="w-4 h-4 text-orange-600 mr-2.5 flex-shrink-0" />
              <span className="font-semibold text-slate-500 mr-2">ग्राहक का नाम:</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>

            <div className="flex items-center text-slate-700">
              <MapPin className="w-4 h-4 text-orange-600 mr-2.5 flex-shrink-0" />
              <span className="font-semibold text-slate-500 mr-2">डिलीवरी गाँव:</span>
              <span className="font-bold text-slate-900">{order.village}</span>
            </div>

            {order.itemsCount !== undefined && (
              <div className="flex items-center text-slate-700">
                <ShoppingBag className="w-4 h-4 text-orange-600 mr-2.5 flex-shrink-0" />
                <span className="font-semibold text-slate-500 mr-2">कुल सामान:</span>
                <span className="font-bold text-slate-900">{order.itemsCount} वस्तुएँ</span>
              </div>
            )}
          </div>

          {/* Sound Replay button */}
          <div className="flex justify-center">
            <button
              onClick={handleReplay}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-100/70 hover:bg-orange-100 px-3.5 py-1.5 rounded-full transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>साउंड दोबारा बजाएं (Replay Sound)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onDismiss}
              className="w-full py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-sm text-center"
            >
              बाद में देखें
            </button>

            <button
              onClick={() => {
                onViewOrder(order.orderId);
                onDismiss();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30 transition text-sm flex items-center justify-center space-x-2"
            >
              <span>ऑर्डर खोलें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
