import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2,
  Settings2, Plus, Minus, Info, ArrowRight, ArrowLeft,
  Sparkles, Layers, ShieldCheck, HelpCircle, FileCheck,
  FileCode2, CornerDownRight, IndianRupee, Loader2, RefreshCw,
  ShoppingCart, Package, CreditCard, SendHorizonal, Receipt, Smartphone
} from 'lucide-react';
import {
  getPrintPrices, uploadOrderFiles, deleteDraftFile,
  getStudentDashboard, getStationery, createOrder,
  convertWordToPdfApi
} from '../../services/api';
import RazorpayUpiModal from '../../components/payment/RazorpayUpiModal';

const STEPS = [
  { label: 'Upload PDFs', icon: UploadCloud },
  { label: 'Print Settings', icon: Settings2 },
  { label: 'Stationery', icon: ShoppingCart },
  { label: 'Review & Pay', icon: CreditCard },
];

export default function NewOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [pricingMap, setPricingMap] = useState({
    BLACK_WHITE_SINGLE_SIDE: 1.50,
    BLACK_WHITE_DOUBLE_SIDE: 2.00,
    COLOR_SINGLE_SIDE: 5.00,
    COLOR_DOUBLE_SIDE: 8.00
  });
  const [windowInfo, setWindowInfo] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Uploaded Files: [{ original_name, stored_filename, file_size, page_count, config: {...} }]
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Stationery
  const [stationeryCatalog, setStationeryCatalog] = useState([]);
  const [stationeryCart, setStationeryCart] = useState({}); // { id: quantity }
  const [isLoadingStationery, setIsLoadingStationery] = useState(false);

  // Payment
  const [paymentRef, setPaymentRef] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [upiInfo, setUpiInfo] = useState({ id: 'xeroxpress@okaxis', name: 'Campus Xerox Central' });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [verifiedPaymentData, setVerifiedPaymentData] = useState(null);

  // Load pricing, window, and fetch stationery
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingInitial(true);
      try {
        const [pricesRes, dashRes] = await Promise.all([
          getPrintPrices().catch(() => null),
          getStudentDashboard().catch(() => null)
        ]);
        if (pricesRes?.pricingMap) setPricingMap(pricesRes.pricingMap);
        if (dashRes?.data?.orderWindow) setWindowInfo(dashRes.data.orderWindow);
      } finally {
        setIsLoadingInitial(false);
      }
    };
    loadInitialData();
  }, []);

  const loadStationery = async () => {
    setIsLoadingStationery(true);
    try {
      const res = await getStationery();
      if (res?.stationery) setStationeryCatalog(res.stationery);
    } catch (_) { } finally {
      setIsLoadingStationery(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateEffectivePages = (totalPages, pageRangeStr) => {
    if (!pageRangeStr || pageRangeStr.trim().toUpperCase() === 'ALL') return totalPages || 1;
    try {
      const parts = pageRangeStr.split(',').map((p) => p.trim());
      const pageSet = new Set();
      for (const part of parts) {
        if (part.includes('-')) {
          const [s, e] = part.split('-').map(Number);
          if (!isNaN(s) && !isNaN(e)) {
            const min = Math.max(1, Math.min(s, e));
            const max = Math.min(totalPages || 100, Math.max(s, e));
            for (let p = min; p <= max; p++) pageSet.add(p);
          }
        } else {
          const n = Number(part);
          if (!isNaN(n) && n >= 1 && n <= (totalPages || 100)) pageSet.add(n);
        }
      }
      return pageSet.size > 0 ? pageSet.size : totalPages || 1;
    } catch { return totalPages || 1; }
  };

  const isOddRange = (rangeStr, total) => {
    if (!rangeStr || rangeStr.trim().toUpperCase() === 'ALL') return false;
    const expected = Array.from({ length: total || 1 }, (_, i) => i + 1).filter((p) => p % 2 !== 0).join(', ');
    return rangeStr.trim() === expected;
  };

  const isEvenRange = (rangeStr, total) => {
    if (!rangeStr || rangeStr.trim().toUpperCase() === 'ALL') return false;
    const expected = Array.from({ length: total || 1 }, (_, i) => i + 1).filter((p) => p % 2 === 0).join(', ');
    return rangeStr.trim() === expected;
  };

  const calculateFilePrice = (file) => {
    const copies = file.config.copies || 1;
    const ep = calculateEffectivePages(file.page_count, file.config.page_range);
    const key = `${file.config.print_type}_${file.config.side_type}`;
    const rate = pricingMap[key] || (file.config.print_type === 'COLOR' ? 5.00 : 1.50);
    return (ep * rate * copies).toFixed(2);
  };

  const totalPrintingCost = uploadedFiles.reduce((acc, f) => acc + parseFloat(calculateFilePrice(f)), 0);
  const totalSheetsEstimate = uploadedFiles.reduce((acc, f) => {
    const ep = calculateEffectivePages(f.page_count, f.config.page_range);
    const copies = f.config.copies || 1;
    const sheets = f.config.side_type === 'DOUBLE_SIDE' ? Math.ceil(ep / 2) : ep;
    return acc + sheets * copies;
  }, 0);

  const stationeryTotal = stationeryCatalog.reduce((acc, item) => {
    const qty = stationeryCart[item.id] || 0;
    return acc + parseFloat(item.price) * qty;
  }, 0);

  const grandTotal = totalPrintingCost + stationeryTotal;

  // ── Drag & Drop ───────────────────────────────────────────────────────────────

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files?.length > 0) handleFilesSelected(e.dataTransfer.files);
  };
  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) handleFilesSelected(e.target.files);
  };

  const handleFilesSelected = async (selectedFiles) => {
    setErrorMessage(null); setSuccessMessage(null);
    const validFiles = [];
    setIsUploading(true); setUploadProgress(10);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        let file = selectedFiles[i];
        const lowerName = file.name.toLowerCase();

        // If a Word file (.docx or .doc) is uploaded, auto-convert it to PDF on the fly
        if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
          setSuccessMessage(`Auto-converting "${file.name}" to PDF for printing...`);
          try {
            const convForm = new FormData();
            convForm.append('file', file);
            const convRes = await convertWordToPdfApi(convForm);
            const blob = convRes.data || convRes;
            const pdfName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
            file = new File([blob], pdfName, { type: 'application/pdf' });
          } catch (convErr) {
            setErrorMessage(`Could not convert "${file.name}" to PDF: ${convErr.message}`);
            setIsUploading(false); setUploadProgress(0);
            return;
          }
        }

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          setErrorMessage(`"${file.name}" is not a supported document. Only PDF and Word documents are accepted.`);
          setIsUploading(false); setUploadProgress(0);
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          setErrorMessage(`"${file.name}" exceeds the 50MB file size limit.`);
          setIsUploading(false); setUploadProgress(0);
          return;
        }
        validFiles.push(file);
      }

      if (uploadedFiles.length + validFiles.length > 10) {
        setErrorMessage('Maximum 10 documents per order.');
        setIsUploading(false); setUploadProgress(0);
        return;
      }
      if (validFiles.length === 0) {
        setIsUploading(false); setUploadProgress(0);
        return;
      }

      const formData = new FormData();
      validFiles.forEach((f) => formData.append('files', f));

      const res = await uploadOrderFiles(formData, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
      });
      if (res.status === 'success' && res.files) {
        setUploadedFiles((prev) => [...prev, ...res.files]);
        setSuccessMessage(`Successfully attached ${res.files.length} document(s).`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false); setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Preload file if transferred from Document Converter
  useEffect(() => {
    if (location.state?.preloadedFile) {
      const fileToLoad = location.state.preloadedFile;
      // Clear state so it doesn't repeat on re-render
      window.history.replaceState({}, document.title);
      handleFilesSelected([fileToLoad]);
    }
  }, [location.state]);

  const handleRemoveFile = async (idx) => {
    const f = uploadedFiles[idx];
    if (f.stored_filename) await deleteDraftFile(f.stored_filename).catch(() => { });
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFileConfig = (idx, field, value) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], config: { ...updated[idx].config, [field]: value } };
      return updated;
    });
  };

  // ── Stationery Cart ───────────────────────────────────────────────────────────

  const setQty = (id, qty) => {
    const item = stationeryCatalog.find((s) => s.id === id);
    if (!item) return;
    const maxQty = Math.min(qty, item.stock);
    setStationeryCart((prev) => {
      const next = { ...prev };
      if (maxQty <= 0) delete next[id]; else next[id] = maxQty;
      return next;
    });
  };

  // ── Submit Order ──────────────────────────────────────────────────────────────

  const handleSubmitOrder = async (customPaymentData = null) => {
    setErrorMessage(null);
    const payData = customPaymentData || verifiedPaymentData;
    const finalRef = payData?.payment_reference || paymentRef.trim();

    if (!finalRef) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const stationeryItems = Object.entries(stationeryCart).map(([id, qty]) => ({
        stationery_id: parseInt(id, 10),
        quantity: qty
      }));

      const payload = {
        files: uploadedFiles.map((f) => ({
          stored_filename: f.stored_filename,
          original_name: f.original_name,
          page_count: f.page_count,
          file_size: f.file_size,
          config: f.config
        })),
        stationery: stationeryItems,
        payment_reference: finalRef,
        razorpay_order_id: payData?.razorpay_order_id || null,
        payment_method: payData?.payment_method || 'RAZORPAY',
        payment_status: payData?.payment_status || (payData?.payment_reference ? 'PAID' : 'PENDING'),
        additional_instructions: additionalInstructions.trim() || null
      };

      const res = await createOrder(payload);
      if (res.status === 'success' && res.order?.id) {
        navigate(`/student/orders/${res.order.id}`, {
          state: { justCreated: true, orderNumber: res.order.order_number }
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setVerifiedPaymentData(paymentData);
    setPaymentRef(paymentData.payment_reference);
    setIsPaymentModalOpen(false);
    handleSubmitOrder(paymentData);
  };

  // ── Navigate between steps ────────────────────────────────────────────────────

  const goToStep = (step) => {
    if (currentStep === 2 && step > 2) {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const pr = uploadedFiles[i].config?.page_range;
        if (!pr || !pr.trim()) {
          setErrorMessage(`"Pages to Print" is required for Document #${i + 1} (${uploadedFiles[i].original_name}). Please enter 'ALL' or specific page numbers (e.g. 1-5).`);
          return;
        }
      }
    }
    if (step === 3 && stationeryCatalog.length === 0) loadStationery();
    setCurrentStep(step);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // ── Loading ────────────────────────────────────────────────────────────────────

  if (isLoadingInitial) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-medium">Initializing order  & loading print rates...</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Creation Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create New Xerox &amp; Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Upload your PDFs, customize page options and submit before today's batch closes.
          </p>
        </div>
        {windowInfo && (
          <div className="flex items-center gap-3 bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${windowInfo.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <div className="text-xs font-bold text-slate-900">{windowInfo.batchLabel} ({windowInfo.currentBatchDate})</div>
              <div className="text-[11px] text-slate-500">Time: {windowInfo.openTime} – {windowInfo.closeTime}</div>
            </div>
          </div>
        )}
      </div>

      {/* Step Wizard Progress Bar */}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const isLocked = stepNum === 1 ? false
            : stepNum === 2 ? uploadedFiles.length === 0
              : stepNum === 3 ? uploadedFiles.length === 0
                : uploadedFiles.length === 0;
          const Icon = step.icon;
          return (
            <div
              key={stepNum}
              onClick={() => !isLocked && goToStep(stepNum)}
              className={`rounded-2xl p-3 md:p-4 border transition-all duration-200 ${isLocked ? 'cursor-not-allowed opacity-40 bg-slate-50 border-slate-200 text-slate-400' : 'cursor-pointer'
                } ${isActive ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                  : isDone ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-indigo-600 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>Step {stepNum}</span>
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Icon className="w-3.5 h-3.5 text-slate-400" />}
              </div>
              <h4 className={`text-xs font-bold ${isActive ? 'text-indigo-950' : isDone ? 'text-emerald-900' : 'text-slate-800'}`}>{step.label}</h4>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-xs">
          <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-rose-600 shrink-0" /><span>{errorMessage}</span></div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800 text-xs font-bold shrink-0 cursor-pointer">Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-xs">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><span>{successMessage}</span></div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold shrink-0 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* ============================== STEP 1: UPLOAD ============================== */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-4 ${isDragOver ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' : 'border-slate-300 bg-white hover:bg-indigo-50/20 hover:border-indigo-400 shadow-xs'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf,.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{isUploading ? 'Uploading & analyzing documents...' : 'Click or drag documents here to upload'}</h3>
              <p className="text-xs text-slate-500 mt-1">Accepts PDF and Word (.docx/.doc) documents (Max 50MB per file, up to 10 files).</p>
            </div>
            {isUploading ? (
              <div className="w-full max-w-xs space-y-2 mt-2">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress || 20}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Uploading to secure server...</span><span>{uploadProgress}%</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Secure Server Storage</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-600" /> Automatic Page Scanner</span>
              </div>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><FileCheck className="w-4 h-4 text-emerald-600" /> Attached Documents ({uploadedFiles.length})</h3>
                <span className="text-xs text-slate-500">Ready for printing configuration</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-3 hover:border-indigo-300 transition shadow-xs">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{file.original_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700">{file.page_count} pages</span>
                          <span>•</span><span>{formatFileSize(file.file_size)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFile(idx)} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={() => goToStep(2)} className="px-6 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-sm rounded-2xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition cursor-pointer group">
                  <span>Proceed to Print Configuration</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================== STEP 2: PRINT CONFIG ============================== */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button onClick={() => goToStep(1)} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Upload
            </button>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Total Estimated Print Cost: </span>
              <span className="text-base font-black text-emerald-600">₹{totalPrintingCost.toFixed(2)}</span>
              <span className="text-[11px] text-slate-500 ml-2">({totalSheetsEstimate} sheets)</span>
            </div>
          </div>

          <div className="space-y-6">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">Doc #{idx + 1}</span>
                        <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs">{file.original_name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Total pages: <span className="text-slate-800 font-bold">{file.page_count}</span> · {formatFileSize(file.file_size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                    <span className="text-xs text-emerald-700 font-semibold">Estimated:</span>
                    <span className="text-sm font-black text-emerald-700">₹{calculateFilePrice(file)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Copies - Increment & Decrement Stepper Process */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>No. of Copies</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{file.config.copies || 1}x</span>
                    </label>
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateFileConfig(idx, 'copies', Math.max(1, (file.config.copies || 1) - 1))}
                        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition cursor-pointer border border-slate-200"
                        title="Decrement copies"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={file.config.copies || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateFileConfig(idx, 'copies', isNaN(val) ? 1 : Math.max(1, Math.min(100, val)));
                        }}
                        className="w-16 text-center font-black text-base text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded py-0.5 tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => updateFileConfig(idx, 'copies', Math.min(100, (file.config.copies || 1) + 1))}
                        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition cursor-pointer border border-slate-200"
                        title="Increment copies"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Quick Presets */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {[1, 2, 3, 5, 10].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => updateFileConfig(idx, 'copies', cnt)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition border cursor-pointer ${(file.config.copies || 1) === cnt
                              ? 'bg-[#4f46e5] text-white border-[#4f46e5] shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Print Mode */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Print Mode</span>
                      <span className="text-[10px] text-indigo-600 font-semibold">Color/B&amp;W</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['BLACK_WHITE', 'COLOR'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateFileConfig(idx, 'print_type', type)}
                          className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${file.config.print_type === type
                              ? 'bg-[#4f46e5] text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          <span>{type === 'BLACK_WHITE' ? 'B & W' : 'Color'}</span>
                          <span className="text-[10px] opacity-80">₹{pricingMap[`${type}_SINGLE_SIDE`]?.toFixed(2)}/pg</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sides */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Sides</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Duplex</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[['SINGLE_SIDE', 'Single Side'], ['DOUBLE_SIDE', 'Front & Back']].map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateFileConfig(idx, 'side_type', val)}
                          className={`py-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${file.config.side_type === val
                              ? 'bg-[#4f46e5] text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pages to Print - TYPED & NOT OPTIONAL */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>Pages to Print</span>
                        <span className="text-rose-500 font-black">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded tabular-nums">
                        {calculateEffectivePages(file.page_count, file.config.page_range)} pgs
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="e.g. ALL or 1-5, 8, 10"
                      value={file.config.page_range !== undefined ? file.config.page_range : 'ALL'}
                      onChange={(e) => updateFileConfig(idx, 'page_range', e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                    />

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateFileConfig(idx, 'page_range', 'ALL')}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition text-center cursor-pointer border ${(!file.config.page_range || file.config.page_range.trim().toUpperCase() === 'ALL')
                            ? 'bg-[#4f46e5] text-white border-[#4f46e5]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const total = file.page_count || 1;
                          const oddPages = Array.from({ length: total }, (_, i) => i + 1).filter((p) => p % 2 !== 0).join(', ');
                          updateFileConfig(idx, 'page_range', oddPages || '1');
                        }}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition text-center cursor-pointer border ${file.config.page_range && isOddRange(file.config.page_range, file.page_count)
                            ? 'bg-[#4f46e5] text-white border-[#4f46e5]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        Odd
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const total = file.page_count || 1;
                          const evenPages = Array.from({ length: total }, (_, i) => i + 1).filter((p) => p % 2 === 0).join(', ');
                          updateFileConfig(idx, 'page_range', evenPages || '2');
                        }}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition text-center cursor-pointer border ${file.config.page_range && isEvenRange(file.config.page_range, file.page_count)
                            ? 'bg-[#4f46e5] text-white border-[#4f46e5]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        Even
                      </button>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-tight">
                      Type exact pages or use chips above (Required)
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" /> Special Notes for Staff (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please staple top-left; Record submission; Print odd pages only"
                    value={file.config.instructions || ''}
                    onChange={(e) => updateFileConfig(idx, 'instructions', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <p className="text-sm font-bold text-slate-900">{uploadedFiles.length} PDF(s) configured</p>
              <p className="text-xs text-slate-500 mt-0.5">Next step: add stationery items (optional)</p>
            </div>
            <button onClick={() => goToStep(3)} className="px-6 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-sm rounded-2xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition cursor-pointer group">
              <span>Add Stationery</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ============================== STEP 3: STATIONERY ============================== */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button onClick={() => goToStep(2)} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Print Settings
            </button>
            {Object.keys(stationeryCart).length > 0 && (
              <div className="text-right">
                <span className="text-xs text-slate-500">Stationery subtotal: </span>
                <span className="text-sm font-extrabold text-indigo-600">₹{stationeryTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-indigo-600" /> Stationery &amp; Supplies
            </h2>
            <p className="text-xs text-slate-500">Add pens, sheets, folders, or binding kits to your order. Stationery is optional — skip if not needed.</p>
          </div>

          {isLoadingStationery ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stationeryCatalog.map((item) => {
                const qty = stationeryCart[item.id] || 0;
                return (
                  <div key={item.id} className={`p-4 rounded-2xl border transition-all ${qty > 0 ? 'bg-indigo-50/40 border-indigo-300 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-base font-extrabold text-slate-900">₹{parseFloat(item.price).toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">· {item.stock} in stock</span>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${qty > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                    </div>

                    {qty === 0 ? (
                      <button onClick={() => setQty(item.id, 1)}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> Add to Order
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-between bg-white border border-indigo-300 rounded-xl p-1 flex-1 shadow-2xs">
                          <button onClick={() => setQty(item.id, qty - 1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="text-sm font-bold text-slate-900">{qty}</span>
                          <button onClick={() => setQty(item.id, qty + 1)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">₹{(parseFloat(item.price) * qty).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-xs gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {Object.keys(stationeryCart).length > 0
                  ? `${Object.keys(stationeryCart).length} stationery type(s) added · ₹${stationeryTotal.toFixed(2)}`
                  : 'No stationery added (optional)'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Continue to review your complete order and make payment</p>
            </div>
            <button onClick={() => goToStep(4)} className="px-6 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-sm rounded-2xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition cursor-pointer whitespace-nowrap group">
              <span>Review &amp; Pay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ============================== STEP 4: REVIEW & PAYMENT ============================== */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button onClick={() => goToStep(3)} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Stationery
            </button>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Final review — double check before submitting</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Order Summary */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-indigo-600" /> Order Summary</h3>

              {/* Print Jobs */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Print Jobs ({uploadedFiles.length})</h4>
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{f.original_name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {calculateEffectivePages(f.page_count, f.config.page_range)} pages · {f.config.copies}x copies · {f.config.print_type === 'BLACK_WHITE' ? 'B&W' : 'Color'} · {f.config.side_type === 'SINGLE_SIDE' ? 'Single' : 'Double'} side
                      </p>
                      {f.config.instructions && <p className="text-[11px] text-indigo-600 mt-0.5 italic">"{f.config.instructions}"</p>}
                    </div>
                    <span className="text-sm font-bold text-emerald-600 shrink-0">₹{calculateFilePrice(f)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Print Subtotal</span>
                  <span className="text-sm font-extrabold text-slate-900">₹{totalPrintingCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Stationery */}
              {Object.keys(stationeryCart).length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Stationery</h4>
                  {stationeryCatalog.filter((s) => stationeryCart[s.id] > 0).map((item) => {
                    const qty = stationeryCart[item.id];
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-500">₹{parseFloat(item.price).toFixed(2)} × {qty}</p>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">₹{(parseFloat(item.price) * qty).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Stationery Subtotal</span>
                    <span className="text-sm font-extrabold text-slate-900">₹{stationeryTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Additional Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Overall Order Notes for Staff (Optional)</label>
                <textarea
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Please keep all documents sorted; Need this urgently for 10 AM lab"
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition resize-none shadow-2xs"
                />
              </div>
            </div>

            {/* Right: Payment */}
            <div className="lg:col-span-2 space-y-4">
              {/* Total Amount Card */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Order Total</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600"><span>Print Cost</span><span className="text-slate-900 font-semibold">₹{totalPrintingCost.toFixed(2)}</span></div>
                  {stationeryTotal > 0 && <div className="flex justify-between text-xs text-slate-600"><span>Stationery</span><span className="text-slate-900 font-semibold">₹{stationeryTotal.toFixed(2)}</span></div>}
                  <div className="border-t border-indigo-200/60 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Grand Total</span>
                    <span className="text-2xl font-black text-indigo-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* UPI Real-Time Payment */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Real-time UPI Payment
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    GPay &bull; PhonePe &bull; Paytm
                  </span>
                </div>

                {verifiedPaymentData ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>UPI Payment Verified Successfully!</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-mono">
                      Ref: {verifiedPaymentData.payment_reference} ({verifiedPaymentData.payment_method})
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-blue-300 uppercase tracking-wider">
                          Pay with Phone Number / UPI
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          ₹{grandTotal.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Enter your 10-digit mobile number linked to Google Pay, PhonePe, or Paytm to get an instant approval request on your phone.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition cursor-pointer hover:scale-[1.01]"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Pay ₹{grandTotal.toFixed(2)} with Phone Number</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200" />
                      <span className="flex-shrink mx-2 text-[10.5px] font-semibold text-slate-400 uppercase">Or Manual UTR</span>
                      <div className="flex-grow border-t border-slate-200" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Existing UPI Transaction Ref / UTR
                      </label>
                      <input
                        type="text"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="e.g. GPay-432819572334 or UTR number"
                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition font-mono ${
                          paymentRef.trim()
                            ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                            : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                        }`}
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={() => handleSubmitOrder()}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
                  ) : (
                    <><SendHorizonal className="w-4 h-4" /> Place Order — ₹{grandTotal.toFixed(2)}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Razorpay & UPI Payment Gateway Modal */}
      <RazorpayUpiModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={grandTotal}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
