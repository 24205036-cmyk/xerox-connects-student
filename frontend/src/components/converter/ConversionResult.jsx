import React from 'react';
import { 
  CheckCircle2, Download, RefreshCw, FileText, 
  ArrowRight, Printer, FolderDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConversionResult({
  originalFilename = 'document.pdf',
  originalSize = '2.4 MB',
  convertedFilename = 'document_converted.docx',
  convertedSize = '1.8 MB',
  convertedBlob = null,
  mode = 'PDF_TO_WORD',
  onReset
}) {
  const navigate = useNavigate();
  const isPdfToWord = mode === 'PDF_TO_WORD';

  const handleDownload = () => {
    if (!convertedBlob) return;

    try {
      const url = URL.createObjectURL(convertedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = convertedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handlePrintConvertedPdf = () => {
    if (convertedBlob && !isPdfToWord) {
      const file = new File([convertedBlob], convertedFilename, { type: 'application/pdf' });
      navigate('/student/new-order', { state: { preloadedFile: file } });
    } else {
      navigate('/student/new-order');
    }
  };

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-emerald-200 text-center space-y-6 shadow-xs animate-in zoom-in-95">
      {/* Normal Clean Success Icon */}
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-200">
          Conversion Complete ✓
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Your Document is Ready & Saved!
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          The converted document was stored into your computer's <strong>Downloads</strong> folder. If your browser blocked the auto-download, click the button below.
        </p>
      </div>

      {/* Comparison Details Card */}
      <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
        <div className="flex items-center justify-between py-1 border-b border-slate-200">
          <span className="text-slate-500">Original Document:</span>
          <span className="font-mono text-slate-800 font-bold truncate max-w-[200px]">{originalFilename}</span>
        </div>
        <div className="flex items-center justify-between py-1 border-b border-slate-200">
          <span className="text-slate-500">Converted Document:</span>
          <span className="font-mono text-emerald-700 font-black truncate max-w-[200px]">{convertedFilename}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-slate-500">Format:</span>
          <span className="font-bold text-slate-900">
            {isPdfToWord ? 'Microsoft Word (.docx)' : 'Adobe PDF (.pdf)'}
          </span>
        </div>
      </div>

      {/* Primary Download CTA */}
      <div className="max-w-md mx-auto space-y-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Download {isPdfToWord ? 'Word Document (.docx)' : 'PDF Document (.pdf)'}</span>
        </button>

        <div className="flex items-center justify-center gap-3 pt-2 text-xs">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Convert Another File
          </button>

          {!isPdfToWord && (
            <button
              type="button"
              onClick={handlePrintConvertedPdf}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" /> Print at Campus Xerox
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
