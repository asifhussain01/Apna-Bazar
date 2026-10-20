import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter } from 'lucide-react';
import { adminApi } from '../api/adminApi';

interface OrdersPageProps {
  onSelectOrder: (order: any) => void;
  onOpenExportModal: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onSelectOrder, onOpenExportModal }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const queryParts: string[] = [`page=${page}`, 'limit=15'];
      if (search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);
      if (status !== 'ALL') queryParts.push(`status=${status}`);
      if (paymentStatus !== 'ALL') queryParts.push(`paymentStatus=${paymentStatus}`);

      const res = await adminApi(`/admin/orders?${queryParts.join('&')}`);
      if (res.success && res.data) {
        setOrders(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalOrders(res.pagination?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, status, paymentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'PLACED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            ऑर्डर प्रबंधन (Orders Management)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            कुल {totalOrders} ऑर्डर दर्ज हैं • गाँव में डिलीवरी की स्थिति और विवरण
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="self-start px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          Excel शीट डाउनलोड करें
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="ऑर्डर नंबर, ग्राहक का नाम, मोबाइल नंबर या गाँव खोजें..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-24 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 bg-slate-50"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition"
          >
            खोजें
          </button>
        </form>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">सभी स्थितियां (All Status)</option>
            <option value="PLACED">नया ऑर्डर (Placed)</option>
            <option value="CONFIRMED">स्वीकार किया गया (Confirmed)</option>
            <option value="PREPARING">पैक हो रहा है (Preparing)</option>
            <option value="SHIPPED">गाँव के लिए रवाना (Shipped)</option>
            <option value="OUT_FOR_DELIVERY">डिलीवरी पर (Out for delivery)</option>
            <option value="DELIVERED">डिलीवर हुआ (Delivered)</option>
            <option value="CANCELLED">रद्द (Cancelled)</option>
            <option value="REJECTED">अस्वीकार (Rejected)</option>
          </select>

          {/* Payment filter */}
          <select
            value={paymentStatus}
            onChange={e => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">सभी भुगतान (All COD)</option>
            <option value="PENDING">नकद बाकी (Pending)</option>
            <option value="COLLECTED">नकद प्राप्त (Collected)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">ऑर्डर नंबर</th>
                <th className="p-4">दिनांक व समय</th>
                <th className="p-4">ग्राहक का नाम</th>
                <th className="p-4">फोन नंबर</th>
                <th className="p-4">गाँव व लैंडमार्क</th>
                <th className="p-4">राशि (Total ₹)</th>
                <th className="p-4">नकद स्थिति (COD)</th>
                <th className="p-4">ऑर्डर स्थिति</th>
                <th className="p-4 text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    ऑर्डर लोड हो रहे हैं...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    कोई ऑर्डर नहीं मिला
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-black text-slate-900">{order.orderNumber}</td>
                    <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {order.deliveryAddress?.fullName}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {order.deliveryAddress?.phoneNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">
                        गाँव: {order.deliveryAddress?.village}
                      </p>
                      <p className="text-[11px] text-orange-700 truncate max-w-[160px]">
                        {order.deliveryAddress?.landmark}
                      </p>
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-sm">
                      ₹{order.totalAmount}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          order.paymentStatus === 'COLLECTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                      {order.shopkeeperName ? (
                        <p className="text-[10px] text-emerald-700 font-bold mt-1">
                          🏪 {order.shopkeeperName}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="p-2 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-lg text-slate-700 transition"
                        title="विवरण देखें"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-40"
              >
                पिछला (Prev)
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-40"
              >
                अगला (Next)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
