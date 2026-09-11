import React, { useState } from 'react';
import { Document, IntegrityCheckResult } from '../types.js';
import { ShieldCheck, AlertTriangle, CheckCircle2, X, RefreshCw, Hash, Binary, Cpu, Layers } from 'lucide-react';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

interface IntegrityCheckModalProps {
  document: Document | null;
  onClose: () => void;
  token: string | null;
  onVerificationComplete?: (docId: string, status: 'VERIFIED' | 'INTEGRITY_WARNING') => void;
}

type VerificationStage = 'IDLE' | 'SCANNING' | 'CALCULATING' | 'COMPARING' | 'RESULT';

export const IntegrityCheckModal: React.FC<IntegrityCheckModalProps> = ({
  document,
  onClose,
  token,
  onVerificationComplete,
}) => {
  const [stage, setStage] = useState<VerificationStage>('IDLE');
  const [result, setResult] = useState<IntegrityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulateTamper, setSimulateTamper] = useState(false);

  if (!document) return null;

  const handleRunVerification = async () => {
    setError(null);
    setResult(null);

    // 1. SCANNING Stage
    setStage('SCANNING');
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 2. CALCULATING HASH Stage
    setStage('CALCULATING');
    await new Promise((resolve) => setTimeout(resolve, 700));

    // 3. COMPARING Stage
    setStage('COMPARING');
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const res = await fetch(`/api/documents/${document.id}/verify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ simulateMismatch: simulateTamper }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Failed to complete cryptographic verification.');
        setStage('IDLE');
        return;
      }

      const data: IntegrityCheckResult = await res.json();
      setResult(data);
      setStage('RESULT');

      if (onVerificationComplete) {
        onVerificationComplete(
          document.id,
          data.status === 'VERIFIED' ? 'VERIFIED' : 'INTEGRITY_WARNING'
        );
      }
    } catch (err) {
      console.error(err);
      setError('Network verification error.');
      setStage('IDLE');
    }
  };

  return (
    <div
      id="integrity-verification-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0B1220] border border-slate-700 shadow-2xl text-slate-100 p-4 sm:p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                Verify Document Integrity
              </h3>
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono truncate block">
                Cryptographic SHA-256 Ledger Audit • BSA 2023 Sec 63
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 sm:py-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#070C18] border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between text-xs gap-0.5">
              <span className="text-slate-400">File Name:</span>
              <span className="font-semibold text-slate-200 break-words">{document.fileName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-xs gap-0.5">
              <span className="text-slate-400">Document ID:</span>
              <span className="font-mono text-slate-300">{document.id}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-xs gap-0.5">
              <span className="text-slate-400">Registered Hash (SHA-256):</span>
              <span className="font-mono text-amber-400/90 break-all select-all">
                {document.sha256Hash}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-400">Current Status:</span>
              <span
                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                  document.status === 'VERIFIED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : document.status === 'INTEGRITY_WARNING'
                    ? 'bg-red-950 text-red-300 border border-red-500/30'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                }`}
              >
                {document.status === 'VERIFIED'
                  ? '✓ INTEGRITY VERIFIED'
                  : document.status === 'INTEGRITY_WARNING'
                  ? '⚠ INTEGRITY WARNING'
                  : 'PENDING VERIFICATION'}
              </span>
            </div>
          </div>

          {/* Animated Workflow Process Tracker */}
          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-mono mb-2">
              <span className="text-slate-400">VERIFICATION WORKFLOW</span>
              <span className="text-amber-400 font-bold">{stage}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'SCANNING', label: '1. SCANNING', icon: Binary },
                { key: 'CALCULATING', label: '2. HASHING', icon: Cpu },
                { key: 'COMPARING', label: '3. COMPARING', icon: Layers },
                { key: 'RESULT', label: '4. RESULT', icon: ShieldCheck },
              ].map((step) => {
                const Icon = step.icon;
                const isCurrent = stage === step.key;
                const isPast =
                  (stage === 'CALCULATING' && step.key === 'SCANNING') ||
                  (stage === 'COMPARING' && (step.key === 'SCANNING' || step.key === 'CALCULATING')) ||
                  stage === 'RESULT';

                return (
                  <div
                    key={step.key}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/40 animate-pulse'
                        : isPast
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/50 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Result Card */}
          {stage === 'RESULT' && result && (
            <div
              className={`p-4 rounded-xl border ${
                result.isMatch
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2 font-bold text-sm">
                {result.isMatch ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 font-sans text-base">{result.verdict}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                    <span className="text-red-300 font-sans text-base">{result.verdict}</span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-200 font-medium mb-3">
                {result.message}
              </p>

              <div className="space-y-1.5 text-xs">
                <div className="font-mono text-[11px] break-all bg-black/50 p-2.5 rounded border border-slate-800 space-y-2">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Stored Hash:</span>
                    <span className="text-slate-300 select-all">{result.storedHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Calculated Hash:</span>
                    <span className={`select-all font-semibold ${result.isMatch ? 'text-emerald-300' : 'text-red-300'}`}>
                      {result.calculatedHash}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between text-[11px] text-slate-300 pt-1 gap-1">
                  <span>Verified By: {result.verifiedBy} ({result.verificationOfficerRole})</span>
                  <span>Match: {result.isMatch ? 'YES (Intact)' : 'NO (Disparity)'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Simulation Toggle & Action Trigger */}
          {stage !== 'RESULT' && (
            <div className="space-y-4 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer select-none bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <input
                  type="checkbox"
                  checked={simulateTamper}
                  onChange={(e) => setSimulateTamper(e.target.checked)}
                  className="rounded border-slate-700 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Simulate Bit-Level Tampering (Tests hash disparity and warning workflow)</span>
              </label>

              <div className="text-center">
                <button
                  type="button"
                  disabled={stage !== 'IDLE'}
                  onClick={handleRunVerification}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-60 transition-all"
                >
                  {stage !== 'IDLE' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying ({stage})...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Integrity Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-500">
            {stage === 'RESULT' ? 'Audit log generated' : 'Only Admin, Legal Officer, and Advocate can verify'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
