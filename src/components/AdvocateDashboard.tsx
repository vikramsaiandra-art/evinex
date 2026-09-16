import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Case, Document, EvidenceRecord } from '../types.js';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ShieldCheck,
  Search,
  Activity,
  User as UserIcon,
  LogOut,
  Eye,
  Download,
  Ban,
  Scale,
  Lock,
  Binary,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import { DocumentModal } from './DocumentModal.js';
import { IntegrityCheckModal } from './IntegrityCheckModal.js';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

export const AdvocateDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'assigned_cases' | 'documents' | 'evidence' | 'verify_documents' | 'search' | 'activity' | 'profile'
  >('dashboard');

  const [casesList, setCasesList] = useState<Case[]>([]);
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [inspectedDoc, setInspectedDoc] = useState<Document | null>(null);
  const [verifyingDoc, setVerifyingDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unauthAlert, setUnauthAlert] = useState<string | null>(null);

  const fetchAdvocateData = async () => {
    if (!token) return;
    try {
      const [casesRes, docsRes, evdRes] = await Promise.all([
        fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/evidence', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (casesRes.ok) setCasesList((await casesRes.json()).cases || []);
      if (docsRes.ok) setDocumentsList((await docsRes.json()).documents || []);
      if (evdRes.ok) setEvidenceList((await evdRes.json()).evidence || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdvocateData();
  }, [token]);

  const handleVerificationComplete = (docId: string, newStatus: 'VERIFIED' | 'INTEGRITY_WARNING') => {
    setDocumentsList((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: newStatus } : doc))
    );
  };

  // Attempt upload evidence to test RBAC rejection
  const handleAttemptEvidenceUpload = async () => {
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: casesList[0]?.id || 'CASE-2025-001',
          fileName: 'Advocate_Filing_Attempt.pdf',
          fileContent: 'illegal advocate upload attempt',
        }),
      });
      const data = await res.json();
      setUnauthAlert(data.error || 'Access denied: Only USER role can upload documents.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (doc: Document) => {
    const element = document.createElement('a');
    const file = new Blob([doc.filePreviewText || 'Certified EVINEX Copy'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `COUNSEL_COPY_${doc.fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ✓ INTEGRITY VERIFIED
          </span>
        );
      case 'INTEGRITY_WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-500/40">
            <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
            ⚠ INTEGRITY WARNING
          </span>
        );
      case 'PENDING_VERIFICATION':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" />
            PENDING VERIFICATION
          </span>
        );
    }
  };

  const filteredDocs = documentsList.filter(
    (d) =>
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.caseId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assigned_cases', label: 'Assigned Cases', icon: Briefcase, count: casesList.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: documentsList.length },
    { id: 'evidence', label: 'Evidence', icon: ShieldCheck, count: evidenceList.length },
    { id: 'verify_documents', label: 'Verify Documents', icon: Binary, highlight: true },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div id="advocate-dashboard-root" className="min-h-app flex flex-col lg:flex-row bg-transparent text-slate-100">
      {/* Mobile Top Navigation Bar (Screens < lg) */}
      <div className="lg:hidden bg-[#0A0F1D] border-b border-slate-800 px-3 py-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Advocate Chambers
              </div>
              <h2 className="text-xs font-extrabold text-slate-200">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              ADVOCATE
            </span>
          </div>
        </div>

        {/* Horizontal Scrollable Tabs Pill Bar on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar -mx-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold shrink-0 cursor-pointer min-h-[36px] transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : item.highlight
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Modal */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-72 max-w-[85vw] h-full bg-[#0A0F1D] border-r border-slate-800 flex flex-col justify-between p-4 shadow-2xl overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
                    ROLE: ADVOCATE
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-100">Chambers Menu</h2>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                        isActive
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : item.highlight
                          ? 'text-emerald-300 bg-emerald-950/30 border border-emerald-800/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 transition-colors cursor-pointer min-h-[44px]"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
          {/* Backdrop click dismiss */}
          <div className="flex-1" onClick={() => setIsMobileNavOpen(false)} />
        </div>
      )}

      {/* Desktop Persistent Sidebar (Screens >= lg) */}
      <aside className="hidden lg:flex lg:w-64 border-r border-slate-800/80 bg-[#0A0F1D]/80 backdrop-blur-md flex-col justify-between shrink-0">
        <div className="p-4 space-y-6">
          <div className="px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
              ROLE: ADVOCATE (LEGAL REPRESENTATION)
            </span>
            <h2 className="text-sm font-extrabold text-slate-200 mt-0.5">
              Counsel Chambers
            </h2>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`advocate-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : item.highlight
                      ? 'text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-emerald-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold block mb-0.5">Counsel Scope</span>
            <span>Authorized to view case materials, verify cryptographic parity, and download certified filings.</span>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer min-h-[38px]"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {unauthAlert && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-950/90 border border-red-500 text-red-200 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <Ban className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold block">RBAC RULE ENFORCED</span>
                <span>{unauthAlert}</span>
              </div>
            </div>
            <button
              onClick={() => setUnauthAlert(null)}
              className="px-2.5 py-1 bg-red-900 rounded font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                {activeTab === 'dashboard' && 'Counsel Chambers Dashboard'}
                {activeTab === 'assigned_cases' && 'Assigned Judicial Matters'}
                {activeTab === 'documents' && 'Authorized Case Filings'}
                {activeTab === 'evidence' && 'Exhibits & Evidentiary Vault'}
                {activeTab === 'verify_documents' && 'Document Verification Workspace'}
                {activeTab === 'search' && 'Search Legal Materials'}
                {activeTab === 'activity' && 'Case Record Activity'}
                {activeTab === 'profile' && 'Advocate Bar Registration'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ROLE: ADVOCATE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              High Court of Delhi • Statutory authority: VIEW → VERIFY → DOWNLOAD IF AUTHORIZED.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAttemptEvidenceUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 bg-slate-900 border border-slate-800 hover:border-red-900/60 cursor-pointer"
              title="Test RBAC Limitation (Advocate cannot upload)"
            >
              <Ban className="w-3.5 h-3.5 text-red-400" />
              <span>Test Upload Blockade</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Assigned Cases</span>
                <span className="text-3xl font-black text-slate-100">{casesList.length}</span>
                <span className="text-[11px] text-emerald-400 block mt-1">Active briefs</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Accessible Documents</span>
                <span className="text-3xl font-black text-slate-100">{documentsList.length}</span>
                <span className="text-[11px] text-sky-400 block mt-1">Available for download</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Pending Verification</span>
                <span className="text-3xl font-black text-amber-400">
                  {documentsList.filter((d) => d.status === 'PENDING_VERIFICATION' || !d.status).length}
                </span>
                <span className="text-[11px] text-amber-400/90 block mt-1">Ready for integrity audit</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Verified Exhibits</span>
                <span className="text-3xl font-black text-emerald-400">
                  {documentsList.filter((d) => d.status === 'VERIFIED').length}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-1">Integrity verified</span>
              </div>
            </div>

            {/* Quick Verification Actions */}
            <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Case Brief Filings
                </h3>
                <button
                  onClick={() => setActiveTab('verify_documents')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  Verify Documents &rarr;
                </button>
              </div>

              <div className="divide-y divide-slate-800/80">
                {documentsList.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span>{doc.fileName}</span>
                        {getStatusBadge(doc.status)}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{doc.description}</p>
                      <span className="font-mono text-[10px] text-amber-400/90 mt-1 block truncate max-w-sm">
                        SHA-256: {doc.sha256Hash}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setInspectedDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => setVerifyingDoc(doc)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify Integrity</span>
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED CASES */}
        {activeTab === 'assigned_cases' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {casesList.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      CNR: {c.cnrNumber}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{c.title}</h3>
                  <p className="text-xs text-slate-400">{c.court}</p>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                    <div><span className="text-slate-500">Petitioner:</span> {c.petitioner}</div>
                    <div><span className="text-slate-500">Respondent:</span> {c.respondent}</div>
                    <div><span className="text-slate-500">Statutory Act:</span> {c.legalAct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsList.map((doc) => (
                <div key={doc.id} className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{doc.fileName}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">Case: {doc.caseId}</span>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    <p className="text-xs text-slate-300">{doc.description}</p>

                    <div className="p-2.5 rounded bg-black/50 font-mono text-[10px] text-amber-400/90 break-all">
                      SHA-256: {doc.sha256Hash}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 text-xs border-t border-slate-800">
                    <button
                      onClick={() => setInspectedDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => setVerifyingDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {evidenceList.map((evd) => (
                <div key={evd.id} className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{evd.title}</h4>
                      <span className="text-[11px] font-mono text-slate-400">Code: {evd.evidenceCode}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {evd.evidenceType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{evd.custodyNotes}</p>

                  <div className="p-2.5 rounded bg-black/50 font-mono text-[10px] text-amber-400/90 break-all">
                    SHA-256: {evd.sha256Hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VERIFY DOCUMENTS */}
        {activeTab === 'verify_documents' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Binary className="w-5 h-5 text-emerald-400" />
                Counsel Document Integrity Verification
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Advocates are authorized under BSA 2023 Sec 63 to execute cryptographic integrity verification on all case filings before submitting them to the bench.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsList.map((doc) => (
                <div key={doc.id} className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{doc.fileName}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">Case: {doc.caseId}</span>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{doc.description}</p>
                    <div className="p-2.5 rounded bg-black/50 font-mono text-[10px] text-amber-400/90 break-all mt-2">
                      {doc.sha256Hash}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => setVerifyingDoc(doc)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Integrity</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filings by title, case ref, or contents..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#0C1322] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200">{doc.fileName}</h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{doc.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectedDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => setVerifyingDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-slate-950 font-bold cursor-pointer"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="p-6 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Counsel Activity Trail
            </h3>
            <div className="space-y-2 pt-2">
              {documentsList.map((doc) => (
                <div key={doc.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{doc.fileName}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      Case {doc.caseId} • Registered by {doc.uploadedBy}
                    </span>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-6 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold text-slate-100">Advocate Bar Profile</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Full Name</span>
                <span className="font-semibold text-slate-100">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Registered Email</span>
                <span className="font-mono text-slate-100">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">System Role</span>
                <span className="font-bold text-emerald-400">{user?.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Bar Enrollment / Designation</span>
                <span>{user?.designation}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Assigned Court</span>
                <span>{user?.courtOrDepartment}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Verification Scope</span>
                <span className="text-emerald-400 font-semibold">Authorized Verifier (BSA 2023 Sec 63)</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* INSPECT MODAL */}
      {inspectedDoc && (
        <DocumentModal
          document={inspectedDoc}
          userRole="ADVOCATE"
          onClose={() => setInspectedDoc(null)}
          onDownload={handleDownload}
        />
      )}

      {/* INTEGRITY CHECK MODAL */}
      {verifyingDoc && (
        <IntegrityCheckModal
          document={verifyingDoc}
          token={token}
          onClose={() => setVerifyingDoc(null)}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </div>
  );
};
