import React from 'react';
import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ConversionCard({
  type = 'PDF_TO_WORD', // 'PDF_TO_WORD' | 'WORD_TO_PDF'
  isSelected = false,
  onSelect
}) {
  const isPdfToWord = type === 'PDF_TO_WORD';

  return (
    <div
      onClick={onSelect}
      className={`relative p-6 sm:p-7 rounded-3xl transition-all cursor-pointer border group flex flex-col justify-between ${
        isSelected
          ? isPdfToWord
            ? 'bg-blue-50/50 border-blue-500 shadow-md scale-[1.01] ring-2 ring-blue-500/20'
            : 'bg-indigo-50/50 border-indigo-500 shadow-md scale-[1.01] ring-2 ring-indigo-500/20'
          : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
      }`}
    >
      {/* Selected Indicator Checkmark */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      <div>
        {/* Top Badges & Normal Clean Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isPdfToWord 
              ? 'bg-rose-50 border-rose-200 text-rose-600' 
              : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}>
            <FileText className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {isPdfToWord ? 'PDF ➔ DOCX' : 'DOCX ➔ PDF'}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {isPdfToWord ? 'PDF → Word' : 'Word → PDF'}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
          {isPdfToWord
            ? 'Convert your PDF document into an editable Microsoft Word (.docx) file with preserved paragraphs, formatting, and tables.'
            : 'Convert your Word document (.doc, .docx) into a high quality, print-ready PDF for clean assignment submission.'}
        </p>

        {/* Formats Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5 text-[11px] font-mono">
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            Source: <strong className="text-slate-900">{isPdfToWord ? '.pdf' : '.doc, .docx'}</strong>
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            Output: <strong className="text-emerald-700">{isPdfToWord ? '.docx' : '.pdf'}</strong>
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
          isSelected
            ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
        }`}
      >
        <span>{isPdfToWord ? 'Convert PDF to Word' : 'Convert Word to PDF'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
