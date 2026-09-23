import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Printer, Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RelationAnimation from '../components/auth/RelationAnimation';

export default function LoginPage() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.identifier.trim() || !formData.password) {
      setErrorMsg('Please enter your email or register number and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass credentials to login; backend automatically detects role
      const user = await login(formData.identifier.trim(), formData.password);

      const fromPath = location.state?.from?.pathname;
      if (fromPath && !fromPath.startsWith('/login') && !fromPath.startsWith('/register')) {
        navigate(fromPath, { replace: true });
      } else {
        if (user.role === 'STUDENT') {
          navigate('/student', { replace: true });
        } else if (user.role === 'XEROX_STAFF') {
          navigate('/staff', { replace: true });
        } else if (user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden">

      {/* ── LEFT PANEL (Relational Ecosystem Animation) ─────── */}
      <div
        className="hidden lg:flex lg:w-[50%] xl:w-[48%] h-full flex-col justify-between p-8 xl:p-10 relative overflow-hidden bg-[#0a0a0c] border-r border-white/5"
      >
        {/* Clean Luxury Studio Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 35%, #18191f 0%, #0e0f12 65%, #08080a 100%)',
          }}
        />

        {/* Header Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 text-white"
          >
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-white font-black text-xl tracking-tight block leading-tight">
              Xero<span className="text-blue-400">Xpress</span>
            </span>
            <span className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase">
              Digital Print System
            </span>
          </div>
        </div>

        {/* ── The Relational Animation Component (Extended Full-Height) ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full my-auto">
          <RelationAnimation />
        </div>
      </div>

      {/* ── RIGHT PANEL (Unified Sign In Form) ─────────────── */}
      <div className="flex-1 h-full flex items-center justify-center px-6 py-8 relative overflow-y-auto">
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 75% 25%, rgba(48, 113, 217, 0.06) 0%, transparent 65%)',
          }}
        />

        {/* ── Xerox Machine Console "Return Home" Key ── */}
        <div className="absolute top-6 right-6 z-30">
          <Link
            to="/"
            id="xerox-console-home-btn"
            className="group relative inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 text-white font-mono text-xs border border-slate-700/80 hover:border-cyan-400/70 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_25px_-4px_rgba(14,165,233,0.35),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-300 active:translate-y-0.5 active:scale-95 overflow-hidden select-none"
            title="Return to Home"
          >
            {/* Xerox Laser Platen Scan Line (Sweeps across on hover) */}
            <span className="absolute inset-y-0 -left-16 w-12 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent -skew-x-12 transform group-hover:translate-x-64 transition-transform duration-700 ease-out pointer-events-none" />

            {/* Hardware Status LED */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            </span>

            {/* Machine Key Icon */}
            <div className="w-6 h-6 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-400/40 transition-colors shadow-inner">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </div>

            {/* Xerox Console Typography */}
            <span className="text-xs font-semibold text-slate-100 group-hover:text-white tracking-wide pr-1">
              Home
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md relative z-10 space-y-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">Xero<span className="text-blue-600">Xpress</span></span>
          </div>

          {/* Heading */}
          <div className="text-center sm:text-left space-y-1.5">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-600">
              Sign in to continue to your account.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Authentication Notice</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Unified Sign In Form Card */}
          <div className="p-7 sm:p-9 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address or Register Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. xxx@college.edu.in"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Single Unified Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Registration Link */}
          <p className="text-center text-xs text-slate-500">
            New to XeroXpress?{' '}
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              Create a student account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}


