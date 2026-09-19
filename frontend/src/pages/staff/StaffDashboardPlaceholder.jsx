import React from 'react';
import { Briefcase, ListOrdered, CheckCircle2, Printer, AlertCircle, Clock } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function StaffDashboardPlaceholder() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card border border-amber-500/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase mb-2">
            Phase 1 UI Shell Preview
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Xerox Staff Order Queue</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time queue for today's batch: print, staple, prepare stationery, and mark ready for student collection.
          </p>
        </div>
      </div>

      {/* Staff stats cards preview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-slate-400">Total Today</p>
          <p className="text-2xl font-bold text-white mt-1">42</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-amber-400">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">8</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-blue-400">Accepted</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">4</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-purple-400">Printing</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">5</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-emerald-400">Ready</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">10</p>
        </div>
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <p className="text-xs text-slate-500">Collected</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">15</p>
        </div>
      </div>

      {/* Shell Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Phase 1 Foundation & UI Shell Active:</strong>
          <p className="mt-1 leading-relaxed">
            Live order queue handling, file download links, and one-click status transitions (Accept &rarr; Printing &rarr; Ready &rarr; Collected) will be fully connected in Phase 10.
          </p>
        </div>
      </div>
    </div>
  );
}
