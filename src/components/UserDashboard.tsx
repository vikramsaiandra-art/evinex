import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Case, Document } from '../types.js';
import {
  LayoutDashboard,
  FileText,
  FolderLock,
  Search,
  User as UserIcon,
  LogOut,
  Eye,
  Download,
  UploadCloud,
  FilePlus,
  ShieldCheck,
  Scale,
  Ban,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Hash,
  Lock,
  ArrowRight,
  FileCheck,
  Menu,
  X,
} from 'lucide-react';
import { DocumentModal } from './DocumentModal.js';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

// Helper to compute client-side SHA-256 hash for real-time validation
async function computeClientSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const UserDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'upload' | 'my_documents' | 'my_cases' | 'search' | 'profile'
  >('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [casesList, setCasesList] = useState<Case[]>([]);
  const [inspectedDoc, setInspectedDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Form State
  const [uploadCaseId, setUploadCaseId] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadAccessLevel, setUploadAccessLevel] = useState<'RESTRICTED' | 'CONFIDENTIAL' | 'SEALED'>('RESTRICTED');
  const [uploadDocumentType, setUploadDocumentType] = useState('Legal Petition');
  const [uploadFileContent, setUploadFileContent] = useState('');
  const [liveSha256, setLiveSha256] = useState('');
  const [uploadStatusMsg, setUploadStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const [casesRes, docsRes] = await Promise.all([
        fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (casesRes.ok) {
        const cData = await casesRes.json();
        setCasesList(cData.cases || []);
        if (cData.cases?.length > 0 && !uploadCaseId) {
          setUploadCaseId(cData.cases[0].id);
        }
      }
      if (docsRes.ok) {
        const dData = await docsRes.json();
        setDocumentsList(dData.documents || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  // Compute live hash when content changes
  useEffect(() => {
    if (!uploadFileContent) {
      setLiveSha256('');
      return;
    }
    computeClientSha256(uploadFileContent).then((h) => setLiveSha256(h));
  }, [uploadFileContent]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation: Size <= 25MB
    if (file.size > 25 * 1024 * 1024) {
      setUploadStatusMsg({
        type: 'error',
        text: 'File exceeds maximum permissible size of 25MB.',
      });
      return;
    }

    setSelectedFileName(file.name);
    if (!uploadFileName) {
      setUploadFileName(file.name);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadFileContent(content || `Content of ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Submit document for verification (USER only)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatusMsg(null);

    // Validation
    if (!uploadCaseId) {
      setUploadStatusMsg({ type: 'error', text: 'Please select a valid judicial case.' });
      return;
    }
    if (!uploadFileName.trim()) {
      setUploadStatusMsg({ type: 'error', text: 'Please provide a valid document name.' });
      return;
    }
    if (!uploadFileContent.trim()) {
      setUploadStatusMsg({ type: 'error', text: 'Document content cannot be empty.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: uploadCaseId,
          fileName: uploadFileName.trim(),
          description: uploadDescription.trim() || `${uploadDocumentType} submitted for court review`,
          fileContent: uploadFileContent,
          accessLevel: uploadAccessLevel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setUploadStatusMsg({
          type: 'error',
          text: errData.error || 'Failed to upload document.',
        });
        return;
      }

      const resData = await res.json();
      setUploadStatusMsg({
        type: 'success',
        text: 'Document uploaded successfully and submitted for verification.',
      });

      // Clear form
      setUploadFileName('');
      setUploadDescription('');
      setUploadFileContent('');
      setSelectedFileName(null);
      setLiveSha256('');

      // Refresh document list
      fetchUserData();
    } catch (err) {
      console.error(err);
      setUploadStatusMsg({
        type: 'error',
        text: 'Network error occurred during document submission.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (doc: Document) => {
    const element = document.createElement('a');
    const file = new Blob([doc.filePreviewText || 'Certified EVINEX Copy'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `EVINEX_${doc.fileName}.txt`;
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
    { id: 'upload', label: 'Upload Document', icon: UploadCloud, highlight: true },
    { id: 'my_documents', label: 'My Documents', icon: FileText, count: documentsList.length },
    { id: 'my_cases', label: 'Cases', icon: FolderLock, count: casesList.length },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div id="user-dashboard-root" className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-transparent text-slate-100">
      {/* Mobile Top Navigation Bar (Visible on screens < lg) */}
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
              <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                User Portal
              </div>
              <h2 className="text-xs font-extrabold text-slate-200">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'upload' && (
              <button
                onClick={() => setActiveTab('upload')}
                className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer min-h-[36px]"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-500/40">
              USER
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
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : item.highlight
                    ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
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
          <div className="w-72 max-w-[85vw] h-full bg-[#0A0F1D] border-r border-slate-800 flex flex-col justify-between p-4 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 font-mono">
                    ROLE: USER PORTAL
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-100">Navigation Menu</h2>
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
                          ? 'bg-sky-950/90 text-sky-300 border border-sky-500/40 shadow-sm'
                          : item.highlight
                          ? 'text-sky-300 bg-sky-950/30 border border-sky-800/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 font-mono">
              ROLE: USER (DOCUMENT UPLOAD ROLE)
            </span>
            <h2 className="text-sm font-extrabold text-slate-200 mt-0.5">
              User Dashboard
            </h2>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`user-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-950/70 text-sky-300 border border-sky-500/40 shadow-sm'
                      : item.highlight
                      ? 'text-sky-300 bg-sky-950/30 hover:bg-sky-950/50 border border-sky-800/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : item.highlight ? 'text-sky-300' : 'text-slate-400'}`} />
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
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Authority</span>
            </div>
            <span>You are authorized to upload digital court filings for official verification under BSA 2023 Sec 63.</span>
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
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                {activeTab === 'dashboard' && 'User Dashboard'}
                {activeTab === 'upload' && 'Upload Document for Verification'}
                {activeTab === 'my_documents' && 'My Documents'}
                {activeTab === 'my_cases' && 'Cases'}
                {activeTab === 'search' && 'Search Documents'}
                {activeTab === 'profile' && 'User Profile'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-500/40">
                ROLE: USER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Secure digital court document management. Only USER role can upload documents.
            </p>
          </div>

          {activeTab !== 'upload' && (
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-slate-950 font-bold text-xs shadow-lg shadow-sky-950/40 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>

        {/* Success / Error Notification */}
        {uploadStatusMsg && (
          <div
            role="alert"
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
              uploadStatusMsg.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-red-950/90 border-red-500 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {uploadStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span className="font-semibold text-sm">{uploadStatusMsg.text}</span>
            </div>
            <button
              onClick={() => setUploadStatusMsg(null)}
              className="px-2 py-1 bg-black/40 hover:bg-black/60 rounded text-slate-300 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Uploaded Documents</span>
                <span className="text-3xl font-black text-slate-100">{documentsList.length}</span>
                <span className="text-[11px] text-sky-400 block mt-1">Total in repository</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Pending Verification</span>
                <span className="text-3xl font-black text-amber-400">
                  {documentsList.filter((d) => d.status === 'PENDING_VERIFICATION' || !d.status).length}
                </span>
                <span className="text-[11px] text-amber-400/90 block mt-1">Awaiting legal review</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Integrity Verified</span>
                <span className="text-3xl font-black text-emerald-400">
                  {documentsList.filter((d) => d.status === 'VERIFIED').length}
                </span>
                <span className="text-[11px] text-emerald-400 block mt-1">BSA Sec 63 Validated</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Active Cases</span>
                <span className="text-3xl font-black text-slate-100">{casesList.length}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Assigned court matters</span>
              </div>
            </div>

            {/* Document Upload CTA Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900/90 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-slate-100">Submit New Court Document</h3>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  Upload petitions, written submissions, or evidentiary records. EVINEX generates an immutable SHA-256 cryptographic hash and registers your filing with status <span className="text-amber-400 font-mono">"PENDING_VERIFICATION"</span>.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-950/40 cursor-pointer shrink-0"
              >
                <span>Upload Document Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Recent Uploads Table */}
            <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Recent Documents
                </h3>
                <button
                  onClick={() => setActiveTab('my_documents')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  View All Documents &rarr;
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
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                        <span>Case: {doc.caseId}</span>
                        <span>•</span>
                        <span className="text-amber-400/90 truncate max-w-xs">SHA-256: {doc.sha256Hash}</span>
                      </div>
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
                        onClick={() => handleDownload(doc)}
                        className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-500/30 flex items-center gap-1.5 cursor-pointer"
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

        {/* TAB 2: UPLOAD DOCUMENT */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-sky-400" />
                  Document Upload & Verification Submission
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Follow the statutory document upload flow. Uploaded files receive an immutable SHA-256 hash and enter status <strong className="text-amber-300">PENDING_VERIFICATION</strong> for review by authorized Legal Officers and Advocates.
                </p>
              </div>

              {/* Upload Workflow Step Indicator */}
              <div className="grid grid-cols-4 gap-2 py-2">
                {[
                  { label: '1. Select Case', done: !!uploadCaseId },
                  { label: '2. Document Details', done: !!uploadFileName },
                  { label: '3. File Content', done: !!uploadFileContent },
                  { label: '4. SHA-256 Seal', done: !!liveSha256 },
                ].map((st, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border text-center text-[10px] font-mono ${
                      st.done
                        ? 'bg-sky-950/60 border-sky-500/60 text-sky-300'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    {st.label}
                  </div>
                ))}
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                {/* 1. Select Case */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Court Case <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={uploadCaseId}
                    onChange={(e) => setUploadCaseId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {casesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.title} ({c.court})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. File Selection & Drag Drop */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Attach Document File <span className="text-red-400">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/80 rounded-xl p-5 text-center bg-slate-900/40 transition-colors">
                    <input
                      type="file"
                      id="user-file-input"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <label htmlFor="user-file-input" className="cursor-pointer block">
                      <FilePlus className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                      <span className="font-semibold text-slate-200 block text-xs">
                        {selectedFileName ? `Selected: ${selectedFileName}` : 'Click to select or drag and drop file'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Supported formats: PDF, DOCX, TXT, PNG, JPG (Max 25MB)
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Document Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Document Title / File Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadFileName}
                      onChange={(e) => setUploadFileName(e.target.value)}
                      placeholder="e.g., Petition_Reply_Annexure_A.pdf"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Document Category / Tag
                    </label>
                    <select
                      value={uploadDocumentType}
                      onChange={(e) => setUploadDocumentType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="Legal Petition">Legal Petition</option>
                      <option value="Written Submission">Written Submission</option>
                      <option value="Affidavit">Affidavit</option>
                      <option value="Evidence Exhibit">Evidence Exhibit</option>
                      <option value="Vakalatnama">Vakalatnama / Power of Attorney</option>
                      <option value="Interlocutory Application">Interlocutory Application</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Document Description / Summary
                  </label>
                  <input
                    type="text"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Brief description of the document contents and legal purpose"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Classification / Access Level
                  </label>
                  <select
                    value={uploadAccessLevel}
                    onChange={(e) => setUploadAccessLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="RESTRICTED">RESTRICTED (Legal Counsel & Officer Review)</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL (Judicial Bench Only)</option>
                    <option value="SEALED">SEALED (Protected Court Record)</option>
                  </select>
                </div>

                {/* 4. Document Text Payload */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Document Text Payload <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={uploadFileContent}
                    onChange={(e) => setUploadFileContent(e.target.value)}
                    placeholder="Paste or enter the certified text content of the filing..."
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-xs"
                  />
                </div>

                {/* Live Cryptographic Preview */}
                {liveSha256 && (
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-amber-400" />
                        Calculated SHA-256 Digest (Pre-submission Seal):
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px]">Valid Digest</span>
                    </div>
                    <div className="font-mono text-[11px] text-amber-400/90 break-all select-all">
                      {liveSha256}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-slate-950 font-bold text-xs shadow-lg shadow-sky-950/40 cursor-pointer disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Hashing & Submitting Document...</span>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Submit Document for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: MY DOCUMENTS */}
        {activeTab === 'my_documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Total Documents: <strong className="text-slate-200">{documentsList.length}</strong>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-500/30 text-xs font-semibold cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload New Document</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsList.map((doc) => (
                <div key={doc.id} className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-3">
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

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400">
                      Uploaded by: {doc.uploadedBy}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectedDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Metadata</span>
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-500/30 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CASES */}
        {activeTab === 'my_cases' && (
          <div className="space-y-4">
            {casesList.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    CNR: {c.cnrNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    {c.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{c.title}</h3>
                <p className="text-xs text-slate-400">{c.court}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500">Petitioner:</span> {c.petitioner}
                  </div>
                  <div>
                    <span className="text-slate-500">Respondent:</span> {c.respondent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search authorized case documents by title, case number, or contents..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#0C1322] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200">{doc.fileName}</h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{doc.description}</p>
                    <span className="font-mono text-[10px] text-amber-400/90 block mt-1">
                      {doc.sha256Hash}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectedDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="px-3 py-1.5 rounded-lg bg-sky-950 text-sky-200 border border-sky-500/30 cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-6 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold text-slate-100">User Profile & Authorization</h3>
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
                <span className="font-bold text-sky-400">{user?.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Jurisdiction / Department</span>
                <span>{user?.courtOrDepartment}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Upload Privileges</span>
                <span className="text-emerald-400 font-semibold">Authorized (Only USER Role Can Upload)</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* INSPECT METADATA MODAL */}
      {inspectedDoc && (
        <DocumentModal
          document={inspectedDoc}
          userRole="USER"
          onClose={() => setInspectedDoc(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};
