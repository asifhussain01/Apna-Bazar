import React, { useState } from 'react';
import { Store, Lock, Phone, ArrowRight, User, UserPlus, LogIn } from 'lucide-react';
import { adminApi, setAuthToken } from '../api/adminApi';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggleMode = (mode: boolean) => {
    setIsRegisterMode(mode);
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें। (Please enter a valid 10-digit mobile number)');
      return;
    }

    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए। (Password must be at least 6 characters)');
      return;
    }

    if (isRegisterMode) {
      if (!fullName.trim()) {
        setError('कृपया अपना या दुकान का नाम दर्ज करें। (Please enter your name or shop name)');
        return;
      }
      if (password !== confirmPassword) {
        setError('दोनों पासवर्ड मेल नहीं खाते हैं। (Passwords do not match)');
        return;
      }
    }

    try {
      setLoading(true);

      if (isRegisterMode) {
        // Create new admin account
        const res = await adminApi('/auth/register-admin', {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: cleanPhone,
            fullName: fullName.trim(),
            password
          })
        });

        if (res.success && res.token) {
          setSuccessMsg('खाता सफलतापूर्वक बनाया गया! पोर्टल लोड हो रहा है...');
          setAuthToken(res.token);
          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 800);
        } else {
          setError(res.message || 'खाता बनाने में असमर्थ। कृपया पुनः प्रयास करें।');
        }
      } else {
        // Log in to existing admin account
        const res = await adminApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: cleanPhone,
            password
          })
        });

        if (res.success && res.token) {
          if (res.user?.role !== 'admin') {
            setError('इस खाते के पास व्यवस्थापक (Admin) की अनुमति नहीं है। केवल दुकानदार खाता लॉगिन कर सकता है।');
            return;
          }

          setAuthToken(res.token);
          onLoginSuccess(res.user);
        } else {
          setError(res.message || 'लॉगिन असफल: कृपया मोबाइल नंबर या पासवर्ड जांचें');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'सर्वर से कनेक्ट करने में समस्या हुई। कृपया जांचें कि बैकएंड सर्वर चालू है।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/20 mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          <span className="text-orange-600">Apna Bazar</span>
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
          दुकानदार पोर्टल (Shop Owner Portal)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200 sm:px-10">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isRegisterMode
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>लॉगिन (Log In)</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isRegisterMode
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>नया खाता (Create Account)</span>
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3.5 rounded-xl">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-xl">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Registration */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दुकानदार का नाम या दुकान का नाम (Name / Shop Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required={isRegisterMode}
                    placeholder="उदा. रमेश कुमार / अपना किराना स्टोर"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-orange-500 font-medium text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                दुकानदार का मोबाइल नंबर (Admin Mobile Number)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="10 अंकों का मोबाइल नंबर (उदा. 9876543210)"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-orange-500 font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="कम से कम 6 अक्षर"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-orange-500 font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Confirm Password for Registration */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पासवर्ड की दोबारा पुष्टि करें (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required={isRegisterMode}
                    placeholder="वही पासवर्ड दोबारा दर्ज करें"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-orange-500 font-medium text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-orange-500/20 text-xs font-black text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition disabled:opacity-60"
            >
              <span>
                {loading
                  ? isRegisterMode
                    ? 'खाता बनाया जा रहा है...'
                    : 'सत्यापन हो रहा है...'
                  : isRegisterMode
                  ? 'नया खाता बनाएं (Create Account)'
                  : 'लॉगिन करें (Sign In)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            {isRegisterMode ? (
              <p className="text-xs text-slate-500">
                पहले से खाता मौजूद है?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  यहाँ लॉगिन करें (Sign In)
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                नया दुकानदार हैं?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  नया खाता बनाएं (Create Account)
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
