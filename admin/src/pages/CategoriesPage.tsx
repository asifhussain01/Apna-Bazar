import React, { useState, useEffect } from 'react';
import { Plus, X, Layers, Save } from 'lucide-react';
import { adminApi } from '../api/adminApi';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [slug, setSlug] = useState('');
  const [iconName, setIconName] = useState('basket');
  const [displayOrder, setDisplayOrder] = useState('1');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi('/categories');
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: { en: nameEn, hi: nameHi },
          slug: slug.toLowerCase().trim() || nameEn.toLowerCase().replace(/\s+/g, '-'),
          iconName,
          displayOrder: parseInt(displayOrder, 10),
          isActive: true
        })
      });

      if (res.success) {
        setShowModal(false);
        setNameEn('');
        setNameHi('');
        setSlug('');
        loadCategories();
      } else {
        alert(res.message || 'Failed to create category');
      }
    } catch (e) {
      alert('Error creating category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            सामान श्रेणियां (Product Categories)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            मोबाइल ऐप पर दिखने वाले मुख्य वर्ग और उनका क्रम
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>नई श्रेणी जोड़ें (Add Category)</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            श्रेणियां लोड हो रही हैं...
          </div>
        ) : (
          categories.map(cat => (
            <div
              key={cat._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{cat.name?.hi}</h4>
                  <p className="text-xs text-slate-500 font-medium">{cat.name?.en}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">slug: {cat.slug}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">
                  क्रम: {cat.displayOrder ?? 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-black text-slate-900">नई श्रेणी जोड़ें</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  placeholder="e.g. Spices & Masala"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  श्रेणी का नाम (हिन्दी में) *
                </label>
                <input
                  type="text"
                  required
                  value={nameHi}
                  onChange={e => setNameHi(e.target.value)}
                  placeholder="जैसे: मसाले और नमक"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. spices-masala"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">प्रदर्शन क्रम (Order)</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(e.target.value)}
                  placeholder="1"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border rounded-xl font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>सुरक्षित करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
