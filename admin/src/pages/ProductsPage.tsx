import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { ProductModal } from '../components/ProductModal';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const queryParts: string[] = ['limit=50'];
      if (search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);
      if (selectedCategory) queryParts.push(`category=${selectedCategory}`);

      const [prodRes, catRes] = await Promise.all([
        adminApi(`/products?${queryParts.join('&')}`),
        adminApi('/categories')
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`क्या आप "${name}" को निष्क्रिय करना चाहते हैं?`)) {
      await adminApi(`/admin/products/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  const handleEdit = (prod: any) => {
    setSelectedProduct(prod);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            सामान सूची एवं स्टॉक (Inventory Management)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            दुकान के सभी उत्पाद, कीमतें, स्टॉक और कम स्टॉक चेतावनी
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>नया सामान जोड़ें (Add Product)</span>
        </button>
      </div>

      {/* Search and Category filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="उत्पाद का नाम, कोड (SKU) खोजें..."
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

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-orange-500 w-full sm:w-auto"
        >
          <option value="">सभी श्रेणियां (All Categories)</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>
              {c.name?.hi || c.name?.en}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">फोटो</th>
                <th className="p-4">सामान का नाम (Bilingual)</th>
                <th className="p-4">SKU कोड</th>
                <th className="p-4">श्रेणी (Category)</th>
                <th className="p-4">MRP (मूल्य)</th>
                <th className="p-4">बिक्री मूल्य (Sale)</th>
                <th className="p-4">स्टॉक (Stock)</th>
                <th className="p-4 text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    लोड हो रहा है...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    कोई सामान नहीं मिला
                  </td>
                </tr>
              ) : (
                products.map(p => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4">
                        <img
                          src={
                            p.images?.[0] ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={p.name?.en}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-extrabold text-slate-900 text-sm">{p.name?.hi}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {p.name?.en} • <span className="font-bold text-slate-700">{p.unit}</span>
                        </p>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{p.sku}</td>
                      <td className="p-4 text-slate-600 font-medium">
                        {p.category?.name?.hi || p.category?.name?.en || 'General'}
                      </td>
                      <td className="p-4 text-slate-400 line-through">₹{p.price}</td>
                      <td className="p-4 font-black text-emerald-700 text-sm">₹{p.salePrice}</td>
                      <td className="p-4">
                        {isOut ? (
                          <span className="px-2 py-1 rounded-md text-[10px] font-black bg-red-100 text-red-700">
                            खत्म (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 flex items-center space-x-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>कम ({p.stockQuantity})</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                            उपलब्ध ({p.stockQuantity})
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-slate-600 transition"
                            title="एडिट करें"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name?.hi || p.name?.en)}
                            className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-600 transition"
                            title="हटाएँ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
