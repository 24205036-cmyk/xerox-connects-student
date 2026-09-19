import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, ShieldAlert, 
  Phone, Mail, BookOpen, GraduationCap, RefreshCw, 
  CheckCircle2, AlertCircle, ShoppingBag, Eye, X
} from 'lucide-react';
import { getAdminUsers, toggleAdminUserStatus } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { showToast } = useToast();

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUsers({
        role: 'STUDENT',
        search,
        department,
        year
      });
      setStudents(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load students.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, year]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleToggleStatus = async (student) => {
    const action = student.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${student.name}'s account?`)) {
      return;
    }

    try {
      const res = await toggleAdminUserStatus(student.id);
      showToast(res.message || 'Student status updated.', 'success');
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, is_active: res.is_active } : s))
      );
      if (selectedStudent && selectedStudent.id === student.id) {
        setSelectedStudent({ ...selectedStudent, is_active: res.is_active });
      }
    } catch (err) {
      showToast(err.message || 'Failed to update student status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, search, and manage registered student accounts across all college departments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStudents}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, reg no, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="AI_DS">AI & DS</option>
            <option value="MBA_MCA">Management / MCA</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="PG">PG</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Loading student accounts...
          </div>
        ) : students.length > 0 ? (
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department & Year</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {s.register_number || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {s.department} &bull; Year {s.year}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-slate-800">{s.email}</p>
                    <p className="text-[11px] font-mono text-slate-400">{s.phone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                      {s.orders_count} orders (₹{parseFloat(s.total_spent || 0).toFixed(0)})
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer ${
                        s.is_active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            No students found matching current filter criteria.
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Student Profile Summary</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold">Full Name</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedStudent.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold">Register Number</span>
                  <p className="font-bold text-indigo-700 font-mono">{selectedStudent.register_number}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold">Department & Year</span>
                  <p className="font-bold text-slate-800">{selectedStudent.department} - Year {selectedStudent.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold">Email Address</span>
                  <p className="font-medium text-slate-800 truncate">{selectedStudent.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold">Phone Number</span>
                  <p className="font-medium text-slate-800 font-mono">{selectedStudent.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold">Orders Placed</span>
                  <p className="font-bold text-purple-700">{selectedStudent.orders_count} orders</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold">Account Status</span>
                  <p className={`font-bold ${selectedStudent.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedStudent.is_active ? 'Active' : 'Deactivated'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
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
