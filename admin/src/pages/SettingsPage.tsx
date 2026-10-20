import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../api/adminApi';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [shopNameHi, setShopNameHi] = useState('');
  const [shopNameEn, setShopNameEn] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [hoursHi, setHoursHi] = useState('');
  const [hoursEn, setHoursEn] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('20');
  const [freeDeliveryMin, setFreeDeliveryMin] = useState('499');
  const [announcementHi, setAnnouncementHi] = useState('');
  const [announcementEn, setAnnouncementEn] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);

  useEffect(() => {
    adminApi('/settings').then(res => {
      if (res.success && res.data) {
        const d = res.data;
        setShopNameHi(d.shopName?.hi || '');
        setShopNameEn(d.shopName?.en || '');
        setPhone(d.contactPhone || '');
        setWhatsapp(d.whatsappNumber || '');
        setHoursHi(d.supportHours?.hi || '');
        setHoursEn(d.supportHours?.en || '');
        setDeliveryFee(d.defaultDeliveryFee?.toString() || '20');
        setFreeDeliveryMin(d.freeDeliveryMinAmount?.toString() || '499');
        setAnnouncementHi(d.announcement?.hi || '');
        setAnnouncementEn(d.announcement?.en || '');
        setAnnouncementActive(d.announcement?.isActive ?? true);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          shopName: { en: shopNameEn, hi: shopNameHi },
          contactPhone: phone,
          whatsappNumber: whatsapp,
          supportHours: { en: hoursEn, hi: hoursHi },
          defaultDeliveryFee: parseFloat(deliveryFee),
          freeDeliveryMinAmount: parseFloat(freeDeliveryMin),
          announcement: {
            en: announcementEn,
            hi: announcementHi,
            isActive: announcementActive
          }
        })
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(res.message || 'Failed to save settings');
      }
    } catch (e) {
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          दुकान सेटिंग्स (Store Configuration)
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          मोबाइल ऐप पर दिखने वाले दुकान के नियम, फोन नंबर, डिलीवरी शुल्क और घोषणाएं
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-2 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>दुकान सेटिंग्स सफलतापूर्वक अपडेट हो गई हैं!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Name & Contact */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            दुकान की पहचान व संपर्क (Store Name & Contact)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                दुकान का नाम (हिन्दी में) *
              </label>
              <input
                type="text"
                required
                value={shopNameHi}
                onChange={e => setShopNameHi(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Shop Name (English) *
              </label>
              <input
                type="text"
                required
                value={shopNameEn}
                onChange={e => setShopNameEn(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                दुकानदार का मोबाइल नंबर (Call Phone) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                व्हाट्सएप नंबर (WhatsApp Support) *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Delivery Charges Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            गाँव डिलीवरी शुल्क नियम (Village Delivery Charges)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                सामान्य डिलीवरी शुल्क (Default Delivery Fee ₹) *
              </label>
              <input
                type="number"
                required
                value={deliveryFee}
                onChange={e => setDeliveryFee(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none font-bold text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                ₹499 से कम के ऑर्डर पर लिया जाने वाला शुल्क
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                मुफ़्त डिलीवरी न्यूनतम ऑर्डर (Free Delivery Threshold ₹) *
              </label>
              <input
                type="number"
                required
                value={freeDeliveryMin}
                onChange={e => setFreeDeliveryMin(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none font-bold text-emerald-700"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                इस राशि या उससे अधिक पर ग्राहक को मुफ़्त डिलीवरी मिलेगी
              </span>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            दुकान खुलने का समय (Operating Hours)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                समय विवरण (हिन्दी में)
              </label>
              <input
                type="text"
                value={hoursHi}
                onChange={e => setHoursHi(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Operating Hours (English)
              </label>
              <input
                type="text"
                value={hoursEn}
                onChange={e => setHoursEn(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              ऐप घोषणा बैनर (Announcement Bar)
            </h3>
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={e => setAnnouncementActive(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
              />
              <span>बैनर दिखाएं (Active)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">घोषणा (हिन्दी)</label>
              <input
                type="text"
                value={announcementHi}
                onChange={e => setAnnouncementHi(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement (English)</label>
              <input
                type="text"
                value={announcementEn}
                onChange={e => setAnnouncementEn(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-orange-500/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'सुरक्षित हो रहा है...' : 'सेटिंग्स सुरक्षित करें (Save Settings)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
