import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { adminApi } from '../api/adminApi';

interface ProductModalProps {
  product?: any;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  onClose,
  onSuccess
}) => {
  const isEditing = !!product;

  const [nameEn, setNameEn] = useState(product?.name?.en || '');
  const [nameHi, setNameHi] = useState(product?.name?.hi || '');
  const [descEn, setDescEn] = useState(product?.description?.en || '');
  const [descHi, setDescHi] = useState(product?.description?.hi || '');
  const [category, setCategory] = useState(product?.category?._id || product?.category || categories[0]?._id || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [salePrice, setSalePrice] = useState(product?.salePrice?.toString() || '');
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity?.toString() || '20');
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold?.toString() || '5');
  const [unit, setUnit] = useState(product?.unit || '1 kg');
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] || '');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn || !nameHi || !sku || !price || !salePrice) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: { en: nameEn, hi: nameHi },
        description: { en: descEn, hi: descHi },
        category,
        sku: sku.toUpperCase().trim(),
        price: parseFloat(price),
        salePrice: parseFloat(salePrice),
        stockQuantity: parseInt(stockQuantity, 10),
        lowStockThreshold: parseInt(lowStockThreshold, 10),
        unit,
        images: imageUrl ? [imageUrl] : [],
        isFeatured,
        isAvailable: true
      };

      const endpoint = isEditing ? `/admin/products/${product._id}` : '/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await adminApi(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message || 'Error saving product');
      }
    } catch (err) {
      alert('Network error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-lg font-black text-slate-900">
            {isEditing ? 'सामान संपादित करें (Edit Product)' : 'नया सामान जोड़ें (Add Product)'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="e.g. Aashirvaad Chakki Atta"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                सामान का नाम (हिन्दी में) *
              </label>
              <input
                type="text"
                required
                value={nameHi}
                onChange={e => setNameHi(e.target.value)}
                placeholder="जैसे: आशीर्वाद चक्की आटा"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category (श्रेणी) *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:border-orange-500 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name?.hi || c.name?.en} ({c.name?.en})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU / कोड *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. AT-AASH-5KG"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                MRP (मूल्य ₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="260"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                बिक्री मूल्य (Sale ₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                placeholder="235"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Pack</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. 5 kg / 1 Litre"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                कुल स्टॉक संख्या (Stock Quantity)
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                placeholder="50"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                कम स्टॉक चेतावनी सीमा (Low stock alert at)
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(e.target.value)}
                placeholder="5"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              फोटो का लिंक (Image URL)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold text-slate-800">
              आज की विशेष डील में दिखाएं (Show in Today's Deals)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              रद्द करें (Cancel)
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'सुरक्षित हो रहा है...' : 'सुरक्षित करें (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
