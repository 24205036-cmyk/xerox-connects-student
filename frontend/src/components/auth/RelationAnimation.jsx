import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Printer, GraduationCap, Briefcase, ShieldCheck,
  FileText, CheckCircle2, ArrowRight, Zap, Sparkles,
  Layers, Clock, RefreshCw, Smartphone
} from 'lucide-react';

export default function RelationAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  // Cycling sequence representing the relational flow: Student -> Hub -> Staff -> Pickup
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const flowStages = [
    { label: '1. Student submits document order', node: 'STUDENT', color: '#38bdf8' },
    { label: '2. Central Hub queues & processes files', node: 'HUB', color: '#818cf8' },
    { label: '3. Xerox Counter Staff receives & prints', node: 'STAFF', color: '#f59e0b' },
    { label: '4. Print ready for instant counter pickup', node: 'PICKUP', color: '#34d399' }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between relative select-none">
      
      {/* Top Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Connected Campus Ecosystem
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {/* Center Interactive Relational Diagram Area */}
      <div className="relative w-full my-auto py-6 flex items-center justify-center min-h-[380px]">
        
        {/* Animated Background Relational Circuit SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 500 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="purpleGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="emeraldGrad" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Relational Connector Lines */}
          {/* Top-Left (Student) -> Center (Hub) */}
          <path
            d="M 120 70 Q 180 130 250 200"
            stroke="url(#blueGrad)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          {/* Top-Right (Admin) -> Center (Hub) */}
          <path
            d="M 380 70 Q 320 130 250 200"
            stroke="url(#purpleGrad)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          {/* Bottom-Left (Staff) -> Center (Hub) */}
          <path
            d="M 120 330 Q 180 270 250 200"
            stroke="url(#amberGrad)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-60"
          />
          {/* Bottom-Right (Pickup) -> Center (Hub) */}
          <path
            d="M 380 330 Q 320 270 250 200"
            stroke="url(#emeraldGrad)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-60"
          />

          {/* Pulse Beams Moving between Nodes */}
          {/* 1. Student to Hub pulse */}
          <motion.circle
            r="4"
            fill="#38bdf8"
            filter="url(#glow)"
            initial={{ cx: 120, cy: 70 }}
            animate={{
              cx: [120, 180, 250],
              cy: [70, 130, 200],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* 2. Hub to Staff pulse */}
          <motion.circle
            r="4"
            fill="#fbbf24"
            filter="url(#glow)"
            initial={{ cx: 250, cy: 200 }}
            animate={{
              cx: [250, 180, 120],
              cy: [200, 270, 330],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />

          {/* 3. Hub to Pickup pulse */}
          <motion.circle
            r="4"
            fill="#34d399"
            filter="url(#glow)"
            initial={{ cx: 250, cy: 200 }}
            animate={{
              cx: [250, 320, 380],
              cy: [200, 270, 330],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          />

          {/* 4. Admin monitoring beam */}
          <motion.circle
            r="4"
            fill="#c084fc"
            filter="url(#glow)"
            initial={{ cx: 380, cy: 70 }}
            animate={{
              cx: [380, 320, 250],
              cy: [70, 130, 200],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          />
        </svg>

        {/* ── 1. TOP-LEFT NODE: STUDENT ── */}
        <motion.div
          animate={{
            y: [0, -6, 0],
            scale: activeStep === 0 ? 1.05 : 1
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-2 left-0 sm:left-4 p-3 rounded-2xl border transition-all duration-500 shadow-xl backdrop-blur-xl ${
            activeStep === 0
              ? 'bg-blue-900/60 border-blue-400 ring-2 ring-blue-500/30'
              : 'bg-slate-900/70 border-white/15'
          }`}
          style={{ width: '155px' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Student</h4>
              <p className="text-[10px] text-blue-300 font-mono">Upload & Order</p>
            </div>
          </div>
          <div className="mt-2 text-[9px] text-slate-300 bg-white/5 px-2 py-1 rounded-lg flex items-center justify-between border border-white/5">
            <span>Documents</span>
            <span className="text-blue-400 font-bold">PDF / Word</span>
          </div>
        </motion.div>

        {/* ── 2. TOP-RIGHT NODE: ADMIN ── */}
        <motion.div
          animate={{
            y: [0, -5, 0],
            scale: 1
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-2 right-0 sm:right-4 p-3 rounded-2xl bg-slate-900/70 border border-white/15 shadow-xl backdrop-blur-xl"
          style={{ width: '155px' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Campus Admin</h4>
              <p className="text-[10px] text-purple-300 font-mono">Audits & Reports</p>
            </div>
          </div>
          <div className="mt-2 text-[9px] text-slate-300 bg-white/5 px-2 py-1 rounded-lg flex items-center justify-between border border-white/5">
            <span>Control</span>
            <span className="text-purple-400 font-bold">Live Oversight</span>
          </div>
        </motion.div>

        {/* ── 3. CENTER NODE: XEROXPRESS CENTRAL HUB ── */}
        <div className="relative z-10">
          {/* Animated Glowing Outer Ring */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.04, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }}
            className="w-32 h-32 rounded-full border border-dashed border-indigo-400/40 absolute -inset-3 pointer-events-none"
          />

          {/* Active Pulse Wave */}
          <div className="w-28 h-28 rounded-full border border-blue-400/30 animate-ping absolute -inset-1 pointer-events-none opacity-20" />

          {/* Central Hub Core Card */}
          <motion.div
            animate={{
              scale: activeStep === 1 ? 1.08 : 1
            }}
            transition={{ duration: 0.4 }}
            className={`w-26 h-26 rounded-3xl p-3 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-2xl transition-all duration-500 border ${
              activeStep === 1
                ? 'bg-gradient-to-b from-indigo-900/90 to-slate-900/90 border-indigo-400 shadow-indigo-500/40 ring-4 ring-indigo-500/20'
                : 'bg-slate-900/90 border-white/20 shadow-black/60'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 mb-1">
              <Printer className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[11px] font-black text-white tracking-tight leading-tight block">
              Xero<span className="text-blue-400">Xpress</span>
            </span>
            <span className="text-[9px] font-mono text-indigo-300">Central Hub</span>
          </motion.div>
        </div>

        {/* ── 4. BOTTOM-LEFT NODE: XEROX COUNTER OPERATOR ── */}
        <motion.div
          animate={{
            y: [0, -6, 0],
            scale: activeStep === 2 ? 1.05 : 1
          }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className={`absolute bottom-2 left-0 sm:left-4 p-3 rounded-2xl border transition-all duration-500 shadow-xl backdrop-blur-xl ${
            activeStep === 2
              ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/30'
              : 'bg-slate-900/70 border-white/15'
          }`}
          style={{ width: '155px' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30 shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Xerox Staff</h4>
              <p className="text-[10px] text-amber-300 font-mono">Print Queue</p>
            </div>
          </div>
          <div className="mt-2 text-[9px] text-slate-300 bg-white/5 px-2 py-1 rounded-lg flex items-center justify-between border border-white/5">
            <span>Speed</span>
            <span className="text-amber-400 font-bold">Fast Dispatch</span>
          </div>
        </motion.div>

        {/* ── 5. BOTTOM-RIGHT NODE: PICKUP DOCUMENT ── */}
        <motion.div
          animate={{
            y: [0, -5, 0],
            scale: activeStep === 3 ? 1.05 : 1
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          className={`absolute bottom-2 right-0 sm:right-4 p-3 rounded-2xl border transition-all duration-500 shadow-xl backdrop-blur-xl ${
            activeStep === 3
              ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/30'
              : 'bg-slate-900/70 border-white/15'
          }`}
          style={{ width: '155px' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Ready Prints</h4>
              <p className="text-[10px] text-emerald-300 font-mono">Counter Pickup</p>
            </div>
          </div>
          <div className="mt-2 text-[9px] text-slate-300 bg-white/5 px-2 py-1 rounded-lg flex items-center justify-between border border-white/5">
            <span>Status</span>
            <span className="text-emerald-400 font-bold">Zero Queuing</span>
          </div>
        </motion.div>

      </div>

      {/* Relational Flow Step Tracker Banner */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Platform Flow:</span>
          <span className="font-bold text-white flex items-center gap-1.5" style={{ color: flowStages[activeStep].color }}>
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            {flowStages[activeStep].label}
          </span>
        </div>

        {/* Progress Dots */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {flowStages.map((stage, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                activeStep === idx
                  ? 'bg-blue-400 shadow-sm shadow-blue-400/50'
                  : idx < activeStep
                  ? 'bg-indigo-600/60'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
