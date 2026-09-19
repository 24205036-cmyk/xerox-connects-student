import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, ShieldCheck, 
  Calendar, ShoppingBag, Edit3, Save, X, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { getStudentProfile, updateStudentProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    department: '',
    year: ''
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getStudentProfile();
      setProfile(res.data);
      setEditForm({
        phone: res.data.phone || '',
        department: res.data.department || 'IT',
        year: res.data.year || '1'
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to load profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await updateStudentProfile(editForm);
      setProfile({ ...profile, ...res.data });
      setUser({ ...user, ...res.data });
      setIsEditing(false);
      setStatusMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm mt-3">Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
            {profile?.name?.charAt(0) || <User className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.name}</h1>
            <p className="text-xs text-blue-600 font-mono font-bold">Reg No: {profile?.register_number}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active Student
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-600 font-medium">{profile?.department} (Year {profile?.year})</span>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      {/* Toast Alert */}
      {statusMsg.text && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 shadow-xs ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Details Grid or Edit Form */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-lg font-black text-slate-900 mb-6">Academic & Contact Information</h2>

        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-blue-600" /> Full Name
              </label>
              <p className="font-bold text-slate-900">{profile?.name}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> College Register Number
              </label>
              <p className="font-bold font-mono text-slate-900">{profile?.register_number}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
              </label>
              <p className="font-bold text-slate-900">{profile?.email}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Mobile / WhatsApp Number
              </label>
              <p className="font-bold text-slate-900">{profile?.phone}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Department & Major
              </label>
              <p className="font-bold text-slate-900">{profile?.department}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Year of Study
              </label>
              <p className="font-bold text-slate-900">Year {profile?.year}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> Total Orders Placed
              </label>
              <p className="font-bold text-slate-900">{profile?.total_orders || 0} Orders</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Member Since
              </label>
              <p className="font-bold text-slate-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active Member'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Mobile Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="e.g. CSE, IT, ECE"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Year of Study</label>
                <select
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
