import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, Clock, CheckCircle2, PackageCheck, RefreshCw,
  Loader2, AlertCircle, FileText, Package, User,
  ChevronRight, Calendar, IndianRupee, LayoutGrid, List,
  Search, Check, Sparkles, Filter, ChevronDown, Copy, CheckCheck,
  BarChart2, ArrowRight
} from 'lucide-react';
import { getAdminDashboard } from '../../services/api';
// XeroXpress Admin Management Console - Verified Clean
import StatusBadge from '../../components/StatusBadge';

const STATUS_FILTERS = [
  { value: '', label: 'All Orders', dotColor: 'bg-slate-400' },
  { value: 'PENDING', label: 'Pending', dotColor: 'bg-rose-500' },
  { value: 'ACCEPTED', label: 'Accepted', dotColor: 'bg-blue-500' },
  { value: 'PRINTING', label: 'Printing', dotColor: 'bg-purple-500' },
  { value: 'READY', label: 'Ready', dotColor: 'bg-emerald-500' },
  { value: 'COLLECTED', label: 'Collected', dotColor: 'bg-teal-500' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [copiedId, setCopiedId] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboard();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin overview.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const copyOrderNumber = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { metrics, orderWindow, statusBreakdown, dailyTrends, recentOrders = [] } = data || {};

  // Status counts
  const countsMap = useMemo(() => {
    const map = {
      PENDING: metrics?.pending_orders || 0,
      PRINTING: metrics?.printing_orders || 0,
      READY: metrics?.ready_orders || 0,
      COLLECTED: metrics?.completed_orders || 0,
    };
    if (statusBreakdown && Array.isArray(statusBreakdown)) {
      statusBreakdown.forEach((item) => {
        map[item.status] = Number(item.count);
      });
    }
    return map;
  }, [metrics, statusBreakdown]);

  // Filtered recent orders
  const filteredOrders = useMemo(() => {
    let list = recentOrders;
    if (activeStatus) {
      list = list.filter((o) => o.status === activeStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((o) =>
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.student_name || '').toLowerCase().includes(q) ||
        (o.register_number || '').toLowerCase().includes(q) ||
        (o.department || '').toLowerCase().includes(q) ||
        (o.transaction_reference || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [recentOrders, activeStatus, searchQuery]);

  const totalIntake = metrics?.today_orders || recentOrders.length || 0;
  const pendingCount = countsMap['PENDING'] || 0;
  const inProgressCount = (countsMap['ACCEPTED'] || 0) + (countsMap['PRINTING'] || 0);
  const readyCount = countsMap['READY'] || 0;
  const collectedCount = countsMap['COLLECTED'] || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* ── Breadcrumb Bar (Matching Image 2) ────────────────────── */}
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2.5 py-0.5 rounded-md bg-[#e6f4ea] text-[#137333] border border-[#ceead6] font-extrabold text-[11px] tracking-wider uppercase">
          ADMIN CONSOLE
        </span>
        <span className="text-slate-400 font-semibold">/</span>
        <span className="text-slate-700 font-bold text-xs">
          Xerox Counter Station
        </span>
      </div>

      {/* ── Modern Glassmorphic 3D Hero Banner ──────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-r from-[#eefbf3] via-white to-[#ecfdf5] p-6 sm:p-7 shadow-xs">

        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          {/* Left Column: Context, Badges, Title & Eco-Features */}
          <div className="max-w-xl space-y-3">

            {/* Top Badge Strip */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[10.5px] font-extrabold uppercase tracking-wider border border-emerald-300/60 shadow-2xs">
                <span>🍃</span>
                <span>Smart Eco-Print Hub</span>
              </span>

              <Link
                to="/admin/settings"
                title="Configure daily ordering window"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-[10.5px] font-bold shadow-2xs transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Ordering Window: <strong>OPEN</strong> (06:00 – 20:30)</span>
              </Link>
            </div>

            {/* Main Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                <span className="text-[#16a34a]">Print_Hub</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-bold tracking-wide mt-1">
                Monitor. Manage. Master.
              </p>
            </div>

            {/* Eco & Performance Micro-Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs flex items-center gap-1.5">
                <span className="text-emerald-600">⚡</span> 100% Digital Queue
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs flex items-center gap-1.5">
                <span className="text-emerald-600">🌱</span> Zero Paper Waste Tracking
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs flex items-center gap-1.5">
                <span className="text-emerald-600">💳</span> Instant UPI Reconciliation
              </span>
            </div>

          </div>

          {/* Center-Right: Floating Seamless 3D Xerox Printer with Ambient Glow */}
          <div className="flex items-center justify-center lg:justify-end gap-6 relative">

            {/* Seamless 3D Render (mix-blend-multiply eliminates any box boundary) */}
            <div className="relative group cursor-pointer">
              {/* Floating Ambient Glow */}
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl scale-75 group-hover:scale-95 transition-transform duration-500 pointer-events-none" />

              {/* Floating Top Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-800 shadow-sm whitespace-nowrap z-20 transition-transform group-hover:-translate-y-1">
                ✨ 60 PPM Multi-Tray Laser
              </div>

              {/* 3D Printer Graphic */}
              <div className="w-36 sm:w-44 h-36 sm:h-44 relative z-10 flex items-center justify-center">
                <img
                  src="/images/isolated_3d_printer.jpg"
                  alt="3D Multi-function Campus Xerox Printer"
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Floating Bottom Status Pill */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm whitespace-nowrap z-20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Counter #1 Ready</span>
              </div>
            </div>

            {/* Right: Date & Batch Filter Capsule */}
            <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-2xl p-2 shadow-2xs space-y-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setBatchDate(new Date().toISOString().split('T')[0])}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1 transition"
                  title="Reset to today's batch"
                >
                  <span>Today</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={fetchDashboard}
                  disabled={isLoading}
                  title="Refresh Queue"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>

              <div className="px-2 pt-0.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Batch Cutoff</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  08:30 PM
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Decorative Leaf Accent in Background */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* ── 4 Stat Cards in Pastel Tones (Matching Image 2) ──────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* 1. TOTAL INTAKE (Lavender / Indigo Card) */}
        <div
          onClick={() => setActiveStatus('')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-[#edf2fe] border border-indigo-100/90 shadow-2xs hover:shadow-sm ${activeStatus === '' ? 'ring-2 ring-indigo-500' : ''
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#312e81] flex items-center gap-1">
                TOTAL INTAKE <BarChart2 className="w-3.5 h-3.5 text-indigo-600 ml-0.5" />
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {totalIntake}
            </span>
            <span className="text-[10.5px] font-semibold text-slate-500">
              for {batchDate}
            </span>
          </div>
        </div>

        {/* 2. PENDING (Soft Rose / Pink Card) */}
        <div
          onClick={() => setActiveStatus('PENDING')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-[#fdf2f4] border border-rose-100/90 shadow-2xs hover:shadow-sm ${activeStatus === 'PENDING' ? 'ring-2 ring-rose-500' : ''
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#e11d48] text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#881337]">
                PENDING
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {pendingCount}
            </span>
            <span className="text-[11px] font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-lg">
              Needs Accept
            </span>
          </div>
        </div>

        {/* 3. IN PROGRESS (Soft Purple / Blue Card) */}
        <div
          onClick={() => setActiveStatus('PRINTING')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-[#f4f2ff] border border-purple-100/90 shadow-2xs hover:shadow-sm ${activeStatus === 'PRINTING' ? 'ring-2 ring-purple-500' : ''
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#6366f1] text-white flex items-center justify-center shadow-xs">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#4338ca]">
                IN PROGRESS
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-purple-100/80 text-purple-600 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {inProgressCount}
            </span>
            <span className="text-[11px] font-extrabold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-lg">
              On Machine
            </span>
          </div>
        </div>

        {/* 4. READY (Soft Mint / Emerald Card) */}
        <div
          onClick={() => setActiveStatus('READY')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-[#f0fdf4] border border-emerald-100/90 shadow-2xs hover:shadow-sm ${activeStatus === 'READY' ? 'ring-2 ring-emerald-500' : ''
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#065f46]">
                READY
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {readyCount}
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
              Ready at Desk
            </span>
          </div>
        </div>

      </div>

      {/* ── Filter Pills & Search Bar (Matching Image 2) ──────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {STATUS_FILTERS.map((item) => {
            const count = item.value ? countsMap[item.value] || 0 : totalIntake;
            const isActive = activeStatus === item.value;

            return (
              <button
                key={item.value}
                onClick={() => setActiveStatus(item.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
                  }`}
              >
                {item.value === '' ? (
                  <User className="w-3 h-3 text-slate-300" />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                )}
                <span>{item.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Filter Input */}
        <div className="relative min-w-[240px] md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, reg #, or order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white hover:bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

      </div>

      {/* ── Orders Feed (Matching Image 2 Order Card Format) ──────── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-slate-600">Retrieving campus print orders...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No print orders in queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : 'There are no active orders matching this filter currently.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((ord) => {
            const isPaid = ord.payment_status === 'PAID';
            const isCollected = ord.status === 'COLLECTED';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-md transition duration-200 space-y-3"
              >
                {/* Top Row: Token, Status Pill, UPI Pill, Time, Price */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Order Token with Copy */}
                    <div className="flex items-center gap-1.5 font-mono font-extrabold text-slate-900 text-xs">
                      <span>{ord.order_number}</span>
                      <button
                        onClick={() => copyOrderNumber(ord.order_number)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copiedId === ord.order_number ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Status Pill (Exact Match to Image 2: Dark green Collected pill) */}
                    {isCollected ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#137333] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" /> Collected
                      </span>
                    ) : (
                      <StatusBadge status={ord.status} />
                    )}

                    {/* UPI Status Pill (Exact Match to Image 2: Light mint UPI PAID pill) */}
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 border ${isPaid
                      ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      <IndianRupee className="w-2.5 h-2.5" />
                      {isPaid ? 'UPI PAID' : 'PAYMENT PENDING'}
                    </span>

                    {/* Formatted Time */}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Right side: TOTAL DUE & Price */}
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      TOTAL DUE
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      ₹{parseFloat(ord.total_amount).toFixed(2)}
                    </span>
                  </div>

                </div>

                {/* Bottom Row: Student Profile, PDF Document Chip, UPI Ref Chip, Inspect Action */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">

                  {/* Student Details & Attached Badges */}
                  <div className="flex flex-wrap items-center gap-3">

                    {/* Student Avatar & Name */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {ord.student_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs leading-none">
                          {ord.student_name}
                        </p>
                        <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                          Reg: {ord.register_number} {ord.department ? `· ${ord.department}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* PDF Documents Pill (Matching Image 2: Lavender Pill) */}
                    <div className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{ord.files_count || 1} PDF Document(s)</span>
                    </div>

                    {/* UPI Ref Pill (Matching Image 2: Mint Pill) */}
                    {ord.transaction_reference ? (
                      <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold shadow-2xs">
                        UPI: {ord.transaction_reference}
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-mono">
                        Cash / Offline
                      </div>
                    )}

                  </div>

                  {/* Right Inspect Action Button */}
                  <div className="shrink-0 flex items-center justify-end">
                    <Link
                      to={`/staff/orders/${ord.id}`}
                      className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer Matching Image 2 ───────────────────────────────── */}
      <footer className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© 2026 XeroXpress. All rights reserved.</p>
        <p className="flex items-center gap-1.5 font-medium text-emerald-700">
          <span>🍃</span>
          <span>Smart Administration. <strong className="font-extrabold text-emerald-800">Greener Campus.</strong></span>
        </p>
      </footer>

    </div>
  );
}
