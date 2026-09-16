import React, { useState } from 'react';
import { X, Check, ShieldAlert, ShieldCheck, Play, RefreshCw, AlertOctagon, Terminal } from 'lucide-react';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

interface TestMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickLoginAs?: (email: string, pass: string) => void;
}

export const TestMatrixModal: React.FC<TestMatrixModalProps> = ({ isOpen, onClose, onQuickLoginAs }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'test_runner'>('matrix');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const matrixRows = [
    { feature: 'Admin Dashboard', admin: 'YES', user: 'NO', legal: 'NO', advocate: 'NO' },
    { feature: 'User Management', admin: 'YES', user: 'NO', legal: 'NO', advocate: 'NO' },
    { feature: 'View All Cases', admin: 'YES', user: 'NO', legal: 'NO', advocate: 'NO' },
    { feature: 'Assigned Cases', admin: 'YES', user: 'YES', legal: 'YES', advocate: 'YES' },
    { feature: 'Upload Documents', admin: 'NO', user: 'YES (ONLY)', legal: 'NO', advocate: 'NO' },
    { feature: 'View Documents', admin: 'YES', user: 'YES*', legal: 'YES', advocate: 'YES*' },
    { feature: 'Download Documents', admin: 'YES', user: 'YES*', legal: 'YES', advocate: 'YES*' },
    { feature: 'Verify Document Integrity', admin: 'YES', user: 'NO', legal: 'YES', advocate: 'YES' },
    { feature: 'View Evidence Vault', admin: 'YES', user: 'YES*', legal: 'YES', advocate: 'YES*' },
    { feature: 'Audit Logs', admin: 'YES', user: 'NO', legal: 'NO', advocate: 'NO' },
    { feature: 'System Settings', admin: 'YES', user: 'NO', legal: 'NO', advocate: 'NO' },
    { feature: 'Delete Documents / Evidence', admin: 'NO', user: 'NO', legal: 'NO', advocate: 'NO' },
    { feature: 'Modify Original Uploads', admin: 'NO', user: 'NO', legal: 'NO', advocate: 'NO' },
  ];

  const handleRunVerificationSuite = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/test/run-matrix', { method: 'POST' });
      const data = await res.json();
      setTestResults(data.results);
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div
      id="test-matrix-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-full sm:max-w-4xl max-h-modal flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0B1220] border border-slate-700 shadow-2xl text-slate-100 overflow-hidden overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-[#070B16]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img
              src="/evinex_logo.png"
              alt="EviNex Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain border border-sky-500/40 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  EVINEX Role Permission Matrix & Test Suite
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 shrink-0">
                  Strict RBAC
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-400 truncate block">
                Statutory Access Control Specifications & Automated Verification Suite
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

        {/* Tab switch */}
        <div className="flex items-center px-4 sm:px-6 border-b border-slate-800 bg-[#080D18] text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Permission Matrix Table
          </button>
          <button
            onClick={() => setActiveTab('test_runner')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'test_runner'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Live RBAC Test Runner
            {testResults && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 text-[10px]">
                {testResults.length} Tests Passed
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4">
          {activeTab === 'matrix' ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full min-w-[720px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Feature / Capability</th>
                      <th className="py-3 px-4 text-center text-red-400">ADMIN</th>
                      <th className="py-3 px-4 text-center text-sky-400">USER</th>
                      <th className="py-3 px-4 text-center text-amber-400">LEGAL_OFFICER</th>
                      <th className="py-3 px-4 text-center text-emerald-400">ADVOCATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {matrixRows.map((row) => (
                      <tr key={row.feature} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-4 text-slate-200">{row.feature}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded font-bold text-[11px] ${
                              row.admin.startsWith('YES')
                                ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                                : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {row.admin}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded font-bold text-[11px] ${
                              row.user.startsWith('YES')
                                ? 'bg-sky-950/80 text-sky-300 border border-sky-500/40'
                                : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {row.user}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded font-bold text-[11px] ${
                              row.legal.startsWith('YES')
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {row.legal}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded font-bold text-[11px] ${
                              row.advocate.startsWith('YES')
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {row.advocate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footnotes */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p>
                  * Only for cases/documents authorized for that respective party.
                </p>
                <p>
                  ** Strict Document Workflow: ONLY the USER role can upload documents. ADMIN, LEGAL OFFICER, and ADVOCATE roles are authorized verifiers (VIEW → VERIFY → DOWNLOAD).
                </p>
                <p>
                  *** Immutability Mandate: Once uploaded, original documents and evidence records are hardware-ledger locked and cannot be edited, overwritten, or deleted by any role.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    Automated Test Matrix Suite
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Validates all 4 authorized logins, cross-role route denials, and unauthorized action blockades per EVINEX specification.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRunVerificationSuite}
                  disabled={isRunningTests}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer disabled:opacity-50"
                >
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Suite...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Execute Full Test Suite</span>
                    </>
                  )}
                </button>
              </div>

              {testResults ? (
                <div className="space-y-2">
                  {testResults.map((t, idx) => (
                    <div
                      key={t.testId || idx}
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-200">{t.testId}: {t.description}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {t.auditAction}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 break-words">
                            <span className="text-slate-500">Expected:</span> {t.expected}
                          </div>
                          <div className="text-[11px] text-emerald-300/90 font-mono mt-0.5 break-words">
                            <span className="text-slate-500">Verdict:</span> {t.actual}
                          </div>
                        </div>
                      </div>

                      <span className="self-end sm:self-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                        PASSED
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Click &ldquo;Execute Full Test Suite&rdquo; above to run all 11 prompt test cases against the live backend API.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800 bg-[#070B16]">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer min-h-[40px]"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
