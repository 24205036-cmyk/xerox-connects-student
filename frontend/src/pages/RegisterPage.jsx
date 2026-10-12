import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, BookOpen, GraduationCap, Lock,
  ArrowRight, AlertCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Scroll3dSlider from '../components/3d/Scroll3dSlider';

const DEPARTMENTS = [
  { value: 'CSE', label: 'Computer Science & Eng (CSE)' },
  { value: 'IT', label: 'Information Technology (IT)' },
  { value: 'ECE', label: 'Electronics & Comm (ECE)' },
  { value: 'EEE', label: 'Electrical & Electronics (EEE)' },
  { value: 'MECH', label: 'Mechanical Eng (MECH)' },
  { value: 'CIVIL', label: 'Civil Eng (CIVIL)' },
  { value: 'AI_DS', label: 'AI & Data Science (AI&DS)' },
  { value: 'MBA_MCA', label: 'Management / MCA' },
];

const YEARS = [
  { value: '1', label: '1st Year (Fresher)' },
  { value: '2', label: '2nd Year (Sophomore)' },
  { value: '3', label: '3rd Year (Junior)' },
  { value: '4', label: '4th Year (Final Year)' },
  { value: 'PG', label: 'Postgraduate' },
];

const SLIDER_SLIDES = [
  { image: '/carousel/mobile_campus_print.jpg' },
  { image: '/carousel/xerox_campus_queue.jpg' },
  { image: '/carousel/reg_press_production.jpg' },
  { image: '/carousel/reg_thesis_binding.jpg' },
  { image: '/carousel/organized_study_desk.jpg' },
  { image: '/carousel/glasscard_kiosk.jpg' },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    phone: '',
    department: 'CSE',
    year: '3',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/student', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared style helpers
  const inputBase = {
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    color: '#0f172a',
  };
  const onFocus = (e) => {
    e.target.style.borderColor = '#2563eb';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background = '#f8fafc';
    e.target.style.boxShadow = 'none';
  };
  const inputCls = 'w-full py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none';

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>

      {/* ── LEFT PANEL (Interactive 3D WebGL Scroll Slider - All Texts Removed) ── */}
      <div className="hidden lg:block lg:w-[46%] xl:w-[44%] relative overflow-hidden bg-[#080d1a] select-none">
        <Scroll3dSlider
          slides={SLIDER_SLIDES}
          direction="vertical"
          effectPreset="cards"
          backgroundColor="#080d1a"
          aspectRatio={1.42}
          slideHeight={2.35}
          slideGap={0.24}
          borderRadius={0.06}
          autoplay={true}
          autoplaySpeed={0.5}
          wheelSpeed={0.02}
          dragSpeed={0.015}
        />

        {/* Ambient Top & Bottom Vignette Shadows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(8,13,26,0.65) 0%, transparent 18%, transparent 82%, rgba(8,13,26,0.8) 100%)',
          }}
        />
      </div>

      {/* ── RIGHT PANEL (form) ──────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 65% 20%, rgba(37,99,235,0.05) 0%, transparent 70%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg relative z-10"
        >

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: '#0f172a' }}>XeroXpress</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#0f172a' }}>Create student account</h2>
            <p className="text-sm" style={{ color: '#64748b' }}>Fill in your college details to get started</p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div
              className="mb-5 p-3 rounded-xl flex items-start gap-2.5 text-xs"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form card */}
          <div
            className="p-7 rounded-3xl mb-5"
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Row 1: Name + Register Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    </div>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="e.g. XXXX YYYY"
                      value={formData.name}
                      onChange={set('name')}
                      className={`${inputCls} pl-10 pr-3.5`}
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Register Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <BookOpen className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    </div>
                    <input
                      id="reg-number"
                      type="text"
                      required
                      placeholder="e.g. 24xxxxx"
                      value={formData.registerNumber}
                      onChange={set('registerNumber')}
                      className={`${inputCls} pl-10 pr-3.5 uppercase`}
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>College Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="xxxxx@college.edu"
                      value={formData.email}
                      onChange={set('email')}
                      className={`${inputCls} pl-10 pr-3.5`}
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    </div>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      placeholder="9876543211"
                      value={formData.phone}
                      onChange={set('phone')}
                      className={`${inputCls} pl-10 pr-3.5`}
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Department + Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Department</label>
                  <select
                    id="reg-dept"
                    value={formData.department}
                    onChange={set('department')}
                    className={`${inputCls} px-3.5`}
                    style={{ ...inputBase, appearance: 'auto' }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Year of Study</label>
                  <select
                    id="reg-year"
                    value={formData.year}
                    onChange={set('year')}
                    className={`${inputCls} px-3.5`}
                    style={{ ...inputBase, appearance: 'auto' }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    {YEARS.map((y) => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Password + Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    </div>
                    <input
                      id="reg-password"
                      type={showPw ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={set('password')}
                      className={`${inputCls} pl-10 pr-10`}
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    </div>
                    <input
                      id="reg-confirm-password"
                      type={showCPw ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={set('confirmPassword')}
                      className={`${inputCls} pl-10 pr-10`}
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCPw(!showCPw)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                    >
                      {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                id="reg-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                  opacity: isSubmitting ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)';
                }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Creating Account…</>
                ) : (
                  <>Complete Registration<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs" style={{ color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#2563eb' }}>
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
