import React, { useState, useEffect } from 'react';
import { 
  PenTool, Plus, Edit2, CheckCircle2, AlertCircle, 
  Trash2, RefreshCw, X, Loader2, Package, IndianRupee 
} from 'lucide-react';
import { 
  getAdminStationery, createAdminStationery, 
  updateAdminStationery, toggleAdminStationeryStatus 
} from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminStationery() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  });
  const { showToast } = useToast();

  const fetchStationery = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminStationery();
      setItems(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load stationery inventory.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStationery();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({ name: '', description: '', price: '', stock: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      stock: item.stock
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateAdminStationery(editingItem.id, form);
        showToast('Stationery item updated.', 'success');
      } else {
        await createAdminStationery(form);
        showToast('New stationery item created.', 'success');
      }
      setIsModalOpen(false);
      fetchStationery();
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await toggleAdminStationeryStatus(item.id);
      showToast(res.message || 'Item status toggled.', 'success');
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_active: res.is_active } : it))
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleStockAdjust = async (item, delta) => {
    const newStock = Math.max(0, parseInt(item.stock) + delta);
    try {
      await updateAdminStationery(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        stock: newStock
      });
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, stock: newStock } : it))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update stock.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stationery Catalog & Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage stationery products, prices, stock levels, and active status for college orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stationery Item
          </button>
          <button
            onClick={fetchStationery}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Items */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          Loading stationery inventory...
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                !item.is_active
                  ? 'border-slate-200 opacity-60'
                  : item.stock < 20
                  ? 'border-rose-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{item.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    item.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {item.description || 'No description provided.'}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Price</span>
                    <p className="text-base font-black text-slate-900 font-mono">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Units Sold</span>
                    <p className="text-xs font-bold text-purple-700">
                      {item.total_sold || 0} pcs
                    </p>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Inventory Stock:</span>
                    <span className={`font-bold font-mono ${item.stock < 20 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {item.stock} in stock {item.stock < 20 && '(Low)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleStockAdjust(item, -10)}
                      disabled={item.stock <= 0}
                      className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 disabled:opacity-30 cursor-pointer transition"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleStockAdjust(item, -1)}
                      disabled={item.stock <= 0}
                      className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 disabled:opacity-30 cursor-pointer transition"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleStockAdjust(item, +1)}
                      className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleStockAdjust(item, +10)}
                      className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(item)}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                    item.is_active
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-xs">
          <Package className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          No stationery items in catalog.
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                {editingItem ? 'Edit Stationery Item' : 'Add New Stationery Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A4 Copier Paper (Pack of 10)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="e.g. 75 GSM bright white paper sheets"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    placeholder="15.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="100"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
