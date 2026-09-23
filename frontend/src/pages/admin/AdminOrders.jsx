import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Eye, RefreshCw, AlertCircle, 
  X, CreditCard, CheckCircle2, AlertTriangle, ShieldCheck,
  Clock, ArrowUpRight, MessageSquare
} from 'lucide-react';
import { getAdminOrders, getStaffOrderDetail, getAdminPayments, reviewExtraPayment } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState('ORDERS'); // 'ORDERS' | 'PAYMENTS'
  const { showToast } = useToast();

  // Orders Tab State
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [batchDate, setBatchDate] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  // Payments Tab State
  const [payments, setPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentStatusCounts, setPaymentStatusCounts] = useState({});
  const [selectedExtraPayment, setSelectedExtraPayment] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('EXTRA_PAYMENT');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ── Fetch Orders ─────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const params = {};
      if (orderSearch) params.search = orderSearch;
      if (orderStatusFilter !== 'ALL') params.status = orderStatusFilter;
      if (batchDate) params.date = batchDate;

      const res = await getAdminOrders(params);
      setOrders(res.data?.orders || []);
    } catch (err) {
      showToast(err.message || 'Failed to load college orders.', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // ── Fetch Payments ───────────────────────────────────────────────────────────
  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const params = {};
      if (paymentSearch) params.search = paymentSearch;
      if (paymentStatusFilter !== 'ALL') params.status = paymentStatusFilter;

      const res = await getAdminPayments(params);
      setPayments(res.data?.transactions || []);
      setPaymentStatusCounts(res.data?.statusCounts || {});
    } catch (err) {
      showToast(err.message || 'Failed to load payment transactions.', 'error');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ORDERS') {
      fetchOrders();
    } else {
      fetchPayments();
    }
  }, [activeTab, orderStatusFilter, batchDate, paymentStatusFilter]);

  const handleOrderSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handlePaymentSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await getStaffOrderDetail(orderId);
      setSelectedOrderDetail(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to load order details.', 'error');
    }
  };

  const handleOpenReview = (tx) => {
    setSelectedExtraPayment(tx);
    setReviewNotes(tx.admin_notes || '');
    setReviewStatus(tx.status);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedExtraPayment) return;
    setIsSubmittingReview(true);
    try {
      await reviewExtraPayment(selectedExtraPayment.id, {
        admin_notes: reviewNotes,
        status: reviewStatus
      });
      showToast('Payment review saved successfully.', 'success');
      setSelectedExtraPayment(null);
      fetchPayments();
    } catch (err) {
      showToast(err.message || 'Failed to save review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Order &amp; Payment Master Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, track, and inspect all student print orders and real-time Razorpay payment transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (activeTab === 'ORDERS' ? fetchOrders() : fetchPayments())}
            disabled={isLoadingOrders || isLoadingPayments}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(isLoadingOrders || isLoadingPayments) ? 'animate-spin text-emerald-600' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'ORDERS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Print Orders Queue</span>
        </button>
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'PAYMENTS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Razorpay Transactions Audit</span>
          {paymentStatusCounts['EXTRA_PAYMENT'] > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
              {paymentStatusCounts['EXTRA_PAYMENT']} Extra
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: ORDERS LOG ── */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handleOrderSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order ID, student name, reg no..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="PRINTING">Printing</option>
                <option value="READY">Ready</option>
                <option value="COLLECTED">Collected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              />

              {batchDate && (
                <button
                  onClick={() => setBatchDate('')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto">
            {isLoadingOrders ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading orders...
              </div>
            ) : orders.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Batch Date</th>
                    <th className="py-3 px-4">Contents</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{ord.student_name}</p>
                        <p className="text-[10.5px] text-slate-400 font-mono">{ord.register_number} &bull; {ord.department}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {ord.batch_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                          {ord.files_count} PDF(s)
                        </span>
                        {ord.stationery_count > 0 && (
                          <span className="ml-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                            +{ord.stationery_count} item(s)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{parseFloat(ord.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold border ${
                          ord.payment_status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {ord.payment_status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewOrder(ord.id)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 ml-auto shadow-2xs cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                No orders found matching filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: RAZORPAY TRANSACTIONS AUDIT ── */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-4">
          {/* Status Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Verified Paid</span>
              <p className="text-lg font-black text-emerald-600 mt-0.5">{paymentStatusCounts['PAID'] || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-amber-600 font-bold uppercase text-[10px]">Extra / Duplicate</span>
              <p className="text-lg font-black text-amber-600 mt-0.5">{paymentStatusCounts['EXTRA_PAYMENT'] || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-rose-600 font-bold uppercase text-[10px]">Failed Payments</span>
              <p className="text-lg font-black text-rose-600 mt-0.5">{paymentStatusCounts['FAILED'] || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-purple-600 font-bold uppercase text-[10px]">Refunded</span>
              <p className="text-lg font-black text-purple-600 mt-0.5">{paymentStatusCounts['REFUNDED'] || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Initiated / Created</span>
              <p className="text-lg font-black text-slate-700 mt-0.5">{paymentStatusCounts['CREATED'] || 0}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handlePaymentSearchSubmit} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, reg no, Razorpay ID, order number..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
              />
            </form>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID (Verified)</option>
              <option value="EXTRA_PAYMENT">EXTRA_PAYMENT (Needs Review)</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="CREATED">CREATED</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto">
            {isLoadingPayments ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                Loading transactions...
              </div>
            ) : payments.length > 0 ? (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date &amp; ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Razorpay Order &bull; Payment ID</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pt) => {
                    const isExtra = pt.status === 'EXTRA_PAYMENT';
                    const isPaid = pt.status === 'PAID';
                    const isFailed = pt.status === 'FAILED';
                    const isRefunded = pt.status === 'REFUNDED';

                    return (
                      <tr key={pt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <p className="font-bold text-slate-900">#{pt.id}</p>
                          <p className="text-slate-400">{new Date(pt.created_at).toLocaleString()}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{pt.customer_name}</p>
                          <p className="text-[10.5px] text-slate-400 font-mono">{pt.register_number} &bull; {pt.customer_phone}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {pt.order_number || (pt.order_id ? `#${pt.order_id}` : 'Draft Cart')}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                          ₹{parseFloat(pt.amount).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <p className="text-indigo-600 truncate max-w-xs">{pt.razorpay_order_id}</p>
                          <p className="text-emerald-700 font-bold truncate max-w-xs">{pt.razorpay_payment_id || '—'}</p>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {pt.payment_method || 'RAZORPAY'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-black border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isExtra
                                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                : isFailed
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isRefunded
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isPaid && <CheckCircle2 className="w-3 h-3" />}
                            {isExtra && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                            <span>{pt.status}</span>
                          </span>
                          {pt.admin_notes && (
                            <p className="text-[10px] text-slate-500 italic mt-1 max-w-xs truncate" title={pt.admin_notes}>
                              Note: {pt.admin_notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenReview(pt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs ${
                              isExtra
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isExtra ? 'Review Extra' : 'Audit / Note'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                No payment transactions found matching filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Order Detail Modal ── */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Order Inspector
                </span>
                <h3 className="text-base font-extrabold text-slate-900 font-mono mt-1">
                  {selectedOrderDetail.order.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student & Batch info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold">Student</span>
                <p className="font-bold text-slate-900 truncate mt-0.5">{selectedOrderDetail.order.student_name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{selectedOrderDetail.order.register_number}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold">Batch Date</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedOrderDetail.order.batch_date}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold">Total Amount</span>
                <p className="font-black text-slate-900 font-mono text-sm mt-0.5">₹{parseFloat(selectedOrderDetail.order.total_amount).toFixed(2)}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold">Current Status</span>
                <div className="mt-1"><StatusBadge status={selectedOrderDetail.order.status} /></div>
              </div>
            </div>

            {/* PDF Files List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDF Print Jobs</h4>
              <div className="space-y-2">
                {selectedOrderDetail.files?.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">{f.original_filename}</p>
                      <p className="text-slate-500 text-[11px]">
                        {f.copies} copy(s) &bull; {f.print_type === 'COLOR' ? 'Color' : 'B&W'} &bull; {f.side_type === 'DOUBLE_SIDE' ? 'Double Sided' : 'Single Side'} &bull; Pages: {f.page_range}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stationery Items */}
            {selectedOrderDetail.items?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stationery Items</h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  {selectedOrderDetail.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-slate-700">
                      <span>{it.stationery_name} &times; {it.quantity}</span>
                      <span className="font-mono font-bold text-slate-900">₹{parseFloat(it.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Extra / Duplicate Payment Modal ── */}
      {selectedExtraPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Payment Audit &amp; Review
                </span>
                <h3 className="text-base font-extrabold text-slate-900 font-mono mt-1">
                  Tx #{selectedExtraPayment.id} &bull; ₹{parseFloat(selectedExtraPayment.amount).toFixed(2)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExtraPayment(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{selectedExtraPayment.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order:</span>
                <span className="font-bold text-slate-900">{selectedExtraPayment.order_number || `#${selectedExtraPayment.order_id || 'N/A'}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Razorpay ID:</span>
                <span className="font-bold text-emerald-700">{selectedExtraPayment.razorpay_payment_id || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-amber-700">{selectedExtraPayment.status}</span>
              </div>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Update Transaction Status:
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="EXTRA_PAYMENT">EXTRA_PAYMENT (Keep Flagged)</option>
                  <option value="REFUNDED">REFUNDED (Processed Refund)</option>
                  <option value="PAID">PAID (Approved/Adjusted)</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admin Resolution / Refund Notes:
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Refund of ₹150 initiated via Razorpay dashboard on 19-Sept. UTR: RZP_REF_12345."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedExtraPayment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:bg-indigo-400"
                >
                  {isSubmittingReview ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
