import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Calendar } from 'lucide-react';
import { downloadExcelReport } from '../api/adminApi';

interface ExcelExportModalProps {
  onClose: () => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDownloading(true);
      await downloadExcelReport({
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      onClose();
    } catch (e) {
      alert('Failed to generate Excel export');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black">Excel रिपोर्ट डाउनलोड करें</h2>
              <p className="text-xs text-emerald-100 mt-0.5">Orders Summary & Line Items (.xlsx)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDownload} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ऑर्डर स्थिति फ़िल्टर (Order Status)
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">सभी ऑर्डर (All Orders)</option>
              <option value="PLACED">नया ऑर्डर (Placed)</option>
              <option value="CONFIRMED">स्वीकार किया गया (Confirmed)</option>
              <option value="PREPARING">पैक हो रहा है (Preparing)</option>
              <option value="SHIPPED">गाँव के लिए रवाना (Shipped)</option>
              <option value="OUT_FOR_DELIVERY">डिलीवरी पर निकला (Out for delivery)</option>
              <option value="DELIVERED">सफलतापूर्वक डिलीवर हुआ (Delivered)</option>
              <option value="CANCELLED">रद्द (Cancelled)</option>
              <option value="REJECTED">अस्वीकार (Rejected)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                दिनांक से (From Date)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                दिनांक तक (To Date)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            💡 <strong>सुविधा:</strong> इस स्प्रेडशीट में ग्राहक का पूरा गाँव का पता, लैंडमार्क, मोबाइल, सामान की मात्रा, COD वसूली स्थिति और फॉर्मूला इंजेक्शन सुरक्षा शामिल है।
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              रद्द करें
            </button>

            <button
              type="submit"
              disabled={downloading}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'डाउनलोड हो रहा है...' : 'Excel शीट डाउनलोड करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
