import React from 'react';
import { Shield, Users, UserCheck, ShoppingBag, PenTool, IndianRupee, Settings, BarChart3, AlertCircle } from 'lucide-react';

export default function AdminDashboardPlaceholder() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card border border-indigo-500/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase mb-2">
            Phase 1 UI Shell Preview
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage students, Xerox staff, orders, stationery catalog, print pricing, and daily deadline rules.
          </p>
        </div>
      </div>

      {/* Admin stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">1,240</p>
          <p className="text-[11px] text-emerald-400 mt-1">Across 8 Departments</p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Xerox Staff Members</span>
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">4</p>
          <p className="text-[11px] text-slate-400 mt-1">Central Xerox Counter</p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Order Window</span>
            <Settings className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-white mt-2">06:00 AM - 08:30 PM</p>
          <p className="text-[11px] text-emerald-400 mt-1">Ordering Active</p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Stationery Catalog</span>
            <PenTool className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">12 Items</p>
          <p className="text-[11px] text-slate-400 mt-1">All in stock</p>
        </div>
      </div>

      {/* Shell Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Phase 1 Foundation & UI Shell Active:</strong>
          <p className="mt-1 leading-relaxed">
            Full admin CRUD operations (manage students, staff accounts, price per page, stationery inventory, and revenue reports) will be implemented in Phase 14.
          </p>
        </div>
      </div>
    </div>
  );
}
