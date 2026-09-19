import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, FileText, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function StudentDashboardPlaceholder() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass-card border border-blue-500/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase mb-2">
            Phase 1 UI Shell Preview
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Order lab manuals, CN/DSA project reports, and stationery with automatic daily deadline checks.
          </p>
        </div>
        <Link
          to="/student/new-order"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Print Order
        </Link>
      </div>

      {/* Order Window Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Today's Batch Order Window</h2>
              <p className="text-xs text-slate-400">Open: 06:00 AM &bull; Closes: 08:30 PM Server Time</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
            Orders Open for Today's Batch
          </span>
        </div>
      </div>

      {/* Metric Cards Mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-slate-400">Active Orders</p>
          <p className="text-2xl font-bold text-white mt-1">1</p>
          <div className="mt-2">
            <StatusBadge status="PRINTING" />
          </div>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-slate-400">Ready for Pickup</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">0</p>
          <p className="text-[11px] text-slate-500 mt-1">Collect with Order ID</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-slate-400">Total Completed</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">8</p>
          <p className="text-[11px] text-slate-500 mt-1"></p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-slate-400">Current Batch</p>
          <p className="text-lg font-bold text-blue-400 mt-1">Today's Batch</p>
          <p className="text-[11px] text-slate-500 mt-1">30 August 2026</p>
        </div>
      </div>

      {/* Shell Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Phase 1 Foundation & UI Shell Active:</strong>
          <p className="mt-1 leading-relaxed">
            Full dynamic student dashboard data, multi-PDF upload flow, stationery selection, price breakdown, and order submission will be implemented sequentially in Phases 4, 5, 6, and 7.
          </p>
        </div>
      </div>
    </div>
  );
}
