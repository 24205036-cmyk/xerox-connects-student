import React, { useState, useEffect } from 'react';
import { 
  Settings, Clock, Power, QrCode, Save, 
  RefreshCw, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    order_open_time: '06:00',
    order_close_time: '20:30',
    ordering_enabled: 'true',
    upi_id: 'xeroxpress@okaxis',
    upi_merchant_name: 'Campus Central Xerox Counter'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminSettings();
      if (res.data?.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to load system settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateAdminSettings(settings);
      showToast('System configuration & daily deadline settings saved!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Batch Rules</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure campus operating hours, batch scheduling deadlines, and UPI payment recipient metadata.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} /> Reload
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Ordering Master Switch */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                settings.ordering_enabled === 'true'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Platform Ordering Master Switch</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instantly enable or suspend student order submissions across the entire campus.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleChange('ordering_enabled', settings.ordering_enabled === 'true' ? 'false' : 'true')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer ${
                settings.ordering_enabled === 'true'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {settings.ordering_enabled === 'true' ? 'Ordering ENABLED' : 'Ordering SUSPENDED'}
            </button>
          </div>
        </div>

        {/* Section 2: Daily Order Window Deadlines */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Daily Batch Cutoff Hours (Server Time)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Orders placed between Opening and Closing belong to today's batch. After Closing, orders shift to tomorrow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Order Window Opens (Daily)
              </label>
              <input
                type="time"
                required
                value={settings.order_open_time}
                onChange={(e) => handleChange('order_open_time', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 06:00 AM</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Order Window Closes (Evening Cutoff)
              </label>
              <input
                type="time"
                required
                value={settings.order_close_time}
                onChange={(e) => handleChange('order_close_time', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Default: 08:30 PM (20:30)</span>
            </div>
          </div>
        </div>

        {/* Section 3: UPI / Payment Details */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">GPay / UPI Payment Metadata</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shown to students on checkout for manual UPI scanning and reference recording.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">UPI VPA / ID</label>
              <input
                type="text"
                required
                placeholder="e.g. xeroxpress@okaxis"
                value={settings.upi_id}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Display Merchant Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Campus Central Xerox Counter"
                value={settings.upi_merchant_name}
                onChange={(e) => handleChange('upi_merchant_name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Configuration Settings
          </button>
        </div>
      </form>
    </div>
  );
}
