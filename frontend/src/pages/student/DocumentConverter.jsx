import React, { useState } from 'react';
import { 
  FileText, Sparkles, ArrowRight, RefreshCw, 
  CheckCircle2, Download, History, Clock, FileCode2, Info, ArrowLeft, AlertCircle 
} from 'lucide-react';
import Converter3DScene from '../../components/converter/Converter3DScene';
import ConversionCard from '../../components/converter/ConversionCard';
import FileDropzone from '../../components/converter/FileDropzone';
import ConversionProgress from '../../components/converter/ConversionProgress';
import ConversionResult from '../../components/converter/ConversionResult';
import { convertPdfToWordApi, convertWordToPdfApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function DocumentConverter() {
  const [conversionMode, setConversionMode] = useState('PDF_TO_WORD'); // 'PDF_TO_WORD' | 'WORD_TO_PDF'
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep] = useState('UPLOAD'); // 'UPLOAD' | 'CONVERTING' | 'RESULT'
  const [convertedBlob, setConvertedBlob] = useState(null);
  const [convertedFilename, setConvertedFilename] = useState('');
  const [convertedSize, setConvertedSize] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState([]);
  const { showToast } = useToast();

  const handleStartConversion = async () => {
    if (!selectedFile) {
      showToast('Please select or drop a file to convert.', 'warning');
      return;
    }

    setErrorMessage('');
    setStep('CONVERTING');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      let responseBlob;
      const targetExt = conversionMode === 'PDF_TO_WORD' ? '.docx' : '.pdf';
      const outputName = selectedFile.name.replace(/\.[^/.]+$/, '') + '_converted' + targetExt;

      if (conversionMode === 'PDF_TO_WORD') {
        responseBlob = await convertPdfToWordApi(formData);
      } else {
        responseBlob = await convertWordToPdfApi(formData);
      }

      const blobData = responseBlob.data || responseBlob;
      setConvertedBlob(blobData);
      setConvertedFilename(outputName);
      setConvertedSize(formatFileSize(blobData.size || selectedFile.size));

      // Append to session history
      const newEntry = {
        id: Date.now(),
        filename: selectedFile.name,
        outputName: outputName,
        type: conversionMode === 'PDF_TO_WORD' ? 'PDF → Word' : 'Word → PDF',
        date: 'Just now',
        status: 'Completed',
        blob: blobData
      };
      setHistory((prev) => [newEntry, ...prev]);

      // Automatically store/save converted file to user's device
      try {
        const downloadUrl = URL.createObjectURL(blobData);
        const autoLink = document.createElement('a');
        autoLink.href = downloadUrl;
        autoLink.download = outputName;
        document.body.appendChild(autoLink);
        autoLink.click();
        document.body.removeChild(autoLink);
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 3000);
      } catch (saveErr) {
        console.warn('Auto-save file trigger warning:', saveErr);
      }

      setStep('RESULT');
      showToast('Document converted and saved successfully!', 'success');
    } catch (err) {
      let parsedMsg = 'Failed to convert document. Please check that the file is not empty or corrupted.';
      
      // If error payload is wrapped in a Blob
      if (err.data instanceof Blob) {
        try {
          const text = await err.data.text();
          const json = JSON.parse(text);
          if (json?.message) parsedMsg = json.message;
        } catch (_) {}
      } else if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json?.message) parsedMsg = json.message;
        } catch (_) {}
      } else if (err.message) {
        parsedMsg = err.message;
      }

      setErrorMessage(parsedMsg);
      showToast(parsedMsg, 'error', 6000);
      setStep('UPLOAD');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setConvertedBlob(null);
    setConvertedFilename('');
    setConvertedSize('');
    setErrorMessage('');
    setStep('UPLOAD');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.5 MB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownloadHistoryItem = (item) => {
    if (!item.blob) {
      showToast('This session file has expired.', 'info');
      return;
    }
    try {
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (err) {
      console.error('History download error:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl clay-card-light border border-slate-200 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Independent Document Utility Module
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Document <span className="text-blue-600">Converter</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          <strong className="text-slate-900">Convert. Download. Done.</strong> Convert your academic documents between PDF and Word in seconds without external tools.
        </p>
      </div>

      {/* 3D Visual Scene */}
      <Converter3DScene mode={conversionMode} isConverting={step === 'CONVERTING'} />

      {/* Error Alert Display */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-bold text-white">Conversion Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Conversion Interface */}
      {step === 'UPLOAD' && (
        <div className="space-y-6">
          {/* 1. Mode Selection Cards */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Choose Conversion Direction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ConversionCard
                type="PDF_TO_WORD"
                isSelected={conversionMode === 'PDF_TO_WORD'}
                onSelect={() => {
                  setConversionMode('PDF_TO_WORD');
                  setSelectedFile(null);
                  setErrorMessage('');
                }}
              />
              <ConversionCard
                type="WORD_TO_PDF"
                isSelected={conversionMode === 'WORD_TO_PDF'}
                onSelect={() => {
                  setConversionMode('WORD_TO_PDF');
                  setSelectedFile(null);
                  setErrorMessage('');
                }}
              />
            </div>
          </div>

          {/* 2. File Upload Dropzone */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Upload Your {conversionMode === 'PDF_TO_WORD' ? 'PDF' : 'Word'} Document
            </h2>
            <FileDropzone
              mode={conversionMode}
              file={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                setErrorMessage('');
              }}
              onFileRemove={() => setSelectedFile(null)}
              maxSizeMB={25}
            />
          </div>

          {/* Convert CTA */}
          {selectedFile && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleStartConversion}
                className="px-8 py-3.5 clay-btn-primary text-white font-bold text-sm shadow-xl flex items-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Convert to {conversionMode === 'PDF_TO_WORD' ? 'Word Document (.docx)' : 'PDF Document (.pdf)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Conversion In Progress Stage */}
      {step === 'CONVERTING' && (
        <ConversionProgress
          filename={selectedFile?.name || 'document.pdf'}
          mode={conversionMode}
        />
      )}

      {/* Conversion Result Stage */}
      {step === 'RESULT' && selectedFile && (
        <ConversionResult
          originalFilename={selectedFile.name}
          originalSize={formatFileSize(selectedFile.size)}
          convertedFilename={convertedFilename}
          convertedSize={convertedSize}
          convertedBlob={convertedBlob}
          mode={conversionMode}
          onReset={handleReset}
        />
      )}

      {/* Lightweight Conversion History */}
      {history.length > 0 && (
        <div className="p-6 rounded-3xl clay-card-light space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Conversions (This Session)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Auto-cleared on logout</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-mono">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-sans">
                <tr>
                  <th className="py-2.5 px-3">Original File</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Converted Output</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-slate-900 font-mono">{h.filename}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold">
                        {h.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-mono font-bold">{h.outputName}</td>
                    <td className="py-3 px-3 text-slate-500 text-xs">{h.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        ✓ {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDownloadHistoryItem(h)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
