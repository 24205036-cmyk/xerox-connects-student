import React from 'react';
import { Clock, CheckCircle2, Printer, PackageCheck, Check, XCircle } from 'lucide-react';

const statusConfig = {
  PENDING: {
    label: 'Pending Approval',
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    icon: Clock,
    pulse: true
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    icon: CheckCircle2,
    pulse: false
  },
  PRINTING: {
    label: 'Printing in Progress',
    className: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    icon: Printer,
    pulse: true
  },
  READY: {
    label: 'Ready for Pickup',
    className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold shadow-sm shadow-emerald-950/40',
    icon: PackageCheck,
    pulse: true
  },
  COLLECTED: {
    label: 'Collected',
    className: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    icon: Check,
    pulse: false
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    icon: XCircle,
    pulse: false
  }
};

export default function StatusBadge({ status = 'PENDING', className = '' }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-colors ${config.className} ${className}`}
    >
      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${config.pulse ? 'animate-pulse' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
}
