import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  IndianRupee,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { MetricsCard } from '../components/MetricsCard';
import { adminApi } from '../api/adminApi';

interface DashboardPageProps {
  onSelectOrder: (order: any) => void;
  onGoToOrders: () => void;
  onGoToProducts: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectOrder,
  onGoToOrders,
  onGoToProducts
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await adminApi('/admin/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const counts = data?.statusCounts || {};
  const totalSales = data?.totalRevenue || data?.totalSales || 0;
  const lowStock = data?.lowStockProducts || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            दुकान का विवरण (Store Overview)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            आज के आर्डर, गाँव में डिलीवरी स्थिति और स्टॉक का हाल
          </p>
        </div>

        <button
          onClick={loadMetrics}
          className="self-start text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          डेटा रिफ्रेश करें (Refresh)
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricsCard
          title="कुल बिक्री (Sales)"
          value={`₹${totalSales.toLocaleString('en-IN')}`}
          subtitle="कुल व्यापार"
          icon={IndianRupee}
          color="green"
        />

        <MetricsCard
          title="नया ऑर्डर (Pending)"
          value={counts['PLACED'] || 0}
          subtitle="स्वीकृति की प्रतीक्षा"
          icon={Clock}
          color="orange"
          onClick={onGoToOrders}
        />

        <MetricsCard
          title="पैक हो रहा है (Packing)"
          value={counts['PREPARING'] || 0}
          subtitle="सामान तैयारी में"
          icon={ShoppingBag}
          color="blue"
          onClick={onGoToOrders}
        />

        <MetricsCard
          title="डिलीवरी पर (In-Transit)"
          value={(counts['SHIPPED'] || 0) + (counts['OUT_FOR_DELIVERY'] || 0)}
          subtitle="गाँव के रास्ते में"
          icon={Truck}
          color="yellow"
          onClick={onGoToOrders}
        />

        <MetricsCard
          title="डिलीवर हुआ (Delivered)"
          value={counts['DELIVERED'] || 0}
          subtitle="सफलतापूर्वक पूरा"
          icon={CheckCircle}
          color="green"
          onClick={onGoToOrders}
        />

        <MetricsCard
          title="कम स्टॉक (Low Stock)"
          value={lowStock.length}
          subtitle="जल्द मंगाएं"
          icon={AlertTriangle}
          color="red"
          onClick={onGoToProducts}
        />
      </div>

      {/* Low Stock Warning Alert Banner if any items are low */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>कम स्टॉक चेतावनी (Low Stock Alert - {lowStock.length} सामान खत्म होने वाले हैं)</span>
            </div>
            <button
              onClick={onGoToProducts}
              className="text-xs font-bold text-red-700 hover:underline flex items-center space-x-1"
            >
              <span>स्टॉक अपडेट करें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStock.slice(0, 6).map((item: any) => (
              <div
                key={item._id}
                className="bg-white p-3 rounded-xl border border-red-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                    {item.name?.hi || item.name?.en}
                  </p>
                  <p className="text-[11px] text-slate-500">{item.unit}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    केवल {item.stockQuantity} शेष
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">हालिया ऑर्डर (Recent Orders)</h3>
            <p className="text-xs text-slate-500 mt-0.5">गाँव से आए ताज़ा ऑर्डर</p>
          </div>

          <button
            onClick={onGoToOrders}
            className="flex items-center space-x-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            <span>सभी ऑर्डर देखें (View All)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">ऑर्डर नंबर</th>
                <th className="p-4">ग्राहक व गाँव</th>
                <th className="p-4">फोन नंबर</th>
                <th className="p-4">आइटम</th>
                <th className="p-4">कुल राशि (COD)</th>
                <th className="p-4">स्थिति (Status)</th>
                <th className="p-4 text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    कोई ऑर्डर नहीं मिला
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-black text-slate-900">{ord.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{ord.deliveryAddress?.fullName}</p>
                      <p className="text-[11px] text-slate-500">गाँव: {ord.deliveryAddress?.village}</p>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {ord.deliveryAddress?.phoneNumber}
                    </td>
                    <td className="p-4 font-bold text-slate-700">{ord.items?.length || 0} items</td>
                    <td className="p-4 font-black text-emerald-700">₹{ord.totalAmount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-800">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectOrder(ord)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-lg text-xs font-bold text-slate-700 transition"
                      >
                        विवरण देखें
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
