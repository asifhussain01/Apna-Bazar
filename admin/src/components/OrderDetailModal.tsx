import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Package,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { adminApi } from '../api/adminApi';

interface OrderDetailModalProps {
  order: any;
  currentAdmin?: any;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  currentAdmin,
  onClose,
  onOrderUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [adminNote, setAdminNote] = useState(order.adminNotes || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Status transitions
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const res = await adminApi(`/admin/orders/${order._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined,
          shopkeeperName: currentAdmin?.fullName,
          shopkeeperPhone: currentAdmin?.phoneNumber
        })
      });

      if (res.success) {
        onOrderUpdated();
        onClose();
      } else {
        alert(res.message || 'Status update failed');
      }
    } catch (e) {
      alert('Error updating order');
    } finally {
      setLoading(false);
    }
  };

  // Toggle COD payment collected
  const handleTogglePayment = async () => {
    try {
      setLoading(true);
      const newPayment = order.paymentStatus === 'COLLECTED' ? 'PENDING' : 'COLLECTED';
      const res = await adminApi(`/admin/orders/${order._id}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus: newPayment })
      });

      if (res.success) {
        onOrderUpdated();
        onClose();
      }
    } catch (e) {
      alert('Error updating payment status');
    } finally {
      setLoading(false);
    }
  };

  // Save internal notes
  const handleSaveNotes = async () => {
    try {
      setLoading(true);
      await adminApi(`/admin/orders/${order._id}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ adminNotes: adminNote })
      });
      alert('नोट सुरक्षित किया गया (Admin note saved)');
      onOrderUpdated();
    } catch (e) {
      alert('Error saving note');
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = order.orderStatus;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-black text-slate-900">
                Order #{order.orderNumber}
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {order.orderStatus}
              </span>
              {order.shopkeeperName && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  दुकानदार: {order.shopkeeperName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              दिनांक: {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Quick Action Buttons based on state machine */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              अगला कदम (Next Action):
            </p>

            <div className="flex flex-wrap gap-2">
              {currentStatus === 'PLACED' && (
                <>
                  <button
                    disabled={loading}
                    onClick={() => handleUpdateStatus('CONFIRMED')}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ऑर्डर स्वीकार करें (Confirm)</span>
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => setShowRejectInput(!showRejectInput)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>अस्वीकार करें (Reject)</span>
                  </button>
                </>
              )}

              {currentStatus === 'CONFIRMED' && (
                <button
                  disabled={loading}
                  onClick={() => handleUpdateStatus('PREPARING')}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Package className="w-4 h-4" />
                  <span>सामान पैक करें (Mark Preparing)</span>
                </button>
              )}

              {currentStatus === 'PREPARING' && (
                <button
                  disabled={loading}
                  onClick={() => handleUpdateStatus('SHIPPED')}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  <span>गाँव के लिए रवाना (Dispatch / Ship)</span>
                </button>
              )}

              {currentStatus === 'SHIPPED' && (
                <>
                  <button
                    disabled={loading}
                    onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Truck className="w-4 h-4" />
                    <span>गाँव में डिलीवरी बॉय (Out for Delivery)</span>
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>डिलीवर हुआ (Mark Delivered)</span>
                  </button>
                </>
              )}

              {currentStatus === 'OUT_FOR_DELIVERY' && (
                <button
                  disabled={loading}
                  onClick={() => handleUpdateStatus('DELIVERED')}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>सफलतापूर्वक डिलीवर हुआ (Delivered)</span>
                </button>
              )}

              {['DELIVERED', 'CANCELLED', 'REJECTED'].includes(currentStatus) && (
                <span className="text-xs font-bold text-slate-500 py-1">
                  यह ऑर्डर पूर्ण हो चुका है (Completed/Closed)
                </span>
              )}
            </div>

            {showRejectInput && (
              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="अस्वीकार करने का कारण लिखें..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg"
                >
                  पुष्टि करें (Confirm Reject)
                </button>
              </div>
            )}
          </div>

          {/* Customer & Village Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>गाँव का डिलीवरी पता</span>
              </div>
              <p className="font-extrabold text-slate-800 text-base">
                {order.deliveryAddress.fullName}
              </p>
              <div className="flex items-center space-x-1 text-xs text-slate-600 mt-1">
                <Phone className="w-3.5 h-3.5" />
                <a
                  href={`tel:${order.deliveryAddress.phoneNumber}`}
                  className="text-orange-600 font-bold hover:underline"
                >
                  {order.deliveryAddress.phoneNumber}
                </a>
                {order.deliveryAddress.alternatePhone && (
                  <span> / {order.deliveryAddress.alternatePhone}</span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-2 font-medium">
                गाँव: <span className="font-bold">{order.deliveryAddress.village}</span>, जिला:{' '}
                {order.deliveryAddress.district} ({order.deliveryAddress.pincode})
              </p>
              <div className="bg-orange-100/60 text-orange-950 px-2.5 py-1.5 rounded-lg text-xs font-semibold mt-2.5 inline-block border border-orange-200">
                पहचान (Landmark): {order.deliveryAddress.landmark}
              </div>
              {order.deliveryAddress.deliveryInstructions && (
                <p className="text-xs text-slate-500 italic mt-2">
                  निर्देश: {order.deliveryAddress.deliveryInstructions}
                </p>
              )}
            </div>

            {/* Payment & COD status */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-slate-900 font-bold text-sm mb-2">भुगतान व बिल (Payment)</p>
              <div className="flex items-baseline justify-between py-1 border-b border-slate-200 text-xs">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-900">₹{order.subtotal}</span>
              </div>
              <div className="flex items-baseline justify-between py-1 border-b border-slate-200 text-xs">
                <span className="text-slate-500">Delivery Fee:</span>
                <span className="font-bold text-slate-900">₹{order.deliveryCharge}</span>
              </div>
              <div className="flex items-baseline justify-between py-1.5 border-b border-slate-200 text-sm">
                <span className="font-extrabold text-slate-900">Total Payable:</span>
                <span className="font-black text-emerald-700 text-lg">₹{order.totalAmount}</span>
              </div>

              {/* COD collection toggle */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">नकद वसूली (COD Status):</span>
                <button
                  disabled={loading}
                  onClick={handleTogglePayment}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition ${
                    order.paymentStatus === 'COLLECTED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {order.paymentStatus === 'COLLECTED'
                    ? '✓ नकद प्राप्त (Collected)'
                    : 'नकद बाकी (Pending Collect)'}
                </button>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              सामान की सूची ({order.items.length} items):
            </p>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3">सामान (Item)</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">मूल्य (Price)</th>
                    <th className="p-3 text-right">कुल (Total)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{it.name?.hi || it.name?.en}</p>
                        <p className="text-[11px] text-slate-500">{it.name?.en}</p>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{it.unit}</td>
                      <td className="p-3 font-bold text-slate-900">{it.quantity}</td>
                      <td className="p-3 text-slate-600">₹{it.unitPrice}</td>
                      <td className="p-3 text-right font-black text-slate-900">₹{it.itemTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              ऑर्डर का इतिहास (Status Timeline):
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              {order.statusHistory?.map((entry: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 text-xs">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">{entry.status}</span> —{' '}
                    <span className="text-slate-600">{entry.note}</span>
                    <span className="text-slate-400 ml-2">
                      ({new Date(entry.timestamp).toLocaleTimeString()})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Admin Note */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>आंतरिक दुकान नोट (Internal Note):</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="जैसे: डिलीवरी लड़के राजू को सौंपा गया..."
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2"
              />
              <button
                onClick={handleSaveNotes}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                सेव करें
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
