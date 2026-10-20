import React, { useState, useEffect } from 'react';
import { Store, Bell, LogOut, ShieldCheck, Volume2, VolumeX, BellPlus } from 'lucide-react';
import {
  orderAlertService,
  hasNotificationPermission,
  requestNotificationPermission
} from '../utils/orderAlert';

interface NavbarProps {
  adminName: string;
  unreadCount: number;
  onLogout: () => void;
  newOrderAlert?: string | null;
  onClearAlert?: () => void;
  onViewOrderAlert?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  adminName,
  unreadCount,
  onLogout,
  newOrderAlert,
  onClearAlert,
  onViewOrderAlert
}) => {
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [hasNotifPerm, setHasNotifPerm] = useState(false);

  useEffect(() => {
    setIsSoundOn(orderAlertService.isEnabled());
    setHasNotifPerm(hasNotificationPermission());
  }, []);

  const handleToggleSound = () => {
    const newState = orderAlertService.toggleSound();
    setIsSoundOn(newState);
  };

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setHasNotifPerm(granted);
    if (granted) {
      orderAlertService.playChime();
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Real-time Order Alert Toast Banner */}
      {newOrderAlert && (
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2.5 text-sm font-semibold flex flex-wrap items-center justify-between shadow-inner gap-2">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-200"></span>
            </span>
            <span className="font-bold">🔔 {newOrderAlert}</span>
          </div>
          <div className="flex items-center space-x-2">
            {onViewOrderAlert && (
              <button
                onClick={onViewOrderAlert}
                className="text-xs bg-white text-orange-700 hover:bg-orange-50 font-bold px-3 py-1 rounded-lg shadow-sm transition"
              >
                ऑर्डर देखें (View)
              </button>
            )}
            {onClearAlert && (
              <button
                onClick={onClearAlert}
                className="text-xs bg-black/20 hover:bg-black/30 text-white px-2.5 py-1 rounded-lg transition"
              >
                हटाएँ (Dismiss)
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
              <span className="text-orange-600">Apna Bazar</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              दुकानदार प्रबंधन पोर्टल (Shop Owner Dashboard)
            </p>
          </div>
        </div>

        {/* User profile & sound/notification controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Sound Alert Toggle & Test */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition shadow-sm ${
              isSoundOn
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title={isSoundOn ? 'साउंड चालू है (क्लिक करके टेस्ट करें)' : 'साउंड बंद है'}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isSoundOn ? 'साउंड चालू (Sound ON)' : 'साउंड बंद (Muted)'}</span>
          </button>

          {/* Desktop Push Notification Request */}
          {!hasNotifPerm && (
            <button
              onClick={handleRequestNotif}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition shadow-sm"
              title="डेस्कटॉप नोटिफिकेशन चालू करें"
            >
              <BellPlus className="w-3.5 h-3.5 text-amber-600" />
              <span>नोटिफिकेशन चालू करें</span>
            </button>
          )}

          {/* Storekeeper Profile Tag */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">{adminName || 'दुकानदार (Owner)'}</span>
          </div>

          {/* Notifications Counter */}
          <div className="relative p-2 text-slate-600 hover:text-slate-900 cursor-pointer">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
            title="लॉगआउट"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
