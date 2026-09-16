import React, { useState } from 'react';
import { Document, Role } from '../types.js';
import { X, ShieldCheck, Download, Copy, Check, FileText, Lock, Calendar, Hash, UserCheck, Scale, Award } from 'lucide-react';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

interface DocumentModalProps {
  document: Document | null;
  onClose: () => void;
  userRole: Role;
  onDownload?: (doc: Document) => void;
  onVerifyIntegrity?: (doc: Document) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document,
  onClose,
  userRole,
  onDownload,
  onVerifyIntegrity,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'preview'>('metadata');

  if (!document) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(document.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      id="document-inspection-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-full sm:max-w-2xl max-h-modal flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0D1424] border border-slate-700 shadow-2xl text-slate-100 overflow-hidden overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-[#070B16]/90">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] xs:max-w-xs sm:max-w-md">
                  {document.fileName}
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  v{document.version}.0
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono truncate block">
                ID: {document.id} • Case: {document.caseId}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center px-4 sm:px-6 border-b border-slate-800 bg-[#090F1C] text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'metadata'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital Metadata & SHA-256
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Document Text Preview
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {activeTab === 'metadata' ? (
            <>
              {/* Statutory BSA 2023 Sec 63 Seal */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-blue-950/40 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/40">
                    <AshokaChakraIcon size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">
                      Bharatiya Sakshya Adhiniyam, 2023 (Sec 63) Certified
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Cryptographically stamped digital evidentiary record with unbroken custody chain.
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
                  SEAL VALID
                </span>
              </div>

              {/* Cryptographic SHA-256 Hash Box */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-red-400" />
                    Cryptographic SHA-256 Digest
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-red-400 break-all select-all">
                  {document.sha256Hash}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Immutable evidentiary digest generated on upload. Altering even 1 bit changes this digest completely.
                </span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                    Document ID
                  </span>
                  <span className="font-mono font-semibold text-slate-200">{document.id}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                    Case Reference
                  </span>
                  <span className="font-mono font-semibold text-slate-200">{document.caseId}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                    Access Level
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] inline-block ${
                      document.accessLevel === 'SEALED'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : document.accessLevel === 'RESTRICTED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {document.accessLevel}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                    File Type & Size
                  </span>
                  <span className="font-medium text-slate-200">
                    {document.fileType} ({formatFileSize(document.fileSize)})
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                    Uploaded By
                  </span>
                  <span className="font-medium text-slate-200">
                    {document.uploadedBy} ({document.uploadedRole})
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                    Upload Date & Time
                  </span>
                  <span className="font-medium text-slate-200">{formatDate(document.uploadedDate)}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                  Legal Description
                </span>
                <p className="text-slate-300 leading-relaxed">{document.description}</p>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-2">
                --- BEGIN SECURE REPOSITORY PREVIEW ---
              </span>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {document.filePreviewText || 'Binary evidentiary file payload cryptographically encrypted.'}
              </pre>
              <span className="text-[11px] font-mono text-slate-400 block mt-2">
                --- END OF DOCUMENT ---
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800 bg-[#070B16]">
          <div className="text-[11px] text-slate-400 font-mono">
            {document.isOriginal ? '• Original Immutable File' : '• Version Record'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {(userRole === 'ADMIN' || userRole === 'LEGAL_OFFICER') && onVerifyIntegrity && (
              <button
                type="button"
                onClick={() => onVerifyIntegrity(document)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer min-h-[38px] flex-1 sm:flex-none"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Integrity</span>
              </button>
            )}

            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(document)}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer min-h-[38px] flex-1 sm:flex-none"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
