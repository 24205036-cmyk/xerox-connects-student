import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Package, IndianRupee, Clock,
  CheckCircle2, Loader2, AlertCircle, RefreshCw, Copy,
  Smartphone, User, Calendar, ChevronRight, RotateCcw,
  Printer, Truck, PackageCheck, XCircle
} from 'lucide-react';
import { getOrderDetail } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const STATUS_STEPS = [
  { key: 'PENDING',   label: 'Order Placed',       icon: Clock,        desc: 'Your order was received and is awaiting staff review.' },
  { key: 'ACCEPTED',  label: 'Accepted',            icon: CheckCircle2, desc: 'Xerox staff accepted your order and will begin printing soon.' },
  { key: 'PRINTING',  label: 'Printing',            icon: Printer,      desc: 'Your documents are currently being printed.' },
  { key: 'READY',     label: 'Ready for Pickup',    icon: PackageCheck, desc: 'Your order is ready! Visit the Xerox counter to collect.' },
  { key: 'COLLECTED', label: 'Collected',           icon: Truck,        desc: 'Order collected. Thank you for using XeroXpress!' },
];

const PRINT_TYPE_LABEL = { BLACK_WHITE: 'B&W', COLOR: 'Color' };
const SIDE_TYPE_LABEL  = { SINGLE_SIDE: 'Single Side', DOUBLE_SIDE: 'Double Side' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const justCreated = location.state?.justCreated;

  const fetchOrder = async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await getOrderDetail(id);
      if (res?.data) setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const copyOrderNumber = () => {
    if (data?.order?.order_number) {
      navigator.clipboard.writeText(data.order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm mt-3">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
          <div><h3 className="font-bold text-slate-900">Error loading order</h3><p className="text-xs text-rose-600">{error}</p></div>
        </div>
        <button onClick={fetchOrder} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      </div>
    );
  }

  const { order, files = [], items = [], history = [] } = data || {};
  if (!order) return null;

  const isCancelled = order.status === 'CANCELLED';
  const currentStepIdx = isCancelled ? -1 : STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">

      {/* Just Created Banner */}
      {justCreated && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-black text-slate-900">Order placed successfully! 🎉</p>
            <p className="text-xs text-emerald-700">Your order has been received. Staff will accept it shortly.</p>
          </div>
        </div>
      )}

      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <Link to="/student" className="hover:text-blue-600 transition flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Dashboard</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link to="/student/history" className="hover:text-blue-600 transition">My Orders</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 font-mono font-bold">{order.order_number}</span>
        </div>
        <button onClick={fetchOrder} title="Refresh" className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition shadow-2xs cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Order Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 font-mono">{order.order_number}</h1>
              <button onClick={copyOrderNumber} title="Copy order number" className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer ${copied ? 'text-emerald-600' : ''}`}>
                <Copy className="w-4 h-4" />
              </button>
              {copied && <span className="text-xs text-emerald-600 font-bold">Copied!</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Batch: <span className="text-slate-800 font-bold">{order.batch_date}</span></span>
              <span className="text-slate-300">•</span>
              <span>Placed: {new Date(order.created_at).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={order.status} />
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Total Amount</p>
              <p className="text-2xl font-black text-slate-900">₹{parseFloat(order.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled ? (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-xs">
          <div className="flex items-start gap-0 min-w-max">
            {STATUS_STEPS.map((step, i) => {
              const isDone = i <= currentStepIdx;
              const isActive = i === currentStepIdx;
              const Icon = step.icon;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-2 w-32">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isDone
                        ? isActive
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-center">
                      <p className={`text-[11px] font-bold ${isDone ? (isActive ? 'text-blue-600' : 'text-emerald-700') : 'text-slate-400'}`}>{step.label}</p>
                      {isActive && <p className="text-[10px] text-slate-500 mt-0.5 max-w-[100px] leading-tight">{step.desc}</p>}
                    </div>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-1 w-8 mt-5 flex-1 rounded-full ${i < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-500" />
          <div>
            <p className="text-sm font-bold text-rose-700">Order Cancelled</p>
            <p className="text-xs text-slate-500">This order was cancelled. Contact staff if this was an error.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Files + Stationery */}
        <div className="lg:col-span-2 space-y-4">

          {/* Print Jobs */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Print Jobs ({files.length})
            </h3>
            {files.length === 0 && <p className="text-xs text-slate-500">No files attached.</p>}
            {files.map((f) => (
              <div key={f.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-sm font-bold text-slate-900">{f.original_filename}</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold">{PRINT_TYPE_LABEL[f.print_type] || f.print_type}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">{SIDE_TYPE_LABEL[f.side_type] || f.side_type}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">Pages: {f.page_range || 'ALL'}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">{f.copies} {f.copies === 1 ? 'copy' : 'copies'}</span>
                </div>
                {f.instructions && <p className="text-[11px] text-blue-600 italic mt-1">Note: "{f.instructions}"</p>}
              </div>
            ))}
          </div>

          {/* Stationery */}
          {items.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" /> Stationery ({items.length} type(s))
              </h3>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.stationery_name}</p>
                    <p className="text-xs text-slate-500">₹{parseFloat(item.unit_price).toFixed(2)} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-black text-purple-700">₹{parseFloat(item.total_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Additional Instructions */}
          {order.additional_instructions && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-slate-900 mb-1">Order Notes</p>
              <p className="italic text-slate-600">"{order.additional_instructions}"</p>
            </div>
          )}
        </div>

        {/* Right: Payment + Status History */}
        <div className="space-y-4">

          {/* Payment */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Payment
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500"><span>Print Cost</span><span className="text-slate-800 font-bold">₹{parseFloat(order.printing_total).toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Stationery</span><span className="text-slate-800 font-bold">₹{parseFloat(order.stationery_total).toFixed(2)}</span></div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm"><span className="text-slate-900">Total</span><span className="text-slate-900">₹{parseFloat(order.total_amount).toFixed(2)}</span></div>
            </div>
            <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : order.payment_status === 'FAILED' ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <IndianRupee className="w-3.5 h-3.5" /> {order.payment_status || 'PENDING'}
            </div>
            {order.transaction_reference && (
              <div className="pt-1">
                <p className="text-[10px] text-slate-400 mb-0.5">Transaction Ref:</p>
                <p className="text-xs font-mono text-slate-700 font-bold">{order.transaction_reference}</p>
              </div>
            )}
          </div>

          {/* Status History */}
          {history.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-sm font-black text-slate-900">Activity Log</h3>
              <div className="space-y-2.5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        {h.previous_status ? <><span className="text-slate-400">{h.previous_status}</span> → </> : ''}
                        <span className="font-bold text-slate-900">{h.new_status}</span>
                      </p>
                      <p className="text-slate-400 text-[11px]">{new Date(h.created_at).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Link to="/student/history" className="block w-full py-2.5 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition">
              View All Orders
            </Link>
            {order.status === 'COLLECTED' && (
              <Link
                to="/student/new-order"
                state={{ reorderFrom: order.id }}
                className="block w-full py-2.5 text-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reorder
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
