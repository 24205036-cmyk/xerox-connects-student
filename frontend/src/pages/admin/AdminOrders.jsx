import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Calendar, Eye, 
  RefreshCw, CheckCircle2, Clock, AlertCircle, FileText, 
  Package, X, IndianRupee, Printer, User
} from 'lucide-react';
import { getAdminOrders, getStaffOrderDetail } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [batchDate, setBatchDate] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (batchDate) params.date = batchDate;

      const res = await getAdminOrders(params);
      setOrders(res.data?.orders || []);
    } catch (err) {
      showToast(err.message || 'Failed to load college orders.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, batchDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await getStaffOrderDetail(orderId);
      setSelectedOrderDetail(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to load order details.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Order Master Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, track, and inspect all student print orders and stationery transactions across campus batches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, student name, reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
        {isLoading ? (
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

      {/* Order Detail Modal */}
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
    </div>
  );
}
