import React, { useState, useEffect } from 'react';
import { 
  BarChart3, IndianRupee, Printer, PenTool, 
  TrendingUp, Users, RefreshCw, Calendar, Layers 
} from 'lucide-react';
import { getAdminReports } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminReports();
      setReports(res.data || {});
    } catch (err) {
      showToast(err.message || 'Failed to load reports.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-600 text-xs font-bold">Compiling business analytics and reports...</p>
      </div>
    );
  }

  const { overall, byStatus, printTypes, popularStationery, byDept, monthlyTrends } = reports || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Insights on printing revenue, document volume, department orders, and stationery product popularity.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} /> Refresh Analytics
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
          <p className="text-3xl font-black text-emerald-600 font-mono mt-1">
            ₹{parseFloat(overall?.total_revenue || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across all completed batches</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Printing Service Revenue</span>
          <p className="text-3xl font-black text-indigo-600 font-mono mt-1">
            ₹{parseFloat(overall?.printing_revenue || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">B&W & Color PDF printouts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stationery Store Revenue</span>
          <p className="text-3xl font-black text-purple-600 font-mono mt-1">
            ₹{parseFloat(overall?.stationery_revenue || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Records, files & accessories</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Order Value</span>
          <p className="text-3xl font-black text-amber-600 font-mono mt-1">
            ₹{parseFloat(overall?.avg_order_value || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">From {overall?.total_orders || 0} orders</p>
        </div>
      </div>

      {/* Grid: Print Volume + Stationery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Print Type Usage Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Printing Format Distribution</h3>
          </div>

          <div className="space-y-3">
            {printTypes && printTypes.length > 0 ? (
              printTypes.map((pt, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-xs">
                      {pt.print_type === 'COLOR' ? 'Full Color' : 'Black & White'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {pt.side_type === 'DOUBLE_SIDE' ? 'Front & Back (Double Sided)' : 'Single Sided'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-700">{pt.total_copies || 0} copies</span>
                    <p className="text-[10px] text-slate-400">{pt.total_files} PDF document(s)</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No printing data recorded yet.</div>
            )}
          </div>
        </div>

        {/* Popular Stationery Leaderboard */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <PenTool className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Selling Stationery</h3>
          </div>

          <div className="space-y-3">
            {popularStationery && popularStationery.length > 0 ? (
              popularStationery.map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black font-mono text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{st.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700">₹{parseFloat(st.total_sales || 0).toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400">{st.units_sold} units sold</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No stationery sales yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Orders by Department */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Department Activity & Usage</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {byDept && byDept.length > 0 ? (
            byDept.map((dept, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-800">{dept.department || 'General'}</span>
                <p className="text-lg font-black text-indigo-700 font-mono">{dept.order_count} orders</p>
                <p className="text-[11px] text-slate-500 font-mono">₹{parseFloat(dept.total_revenue || 0).toFixed(2)}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No department records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
