import React, { useState, useEffect } from 'react';
import { 
  UserCheck, UserPlus, Phone, Mail, Lock, 
  ShieldCheck, ShieldAlert, RefreshCw, X, Loader2, KeyRound 
} from 'lucide-react';
import { getAdminUsers, createAdminStaff, toggleAdminUserStatus } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminStaff() {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { showToast } = useToast();

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUsers({ role: 'XEROX_STAFF' });
      setStaffList(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load Xerox staff accounts.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAdminStaff(form);
      showToast('New Xerox Counter staff account created successfully!', 'success');
      setIsModalOpen(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      fetchStaff();
    } catch (err) {
      showToast(err.message || 'Failed to create staff account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff) => {
    const action = staff.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${staff.name}'s access?`)) {
      return;
    }

    try {
      const res = await toggleAdminUserStatus(staff.id);
      showToast(res.message || 'Staff status updated.', 'success');
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, is_active: res.is_active } : s))
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Xerox Staff Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and oversee staff accounts assigned to operate the physical campus Xerox counter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add New Staff Account
          </button>
          <button
            onClick={fetchStaff}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading Xerox counter staff...
          </div>
        ) : staffList.length > 0 ? (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Assigned Location</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-xs shadow-2xs">
                      {s.name.charAt(0)}
                    </div>
                    <span className="text-slate-900 font-bold">{s.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono">
                    {s.email}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {s.phone}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                      Central Xerox Counter
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3 h-3" /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                        s.is_active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {s.is_active ? 'Disable Access' : 'Enable Access'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            No Xerox staff accounts found. Click "Add New Staff Account" above to create one.
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Create Xerox Staff Account</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.staff@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876500004"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
