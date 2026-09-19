import React, { useRef, useState } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2, FileCode2 } from 'lucide-react';

export default function FileDropzone({
  mode = 'PDF_TO_WORD',
  file = null,
  onFileSelect,
  onFileRemove,
  maxSizeMB = 25
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const isPdfMode = mode === 'PDF_TO_WORD';
  const acceptedExts = isPdfMode ? ['.pdf'] : ['.doc', '.docx'];
  const acceptAttr = isPdfMode
    ? '.pdf,application/pdf'
    : '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const validateAndSetFile = (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return;

    // Check size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setErrorMsg(`File size exceeds maximum allowed limit of ${maxSizeMB}MB.`);
      return;
    }

    // Check extension
    const name = selectedFile.name.toLowerCase();
    const valid = isPdfMode
      ? name.endsWith('.pdf')
      : name.endsWith('.doc') || name.endsWith('.docx');

    if (!valid) {
      setErrorMsg(
        isPdfMode
          ? 'Invalid file type. Please upload a valid PDF (.pdf) file.'
          : 'Invalid file type. Please upload a Word (.doc or .docx) document.'
      );
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50 shadow-xs'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                validateAndSetFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-extrabold text-slate-900">
              Drag & Drop your {isPdfMode ? 'PDF' : 'Word'} file here
            </p>
            <p className="text-xs text-slate-500">
              or <span className="text-blue-600 font-bold underline">browse files</span> from your computer
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>Accepted: {acceptedExts.join(', ')}</span>
            <span>&bull;</span>
            <span>Max Size: {maxSizeMB} MB</span>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
              isPdfMode ? 'bg-rose-500' : 'bg-blue-600'
            }`}>
              {isPdfMode ? <FileText className="w-5 h-5" /> : <FileCode2 className="w-5 h-5" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>{formatFileSize(file.size)}</span>
                <span>&bull;</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ready for conversion
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onFileRemove}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors shrink-0 cursor-pointer"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
