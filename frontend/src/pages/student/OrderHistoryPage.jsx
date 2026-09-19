import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, ChevronRight, RefreshCw, Loader2, AlertCircle,
  PlusCircle, FileText, Package, IndianRupee, Calendar, ChevronLeft
} from 'lucide-react';
import { getOrderHistory } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const STATUS_FILTERS = [
  { value: '',          label: 'All Orders' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'ACCEPTED',  label: 'Accepted' },
  { value: 'PRINTING',  label: 'Printing' },
  { value: 'READY',     label: 'Ready' },
  { value: 'COLLECTED', label: 'Collected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (page = 1, status = '') => {
    setIsLoading(true); setError(null);
    try {
      const res = await getOrderHistory(page, status);
      if (res?.data) {
        setOrders(res.data.orders || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to load order history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(1, statusFilter); }, [statusFilter]);

  const goToPage = (p) => fetchHistory(p, statusFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <ClipboardList className="w-3.5 h-3.5" /> Order History
          </div>
          <h1 className="text-2xl font-black text-slate-900">My Print Orders</h1>
          <p className="text-xs text-slate-500 mt-1">{pagination.total} total orders across all batches</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchHistory(pagination.page, statusFilter)} 
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link 
            to="/student/new-order" 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm flex items-center gap-2 hover:-translate-y-0.5 transition-all rounded-xl"
          >
            <PlusCircle className="w-4 h-4" /> New Order
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === f.value
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-white border-dashed border-2 border-slate-300 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {statusFilter ? `No ${statusFilter.toLowerCase()} orders found.` : "You haven't placed any orders yet."}
            </p>
          </div>
          <Link to="/student/new-order" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition">
            <PlusCircle className="w-4 h-4" /> Create First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => (
            <div key={ord.id} className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition group shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-mono font-bold text-slate-900 text-sm">{ord.order_number}</h3>
                      <StatusBadge status={ord.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {ord.batch_date}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-slate-400" /> {ord.files_count} PDF(s)</span>
                      {ord.stationery_count > 0 && <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-slate-400" /> {ord.stationery_count} stationery</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{ord.payment_status || 'PENDING'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 font-medium">Amount</p>
                    <p className="text-base font-black text-slate-900">₹{parseFloat(ord.total_amount).toFixed(2)}</p>
                  </div>
                  <Link
                    to={`/student/orders/${ord.id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-bold border border-slate-200 transition flex items-center gap-1 shadow-2xs"
                  >
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-600 font-medium">
            Page <span className="text-slate-900 font-bold">{pagination.page}</span> of <span className="text-slate-900 font-bold">{pagination.totalPages}</span>
          </span>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
