import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Package, User, Phone, Mail, RefreshCw,
  Loader2, AlertCircle, CheckCircle2, Clock, Printer, PackageCheck,
  IndianRupee, ChevronRight, Calendar, Download, Check, CheckCheck, Copy
} from 'lucide-react';
import { getStaffOrderDetail, updateOrderStatus } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const PRINT_TYPE_LABEL = { BLACK_WHITE: 'Black & White', COLOR: 'Color' };
const SIDE_TYPE_LABEL  = { SINGLE_SIDE: 'Single Side',  DOUBLE_SIDE: 'Double Side' };

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

const STAGES = ['PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED'];

export default function StaffOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await getStaffOrderDetail(id);
      if (res?.data) setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusUpdate = async () => {
    if (!data?.order) return;
    const action = NEXT_ACTION[data.order.status];
    if (!action) return;
    setIsUpdating(true); setUpdateMsg(null);
    try {
      await updateOrderStatus(id, action.nextStatus);
      setUpdateMsg(`Order status successfully updated to ${action.nextStatus}.`);
      await fetchOrder();
    } catch (err) {
      setUpdateMsg(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToken = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-bold text-slate-600">Retrieving order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        <div>
          <h3 className="font-bold text-sm">Unable to load order</h3>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  const { order, files = [], items = [], history = [] } = data || {};
  if (!order) return null;

  const action = NEXT_ACTION[order.status];
  const currentStageIndex = STAGES.indexOf(order.status);
  const isPaid = order.payment_status === 'PAID';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">

      {/* ── Top Navigation & Actions ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Link 
            to="/staff" 
            className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-mono font-bold">{order.order_number}</span>
        </div>

        <button 
          onClick={fetchOrder} 
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-2xs cursor-pointer"
          title="Refresh Order"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Status Update Alert Banner ────────────────────────────── */}
      {updateMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* ── Hero Order Header Card ────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Order Ticket
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-0.5 rounded-md font-mono font-bold text-slate-800 text-sm">
                <span>{order.order_number}</span>
                <button
                  onClick={() => copyToken(order.order_number)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Token"
                >
                  {copiedToken ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Batch Date: <strong className="text-slate-700">{order.batch_date}</strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Placed: {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">₹{parseFloat(order.total_amount).toFixed(2)}</p>
            </div>

            {action && (
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50 ${action.btnClass}`}
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <action.icon className="w-4 h-4" />}
                <span>{action.label}</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-5 gap-2">
            {STAGES.map((stage, idx) => {
              const isPastOrCurrent = currentStageIndex >= idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div key={stage} className="flex flex-col items-center text-center">
                  <div className={`w-full h-1.5 rounded-full mb-2 transition-all ${
                    isPastOrCurrent ? 'bg-amber-500' : 'bg-slate-100'
                  }`} />
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold ${
                    isCurrent ? 'text-amber-600 font-black' : isPastOrCurrent ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Two Column Content Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Student Details & Print Files */}
        <div className="lg:col-span-2 space-y-5">

          {/* Student Info Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Student Profile
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Student Name</p>
                <p className="text-slate-900 font-bold mt-0.5 text-sm">{order.student_name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Register Number</p>
                <p className="text-slate-900 font-mono font-bold mt-0.5 text-sm">{order.register_number}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Department / Year</p>
                <p className="text-slate-900 font-bold mt-0.5">{order.department || 'N/A'} {order.year ? `· Year ${order.year}` : ''}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Phone</p>
                <p className="text-slate-900 font-bold mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {order.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Print Jobs / Files */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Attached Print Documents ({files.length})
              </h3>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Subtotal: ₹{parseFloat(order.printing_total).toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              {files.map((f, i) => (
                <div 
                  key={f.id} 
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                        Document #{i + 1}
                      </span>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {f.original_filename}
                      </p>
                    </div>

                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      {f.copies} Copies
                    </span>
                  </div>

                  {/* Print Specifications Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 shadow-2xs">
                      {PRINT_TYPE_LABEL[f.print_type] || f.print_type}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 shadow-2xs">
                      {SIDE_TYPE_LABEL[f.side_type] || f.side_type}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 font-mono font-bold text-amber-800">
                      Pages: {f.page_range || 'ALL'}
                    </span>
                    {f.binding_option && f.binding_option !== 'NONE' && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 font-bold text-purple-700">
                        Binding: {f.binding_option}
                      </span>
                    )}
                  </div>

                  {/* File instructions */}
                  {f.instructions && (
                    <p className="text-xs text-amber-800 bg-amber-100/50 border border-amber-200/80 rounded-lg p-2 italic flex items-start gap-1.5">
                      <span className="font-bold text-amber-700 not-italic">Note:</span>
                      "{f.instructions}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stationery Items (if any) */}
          {items.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" /> Stationery Items ({items.length})
                </h3>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  Subtotal: ₹{parseFloat(order.stationery_total).toFixed(2)}
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50/50">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.stationery_name}</p>
                      <p className="text-[11px] text-slate-500">₹{parseFloat(item.unit_price).toFixed(2)} × {item.quantity} qty</p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{parseFloat(item.total_price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions from Student */}
          {order.additional_instructions && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Special Instructions from Student</p>
              <p className="text-sm italic">"{order.additional_instructions}"</p>
            </div>
          )}

        </div>

        {/* Right Column: Payment Details & Activity History */}
        <div className="space-y-5">

          {/* Payment Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Verification</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Printing Charges</span>
                <span className="text-slate-800 font-bold">₹{parseFloat(order.printing_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Stationery Supplies</span>
                <span className="text-slate-800 font-bold">₹{parseFloat(order.stationery_total).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              isPaid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>UPI STATUS:</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white text-slate-900 shadow-2xs font-extrabold">
                {order.payment_status || 'PENDING'}
              </span>
            </div>

            {order.transaction_reference && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI Transaction Ref</p>
                <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5 break-all">
                  {order.transaction_reference}
                </p>
              </div>
            )}
          </div>

          {/* Activity Log */}
          {history.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Status Timeline</h3>
              
              <div className="space-y-3 pt-1">
                {history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-slate-900 font-bold">
                        {h.previous_status ? <span className="text-slate-400 font-normal">{h.previous_status} → </span> : ''}
                        <span>{h.new_status}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {new Date(h.created_at).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
