import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';

const stages = [
  'Extracting document content...',
  'Processing typography & layouts...',
  'Compiling output document...',
  'Finalizing & preparing file storage...'
];

export default function ConversionProgress({
  filename = 'document.pdf',
  mode = 'PDF_TO_WORD'
}) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const targetExt = mode === 'PDF_TO_WORD' ? '.docx' : '.pdf';

  return (
    <div className="p-8 sm:p-12 rounded-3xl clay-card-light border border-blue-300 text-center space-y-6 shadow-xl animate-in fade-in">
      <div className="relative w-16 h-16 mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-pulse">
          <Zap className="w-8 h-8" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-blue-400/30 animate-ping opacity-25 pointer-events-none" />
      </div>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
          High-Speed Engine Active
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Converting & Saving Your Document...
        </h3>
        <p className="text-xs sm:text-sm font-mono text-slate-600">
          {filename} <span className="text-blue-500 font-bold">➔</span> {filename.replace(/\.[^/.]+$/, '') + '_converted' + targetExt}
        </p>
      </div>

      {/* Progress Stage Tracker */}
      <div className="max-w-md mx-auto p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-800">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>{stages[currentStageIdx]}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStageIdx + 1) / stages.length) * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 font-sans">The converted file will automatically download to your computer.</p>
      </div>
    </div>
  );
}
