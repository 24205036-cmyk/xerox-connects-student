import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, Printer, Save, RefreshCw, 
  Calculator, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import { getAdminPricing, updateAdminPricing } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminPricing() {
  const [pricing, setPricing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pricesState, setPricesState] = useState({});
  const { showToast } = useToast();

  // Price simulator state
  const [simPages, setSimPages] = useState(10);
  const [simCopies, setSimCopies] = useState(1);
  const [simType, setSimType] = useState('BLACK_WHITE');
  const [simSide, setSimSide] = useState('SINGLE_SIDE');

  const fetchPricing = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminPricing();
      setPricing(res.data || []);
      const stateObj = {};
      (res.data || []).forEach((p) => {
        stateObj[`${p.print_type}_${p.side_type}`] = p.price_per_page;
      });
      setPricesState(stateObj);
    } catch (err) {
      showToast(err.message || 'Failed to load pricing table.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handlePriceChange = (key, value) => {
    setPricesState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = Object.entries(pricesState).map(([key, price_per_page]) => {
        const [print_type, side_type] = key.split('_');
        return {
          print_type,
          side_type: key.replace(`${print_type}_`, ''),
          price_per_page: parseFloat(price_per_page)
        };
      });

      await updateAdminPricing(payload);
      showToast('Print rates updated successfully in database!', 'success');
      fetchPricing();
    } catch (err) {
      showToast(err.message || 'Failed to update pricing.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate estimated sim cost
  const simRate = parseFloat(pricesState[`${simType}_${simSide}`] || 1.5);
  const simEstimatedCost = (simPages * simRate * simCopies).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Print Pricing Matrix</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set and manage the base per-page rates for B&W and Color printing. Changes reflect instantly on student checkouts.
          </p>
        </div>
        <button
          onClick={fetchPricing}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pricing Rate Editor */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Active Print Price Rates</h2>
                <p className="text-xs text-slate-500">All rates specified in Indian Rupees (₹) per page</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                MySQL Synchronized
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading print pricing rates...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. B&W Single Side */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-black text-xs">
                        B&W
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">Black & White</h3>
                        <p className="text-[11px] text-slate-500">Single Side</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Rate per page (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0.10"
                        required
                        value={pricesState['BLACK_WHITE_SINGLE_SIDE'] || ''}
                        onChange={(e) => handlePriceChange('BLACK_WHITE_SINGLE_SIDE', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. B&W Double Sided */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-black text-xs">
                        B&W
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">Black & White</h3>
                        <p className="text-[11px] text-slate-500">Front & Back (Double)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Rate per page (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0.10"
                        required
                        value={pricesState['BLACK_WHITE_DOUBLE_SIDE'] || ''}
                        onChange={(e) => handlePriceChange('BLACK_WHITE_DOUBLE_SIDE', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Color Single Side */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                        CLR
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">Full Color</h3>
                        <p className="text-[11px] text-slate-500">Single Side</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Rate per page (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0.10"
                        required
                        value={pricesState['COLOR_SINGLE_SIDE'] || ''}
                        onChange={(e) => handlePriceChange('COLOR_SINGLE_SIDE', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Color Double Sided */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                        CLR
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">Full Color</h3>
                        <p className="text-[11px] text-slate-500">Front & Back (Double)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Rate per page (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₹</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0.10"
                        required
                        value={pricesState['COLOR_DOUBLE_SIDE'] || ''}
                        onChange={(e) => handlePriceChange('COLOR_DOUBLE_SIDE', e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Updated Print Rates
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Interactive Price Simulator */}
        <div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Live Rate Simulator</h3>
            </div>
            <p className="text-xs text-slate-500">
              Test how new per-page rates will calculate for student orders.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Number of Pages</label>
                <input
                  type="number"
                  min="1"
                  value={simPages}
                  onChange={(e) => setSimPages(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold shadow-2xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Number of Copies</label>
                <input
                  type="number"
                  min="1"
                  value={simCopies}
                  onChange={(e) => setSimCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold shadow-2xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Color Mode</label>
                  <select
                    value={simType}
                    onChange={(e) => setSimType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold shadow-2xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="BLACK_WHITE">Black & White</option>
                    <option value="COLOR">Color</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Side Mode</label>
                  <select
                    value={simSide}
                    onChange={(e) => setSimSide(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold shadow-2xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="SINGLE_SIDE">Single Side</option>
                    <option value="DOUBLE_SIDE">Front & Back</option>
                  </select>
                </div>
              </div>

              {/* Result Preview */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Estimated Student Cost</span>
                <p className="text-3xl font-black text-indigo-950 font-mono">
                  ₹{simEstimatedCost}
                </p>
                <p className="text-[10.5px] text-indigo-700 font-mono">
                  {simPages} pages &times; ₹{simRate.toFixed(2)} &times; {simCopies} copy(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
