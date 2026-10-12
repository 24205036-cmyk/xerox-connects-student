import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Printer, Clock, CheckCircle2, PackageCheck, RefreshCw,
  Loader2, AlertCircle, FileText, Package, User,
  ChevronRight, Calendar, IndianRupee, LayoutGrid, List,
  Search, Check, Filter, Phone, ArrowUpRight, Copy, CheckCheck
} from 'lucide-react';
import { getStaffOrders, updateOrderStatus } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const STATUS_TABS = [
  { value: '',          label: 'All Orders',  dotColor: 'bg-slate-400' },
  { value: 'PENDING',   label: 'Pending',     dotColor: 'bg-amber-500',   accentBg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'ACCEPTED',  label: 'Accepted',    dotColor: 'bg-blue-500',    accentBg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'PRINTING',  label: 'Printing',    dotColor: 'bg-indigo-500',  accentBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'READY',     label: 'Ready',       dotColor: 'bg-emerald-500', accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'COLLECTED', label: 'Collected',   dotColor: 'bg-teal-500',    accentBg: 'bg-teal-50 text-teal-700 border-teal-200' },
];

const NEXT_ACTION = {
  PENDING:  { 
    label: 'Accept Order',          
    nextStatus: 'ACCEPTED',  
    btnClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20',
    icon: Check
  },
  ACCEPTED: { 
    label: 'Start Printing',  
    nextStatus: 'PRINTING',  
    btnClass: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-600/20',
    icon: Printer
  },
  PRINTING: { 
    label: 'Mark as Ready',      
    nextStatus: 'READY',     
    btnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20',
    icon: PackageCheck
  },
  READY:    { 
    label: 'Mark Collected',  
    nextStatus: 'COLLECTED', 
    btnClass: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md shadow-teal-600/20',
    icon: CheckCircle2
  },
};

export default function StaffDashboard() {
  const location = useLocation();
  const isCompletedRoute = location.pathname === '/staff/completed';

  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [activeTab, setActiveTab] = useState(isCompletedRoute ? 'COLLECTED' : '');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Sync activeTab if routing changes to /staff/completed
  useEffect(() => {
    if (isCompletedRoute) {
      setActiveTab('COLLECTED');
    } else if (activeTab === 'COLLECTED' && location.pathname === '/staff') {
      setActiveTab('');
    }
  }, [location.pathname]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await getStaffOrders(activeTab, batchDate);
      if (res?.data) {
        setOrders(res.data.orders || []);
        setStatusCounts(res.data.statusCounts || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to load print orders.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [activeTab, batchDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh timer if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const action = NEXT_ACTION[currentStatus];
    if (!action) return;
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, action.nextStatus);
      await fetchOrders(true);
    } catch (err) {
      alert(err.message || 'Failed to advance order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyOrderNumber = (orderNumber) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const setDateToday = () => {
    setBatchDate(new Date().toISOString().split('T')[0]);
  };

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const ordNum = (o.order_number || '').toLowerCase();
      const studentName = (o.student_name || '').toLowerCase();
      const regNo = (o.register_number || '').toLowerCase();
      const dept = (o.department || '').toLowerCase();
      const phone = (o.phone || '').toLowerCase();
      const upiRef = (o.transaction_reference || '').toLowerCase();
      return (
        ordNum.includes(query) ||
        studentName.includes(query) ||
        regNo.includes(query) ||
        dept.includes(query) ||
        phone.includes(query) ||
        upiRef.includes(query)
      );
    });
  }, [orders, searchQuery]);

  const totalToday = Object.values(statusCounts).reduce((a, b) => a + Number(b), 0);
  const pendingCount = statusCounts['PENDING'] || 0;
  const inProgressCount = (statusCounts['ACCEPTED'] || 0) + (statusCounts['PRINTING'] || 0);
  const readyCount = statusCounts['READY'] || 0;
  const collectedCount = statusCounts['COLLECTED'] || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Top Hero / Operations Bar ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Live Dispatch Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Xerox Counter Order Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept print jobs, monitor progress, inspect documents, and mark finished prints ready for pickup.
          </p>
        </div>

        {/* Date Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={setDateToday}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                batchDate === new Date().toISOString().split('T')[0]
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Today
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Auto-refresh every 20s active' : 'Turn on auto-refresh'}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              autoRefresh 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            Auto-Sync
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchOrders()}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 4 Impressive Stat Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Today */}
        <div 
          onClick={() => setActiveTab('')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-white border ${
            activeTab === '' ? 'ring-2 ring-indigo-500 border-indigo-200 shadow-md' : 'border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Intake</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{totalToday}</span>
            <span className="text-[11px] font-semibold text-slate-400">for {batchDate}</span>
          </div>
        </div>

        {/* Pending Orders (Action Needed) */}
        <div 
          onClick={() => setActiveTab('PENDING')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-white border ${
            activeTab === 'PENDING' ? 'ring-2 ring-amber-500 border-amber-200 shadow-md' : 'border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">{pendingCount}</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Needs Accept
            </span>
          </div>
        </div>

        {/* Printing In Progress */}
        <div 
          onClick={() => setActiveTab('PRINTING')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-white border ${
            activeTab === 'PRINTING' ? 'ring-2 ring-blue-500 border-blue-200 shadow-md' : 'border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">{inProgressCount}</span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              On Machine
            </span>
          </div>
        </div>

        {/* Ready for Pickup */}
        <div 
          onClick={() => setActiveTab('READY')}
          className={`cursor-pointer transition-all duration-200 p-4 sm:p-5 rounded-2xl bg-white border ${
            activeTab === 'READY' ? 'ring-2 ring-emerald-500 border-emerald-200 shadow-md' : 'border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Ready</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{readyCount}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ready at Desk
            </span>
          </div>
        </div>

      </div>

      {/* ── Search & Filter Controls ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {STATUS_TABS.map((tab) => {
            const count = tab.value ? statusCounts[tab.value] || 0 : totalToday;
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px] md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, reg #, or order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
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

      {/* ── Main Orders Feed ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Loading batch print orders...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 sm:p-16 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Printer className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No print orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No results matching "${searchQuery}". Try clearing search keywords.`
              : `There are currently no ${activeTab ? activeTab.toLowerCase() + ' ' : ''}orders scheduled for batch ${batchDate}.`}
          </p>
          {(searchQuery || activeTab) && (
            <div className="pt-2">
              <button
                onClick={() => { setSearchQuery(''); setActiveTab(''); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((ord) => {
            const action = NEXT_ACTION[ord.status];
            const isUpdating = updatingId === ord.id;
            const isPaid = ord.payment_status === 'PAID';

            return (
              <div 
                key={ord.id} 
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition duration-200 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Order Info & Student Details */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    
                    {/* Header Row: Token, Status, Payment, Time */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition">
                        <span className="font-mono font-extrabold text-slate-900 text-xs tracking-tight">
                          {ord.order_number}
                        </span>
                        <button
                          onClick={() => copyOrderNumber(ord.order_number)}
                          title="Copy Order ID"
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {copiedId === ord.order_number ? (
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <StatusBadge status={ord.status} />

                      {/* Payment Verification Pill */}
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border ${
                        isPaid 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <IndianRupee className="w-2.5 h-2.5" />
                        {isPaid ? 'UPI PAID' : 'PAYMENT PENDING'}
                      </span>

                      {/* Time stamp */}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto lg:ml-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Middle Row: Student Card & Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Student info */}
                      <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {ord.student_name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{ord.student_name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Reg: <span className="font-bold text-slate-700">{ord.register_number}</span> {ord.department ? `· ${ord.department}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Job details chips */}
                      <div className="flex flex-wrap items-center gap-1.5 py-1">
                        <span className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {ord.files_count} PDF Document(s)
                        </span>

                        {ord.stationery_count > 0 && (
                          <span className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-bold flex items-center gap-1">
                            <Package className="w-3 h-3" /> {ord.stationery_count} Stationery item(s)
                          </span>
                        )}

                        {ord.transaction_reference && (
                          <span className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10.5px] font-mono font-semibold">
                            UPI: {ord.transaction_reference}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Student instructions callout */}
                    {ord.additional_instructions && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-3 py-2 text-[11px] text-amber-800 flex items-start gap-1.5">
                        <span className="font-bold text-amber-700 shrink-0">Instruction:</span>
                        <span className="italic truncate">"{ord.additional_instructions}"</span>
                      </div>
                    )}

                  </div>

                  {/* Right: Pricing & Quick Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10.5px] font-semibold text-slate-400 block uppercase tracking-wider">Total Due</span>
                      <span className="text-xl font-black text-slate-900 tracking-tight">
                        ₹{parseFloat(ord.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Main Status Advance Action Button */}
                      {action && (
                        <button
                          onClick={() => handleStatusUpdate(ord.id, ord.status)}
                          disabled={isUpdating}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${action.btnClass}`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <action.icon className="w-3.5 h-3.5" />
                          )}
                          <span>{action.label}</span>
                        </button>
                      )}

                      {/* Detail View Button */}
                      <Link
                        to={`/staff/orders/${ord.id}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
