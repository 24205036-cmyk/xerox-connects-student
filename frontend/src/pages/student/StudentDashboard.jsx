import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, Clock, FileText, CheckCircle2, AlertCircle,
  ShoppingBag, ArrowRight, IndianRupee, GraduationCap, Loader2,
  RefreshCw, Package, Calendar, ChevronRight, Percent,
  Eye, Layers, Copy, Check, ShieldCheck, MapPin, Search, X,
  UploadCloud
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { getStudentDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const fetchDashboard = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const res = await getStudentDashboard();
      setDashboardData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Real-time Countdown timer to 20:30 (8:30 PM) daily batch cutoff
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(20, 30, 0, 0);

      if (now > cutoff) {
        setTimeLeft('Cutoff Passed for Today');
      } else {
        const diffMs = cutoff - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${mins}m until batch closing`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(text);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Time of day greeting matching reference
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Formatted current date e.g. Mon, Sep 7, 2026
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-4 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
        <h3 className="text-slate-900 font-bold text-base tracking-tight">Syncing Command Center</h3>
        <p className="text-slate-500 text-xs font-medium mt-1">Connecting to ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Unable to load Student Dashboard</h3>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchDashboard()}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-105"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
        </button>
      </div>
    );
  }

  const { orderWindow, stats, recentOrders = [] } = dashboardData || {};

  // Filtered orders based on selected tab & search query
  const filteredOrders = recentOrders.filter(ord => {
    let matchesTab = true;
    if (activeFilter === 'IN_PROGRESS') matchesTab = ['PENDING', 'ACCEPTED', 'PRINTING'].includes(ord.status);
    else if (activeFilter === 'READY') matchesTab = ord.status === 'READY';
    else if (activeFilter === 'COLLECTED') matchesTab = ord.status === 'COLLECTED';

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch = (
        (ord.order_number && ord.order_number.toLowerCase().includes(q)) ||
        (ord.batch_date && ord.batch_date.toLowerCase().includes(q)) ||
        (ord.status && ord.status.toLowerCase().includes(q))
      );
    }

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-8">
      {/* ── 1. Hero Welcome Card with Radiant Aurora Wave & Script Tag ─── */}
      <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-white via-[#fcfbff] to-[#f5f2ff] border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.08)] overflow-hidden">
        {/* Glowing Aurora Wave SVG in bottom right matching reference */}
        <div className="absolute right-0 bottom-0 pointer-events-none overflow-hidden hidden sm:block w-full max-w-xl h-44 z-0">
          <svg className="w-full h-full" viewBox="0 0 520 180" preserveAspectRatio="none" fill="none">
            <path
              d="M0 140 C140 100, 260 170, 520 90 L520 180 L0 180 Z"
              fill="url(#auroraWaveGrad)"
            />
            <path
              d="M80 160 C200 130, 340 175, 520 120 L520 180 L80 180 Z"
              fill="url(#auroraWaveGrad2)"
            />
            <defs>
              <linearGradient id="auroraWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#c7d2fe" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="auroraWaveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            {/* Student Credential Badges matching reference */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/90 text-xs font-bold shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>{user?.department || 'IT'} &bull; Year {user?.year || '3'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold tabular-nums shadow-2xs">
                <span>Reg :</span>
                <strong className="text-slate-900 font-bold">{user?.register_number || '24260562'}</strong>
              </span>



              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium shadow-2xs">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{todayFormatted}</span>
              </span>
            </div>

            {/* Greeting & Title matching reference */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
                {greeting}, <span className="text-[#6366f1]">{user?.name || 'Infhant'}!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed font-normal">
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 shrink-0 relative z-10">
            <button
              onClick={() => fetchDashboard(true)}
              disabled={isRefreshing}
              title="Refresh queue status"
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Campus Batch Window & Pipeline Banner matching reference ── */}
      <div className="p-5 sm:p-5.5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Purple Stacked Layers Icon */}
            <div className="w-11 h-11 rounded-2xl bg-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/25">
              <Layers className="w-5.5 h-5.5" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Orders are Open for Today's Batch
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {orderWindow?.message || 'Orders are currently OPEN for today\'s batch.'}
              </p>
            </div>
          </div>

          {/* Time Cutoff Badges matching reference */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold tabular-nums">
            <div className="px-3.5 py-1.5 rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#b45309] flex items-center gap-2 shadow-2xs font-bold">
              <Clock className="w-3.5 h-3.5 text-[#b45309]" />
              <span>{timeLeft || '3h 48m until batch closing'}</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center gap-2 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Window: <strong className="text-slate-900">{orderWindow?.openTime || '08:00'} - {orderWindow?.closeTime || '20:30'}</strong></span>
            </div>

            <div className="px-3.5 py-1.5 rounded-2xl bg-[#f5f3ff] border border-[#ddd6fe] text-[#6d28d9] font-bold flex items-center gap-2 shadow-2xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{orderWindow?.batchLabel || "Today's Batch"}</span>
            </div>


          </div>
        </div>
      </div>

      {/* ── 3. Enlarged Full-Width New Print Order Box ─── */}
      <Link
        to="/student/new-order"
        className="group relative overflow-hidden block w-full p-8 sm:p-10 rounded-3xl bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-500 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.06)] hover:shadow-[0_10px_30px_rgba(99,102,241,0.14)] hover:-translate-y-0.5 text-center cursor-pointer"
      >
        {/* Subtle glowing accent background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto space-y-3.5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <span>Create New Print Order</span>
              <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1.5 transition-transform" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Click anywhere to upload PDF or Word documents &amp; configure print settings
            </p>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all">
              <Printer className="w-4 h-4" />
              <span>Upload Here</span>
              <ArrowRight className="w-4 h-4 text-indigo-200" />
            </span>
          </div>
        </div>
      </Link>

      {/* ── 5. Professional Recent Orders Management ─────────────── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Section Header with Search & Filter Tabs matching reference */}
        <div className="p-5 sm:p-5.5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Print Orders</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] text-xs font-bold tabular-nums">
                {recentOrders.length} Total
              </span>
            </div>
          </div>

          {/* Search bar + Filter Tabs + History Link */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-36 sm:w-48 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Pills matching reference: purple active pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'IN_PROGRESS', label: 'In-Progress' },
                { id: 'READY', label: 'Ready' },
                { id: 'COLLECTED', label: 'Collected' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${activeFilter === tab.id
                    ? 'bg-[#4f46e5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              to="/student/history"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#4f46e5] border border-slate-200 text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition-all"
            >
              <span>All History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Table Content */}
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-sans">
              <thead className="text-[11px] uppercase tracking-wider bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-4">Batch Date</th>
                  <th className="py-3.5 px-4">Files &amp; Add-ons</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-indigo-50/30 transition-colors">
                    {/* Order Number with Copy Tooltip */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs tracking-tight tabular-nums">
                          {ord.order_number}
                        </span>
                        <button
                          onClick={() => handleCopy(ord.order_number)}
                          title="Copy Order ID for counter pickup"
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          {copiedOrderId === ord.order_number ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {ord.created_at ? new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </td>

                    {/* Batch Date */}
                    <td className="py-4 px-4 text-slate-700 text-xs font-medium tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ord.batch_date}</span>
                      </div>
                    </td>

                    {/* Files & Stationery */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold tabular-nums flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{ord.files_count || 1} PDF</span>
                        </span>
                        {ord.stationery_count > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold tabular-nums">
                            +{ord.stationery_count} item
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-bold text-slate-900 text-xs tabular-nums">
                      ₹{parseFloat(ord.total_amount || 0).toFixed(2)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-4">
                      {ord.payment_status === 'PAID' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                          Paid UPI
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <StatusBadge status={ord.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/student/orders/${ord.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#4f46e5] text-slate-700 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs border border-slate-200 hover:border-[#4f46e5]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 text-sm">No orders match this filter</p>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                {searchQuery
                  ? `No orders matching "${searchQuery}".`
                  : activeFilter === 'ALL'
                    ? 'You have not submitted any Xerox print orders yet.'
                    : `There are currently no orders in "${activeFilter}" state.`}
              </p>
            </div>
            <Link
              to="/student/new-order"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] font-bold text-xs text-white shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Submit Your Order</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── 6. Campus Pickup Guide Strip matching reference ────────── */}


      {/* ── Rates & Pricing Modal ───────────────────────────────── */}
      {showRatesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowRatesModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Campus Xerox Price Card</h3>
                <p className="text-xs text-slate-500">Approved university counter rates</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700 font-medium">Black &amp; White Print (Single Sided)</span>
                <span className="font-bold text-slate-900 tabular-nums">₹1.50 / page</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700 font-medium">Black &amp; White Print (Duplex Double Sided)</span>
                <span className="font-bold text-slate-900 tabular-nums">₹2.00 / sheet</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700 font-medium">Color Laser Print</span>
                <span className="font-bold text-slate-900 tabular-nums">₹5.00 / page</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700 font-medium">Spiral Binding (Soft Cover)</span>
                <span className="font-bold text-slate-900 tabular-nums">₹25.00</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-700 font-medium">Soft Binding / Corner Stapling</span>
                <span className="font-bold text-slate-900 tabular-nums">₹15.00 / Free</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRatesModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Close Price Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
