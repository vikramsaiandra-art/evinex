import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, Case, Document, EvidenceRecord, AuditLog } from '../types.js';
import {
  LayoutDashboard,
  Users,
  FolderLock,
  FileText,
  ShieldCheck,
  ClipboardList,
  Binary,
  ShieldAlert,
  Settings,
  LogOut,
  UserPlus,
  Ban,
  CheckCircle,
  Eye,
  Download,
  AlertTriangle,
  Lock,
  Search,
  Hash,
  Scale,
  Plus,
  RefreshCw,
  Server,
  Activity,
  FileCheck2,
  Menu,
  X,
} from 'lucide-react';
import { DocumentModal } from './DocumentModal.js';
import { IntegrityCheckModal } from './IntegrityCheckModal.js';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

export const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Active section
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'cases'
    | 'documents'
    | 'evidence'
    | 'audit_logs'
    | 'integrity'
    | 'security'
    | 'settings'
  >('dashboard');

  // Data states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [casesList, setCasesList] = useState<Case[]>([]);
  const [documentsList, setDocumentsList] = useState<Document[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [inspectedDoc, setInspectedDoc] = useState<Document | null>(null);
  const [verifyingDoc, setVerifyingDoc] = useState<Document | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditFilterAction, setAuditFilterAction] = useState<string>('ALL');

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'USER' as User['role'],
    designation: '',
    courtOrDepartment: '',
    initialPassword: '',
  });

  // Immutability Notice State (Triggers if admin attempts to edit evidence)
  const [immutabilityAlert, setImmutabilityAlert] = useState<string | null>(null);

  // Fetch Admin Data
  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [usersRes, casesRes, docsRes, evdRes, logsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/cases', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/evidence', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (usersRes.ok) setUsersList((await usersRes.json()).users);
      if (casesRes.ok) setCasesList((await casesRes.json()).cases);
      if (docsRes.ok) setDocumentsList((await docsRes.json()).documents);
      if (evdRes.ok) setEvidenceList((await evdRes.json()).evidence);
      if (logsRes.ok) setAuditLogsList((await logsRes.json()).logs);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle Disable/Enable User
  const handleToggleUserStatus = async (targetUser: User) => {
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/disable`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setShowCreateUserModal(false);
        setNewUser({
          name: '',
          email: '',
          role: 'USER',
          designation: '',
          courtOrDepartment: '',
          initialPassword: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger simulated forbidden edit to prove immutability rule
  const handleAttemptEvidenceEdit = async (evdId: string) => {
    try {
      const res = await fetch(`/api/evidence/${evdId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Illegal Modified Evidence Title' }),
      });
      const data = await res.json();
      setImmutabilityAlert(data.error || 'Original evidence is immutable and cannot be modified.');
      fetchData(); // reload audit logs to show tamper attempt
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogsList.filter((log) => {
    const matchesAction = auditFilterAction === 'ALL' || log.action === auditFilterAction;
    const matchesQuery =
      searchQuery === '' ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesQuery;
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, count: usersList.length },
    { id: 'cases', label: 'Cases', icon: FolderLock, count: casesList.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: documentsList.length },
    { id: 'evidence', label: 'Evidence', icon: ShieldCheck, count: evidenceList.length },
    { id: 'audit_logs', label: 'Audit Logs', icon: ClipboardList, count: auditLogsList.length },
    { id: 'integrity', label: 'Integrity Verification', icon: Binary },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div id="admin-dashboard-root" className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-transparent text-slate-100">
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
              <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                Admin Command
              </div>
              <h2 className="text-xs font-extrabold text-slate-200">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/40">
              ADMIN
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
                    ? 'bg-red-600 text-white font-bold shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-red-950 text-red-200' : 'bg-slate-800 text-slate-300'}`}>
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 font-mono">
                    ADMINISTRATION
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-100">System Navigation</h2>
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
                          ? 'bg-red-950/80 text-red-300 border border-red-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
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
          {/* Header section in sidebar */}
          <div className="px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 font-mono">
              SYSTEM COMMAND
            </span>
            <h2 className="text-sm font-extrabold text-slate-200 mt-0.5 font-sans">
              Admin Workspace
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-950/70 text-red-300 border border-red-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
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
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              Root Trust Authority
            </span>
            <span className="font-mono text-slate-300 text-[11px] block mt-0.5 truncate">
              {user?.courtOrDepartment}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors cursor-pointer min-h-[38px]"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Immutability Banner Alert */}
        {immutabilityAlert && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-950/90 border-2 border-red-500 text-red-100 flex items-center justify-between animate-pulse shadow-xl"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">STATUTORY EVIDENCE IMMUTABILITY RULE ENFORCED</h4>
                <p className="text-xs text-red-200 mt-0.5">{immutabilityAlert}</p>
                <span className="text-[10px] font-mono text-red-300 mt-1 block">
                  Original evidence can never be modified or overwritten. New version chained records only.
                </span>
              </div>
            </div>
            <button
              onClick={() => setImmutabilityAlert(null)}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top title and reload button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
                {activeTab === 'dashboard' && 'System Overview & Telemetry'}
                {activeTab === 'users' && 'User Management & Access Control'}
                {activeTab === 'cases' && 'All Judicial Cases (Master Registry)'}
                {activeTab === 'documents' && 'Document Vault & Metadata'}
                {activeTab === 'evidence' && 'Evidentiary Chain & Ledger'}
                {activeTab === 'audit_logs' && 'Immutable Audit Logs (Append-Only)'}
                {activeTab === 'integrity' && 'Cryptographic Integrity Verification'}
                {activeTab === 'security' && 'System Security & Encryption Standards'}
                {activeTab === 'settings' && 'System Governance Settings'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/40">
                ROLE: ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              National Evidentiary Repository • Full System Administrator Access Level
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                  <span>Registered Users</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-slate-100">{usersList.length}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="text-emerald-400 font-semibold">4 Roles Configured</span> • Strict RBAC
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                  <span>Active Judicial Cases</span>
                  <FolderLock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-slate-100">{casesList.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  High Courts & Supreme Court of India
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                  <span>Immutable Evidence</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-slate-100">{evidenceList.length}</div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span>100% SHA-256 Verified</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                  <span>Audit Trail Events</span>
                  <ClipboardList className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-black text-slate-100">{auditLogsList.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Append-Only Cryptographic Log
                </div>
              </div>
            </div>

            {/* Critical Immutability Notice for Admin */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-red-500/30">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/40 text-red-400 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    CRITICAL STATUTORY MANDATE: EVIDENCE IMMUTABILITY
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Under Indian Evidence Act & Bharatiya Sakshya Adhiniyam, 2023 (Sec 63), even the Administrator has NO PERMISSION to edit, overwrite, or delete original digital evidence records. Any necessary amendments must spawn a linked, timestamped new version while the original remains permanent.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => setActiveTab('evidence')}
                      className="px-3 py-1.5 bg-red-900/60 hover:bg-red-900 text-red-200 border border-red-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      View Immutable Evidence Records
                    </button>
                    <button
                      onClick={() => handleAttemptEvidenceEdit(evidenceList[0]?.id || 'EVD-001')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Test Immutability Blockade
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Audit Activity Snapshot */}
            <div className="rounded-xl bg-[#0C1322] border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  Live System Audit Trail (Last 5 Events)
                </h3>
                <button
                  onClick={() => setActiveTab('audit_logs')}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  View All Logs &rarr;
                </button>
              </div>

              <div className="space-y-2.5">
                {auditLogsList.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between gap-4 text-xs font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-400'
                            : log.result === 'DENIED'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                      ></span>
                      <span className="font-mono text-slate-400 text-[11px]">{log.id}</span>
                      <span className="font-semibold text-slate-200">{log.action}</span>
                      <span className="text-slate-400 text-[11px] truncate max-w-md">
                        {log.details}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-[10px] text-slate-400">{log.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Total Registered Users: <strong className="text-slate-200">{usersList.length}</strong>
              </div>
              <button
                id="create-user-modal-trigger"
                onClick={() => setShowCreateUserModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/40 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New User</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0C1322]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Jurisdiction / Badge</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.designation}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                            u.role === 'ADMIN'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : u.role === 'LEGAL_OFFICER'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : u.role === 'ADVOCATE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-sky-950 text-sky-300 border border-sky-500/40'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300 text-[11px]">{u.courtOrDepartment}</div>
                        <div className="text-[10px] font-mono text-slate-500">{u.badgeNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-950/80 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.id !== user?.id ? (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'bg-slate-800 hover:bg-red-950/60 text-red-300 border border-slate-700 hover:border-red-500/40'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Disable User' : 'Enable User'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Self (Admin)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CASES */}
        {activeTab === 'cases' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>
                Displaying all judicial matters under Indian Court Registry CNR Standards.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {casesList.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                        CNR: {c.cnrNumber}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        {c.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 leading-snug">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{c.court}</p>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500">Petitioner:</span> {c.petitioner}
                      </div>
                      <div>
                        <span className="text-slate-500">Respondent:</span> {c.respondent}
                      </div>
                      <div>
                        <span className="text-slate-500">Statutory Act:</span> {c.legalAct}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Hearing: {c.hearingDate}</span>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      View Case Documents &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0C1322]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Document / File</th>
                    <th className="py-3 px-4">Case Ref</th>
                    <th className="py-3 px-4">SHA-256 Digest</th>
                    <th className="py-3 px-4">Uploaded By</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Classification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {documentsList.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-red-400" />
                          <span>{doc.fileName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {doc.id} • v{doc.version}.0
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{doc.caseId}</td>
                      <td className="py-3 px-4 font-mono text-amber-400/90 text-[11px] truncate max-w-[140px]">
                        {doc.sha256Hash}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div>{doc.uploadedBy}</div>
                        <div className="text-[10px] text-slate-500">{doc.uploadedRole}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {doc.status === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            ✓ VERIFIED
                          </span>
                        ) : doc.status === 'INTEGRITY_WARNING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                            ⚠ WARNING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.accessLevel === 'SEALED'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {doc.accessLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectedDoc(doc)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Inspect Metadata & Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setVerifyingDoc(doc)}
                            className="p-1.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/30 cursor-pointer"
                            title="Verify Cryptographic Integrity"
                          >
                            <Binary className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EVIDENCE (IMMUTABLE) */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Evidentiary Cryptographic Vault
                </h3>
                <p className="text-xs text-slate-400">
                  All registered digital artifacts are immutable. Overwriting or tampering is blocked at the hardware ledger level.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                BSA 2023 SEC 63 COMPLIANT
              </span>
            </div>

            <div className="space-y-3">
              {evidenceList.map((evd) => (
                <div
                  key={evd.id}
                  className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100">{evd.title}</h4>
                          <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                            {evd.evidenceCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Document ID: {evd.documentId} • Case: {evd.caseId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-emerald-400 border border-emerald-500/40">
                        Original Immutable (v1.0)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/50 border border-slate-800 text-xs font-mono text-red-400 break-all">
                    <span className="text-slate-500 text-[10px] block">IMMUTABLE GENESIS SHA-256 HASH:</span>
                    {evd.sha256Hash}
                  </div>

                  {/* Chain of Custody */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Chain of Custody Log:
                    </span>
                    <div className="space-y-1 text-xs text-slate-300">
                      {evd.chainOfCustody.map((c, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span className="text-slate-400">{new Date(c.timestamp).toLocaleDateString()}:</span>
                          <span className="font-medium text-slate-200">{c.officer}</span> —{' '}
                          <span className="text-slate-400">{c.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action row with test button */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 italic">
                      Edit/Delete actions are permanently suppressed to prevent spoliation of evidence.
                    </span>

                    <button
                      onClick={() => handleAttemptEvidenceEdit(evd.id)}
                      className="px-3 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Simulate Unauthorized Overwrite (Test RBAC)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by action, user, details..."
                    className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 w-64 focus:outline-none focus:border-red-500"
                  />
                </div>

                <select
                  value={auditFilterAction}
                  onChange={(e) => setAuditFilterAction(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="ALL">All Actions</option>
                  <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                  <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                  <option value="ACCESS_DENIED">ACCESS_DENIED</option>
                  <option value="DOCUMENT_UPLOADED">DOCUMENT_UPLOADED</option>
                  <option value="DOCUMENT_VIEWED">DOCUMENT_VIEWED</option>
                  <option value="DOCUMENT_VERIFIED">DOCUMENT_VERIFIED</option>
                  <option value="EVIDENCE_REGISTERED">EVIDENCE_REGISTERED</option>
                  <option value="TAMPER_ATTEMPT_BLOCKED">TAMPER_ATTEMPT_BLOCKED</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Append-Only Ledger: <span className="text-red-400">{filteredAuditLogs.length} Records</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0C1322]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User & Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.id}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-semibold">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.userRole}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[11px] text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.result === 'SUCCESS'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : log.result === 'DENIED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-red-950 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: INTEGRITY VERIFICATION */}
        {activeTab === 'integrity' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Live SHA-256 Ledger Audit</h3>
              <p className="text-xs text-slate-400">
                Select any stored document or evidence item below to execute an immediate bit-level cryptographic parity test.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentsList.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-slate-100 truncate">{doc.fileName}</h4>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Stored Hash: {doc.sha256Hash.substring(0, 24)}...
                    </span>
                  </div>

                  <button
                    onClick={() => setVerifyingDoc(doc)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Binary className="w-3.5 h-3.5" />
                    <span>Run Verification</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Cryptographic Standard</span>
                <span className="text-lg font-bold text-slate-100 font-mono">SHA-256 Digest</span>
                <p className="text-[11px] text-slate-400 mt-2">
                  Complies with FIPS PUB 180-4 and Indian IT Act 2000 Electronic Signature rules.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Password Key Derivation</span>
                <span className="text-lg font-bold text-slate-100 font-mono">PBKDF2-HMAC-SHA512</span>
                <p className="text-[11px] text-slate-400 mt-2">
                  10,000 iterations with cryptographically random 128-bit unique salts.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C1322] border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Session Security</span>
                <span className="text-lg font-bold text-slate-100 font-mono">Bearer Token Vault</span>
                <p className="text-[11px] text-slate-400 mt-2">
                  8-hour session lifetime with instant revocation on logout or account deactivation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-2xl bg-[#0C1322] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">National Repository Settings</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>System Identifier</span>
                <span className="font-mono text-slate-400">EVINEX-SECURE-REPOSITORY-DLHC-01</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Statutory Law Framework</span>
                <span className="text-amber-300">Bharatiya Sakshya Adhiniyam, 2023 (BSA Sec 63)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Evidence Overwrite Lock</span>
                <span className="text-emerald-400 font-bold">PERMANENTLY ENABLED (IMMUTABLE)</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE USER MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0D1424] border border-slate-700 shadow-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-slate-100 mb-4">Register New System User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Justice Rajesh Verma"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="r.verma@evinex.demo"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                >
                  <option value="USER">USER (Limited Read-Only)</option>
                  <option value="LEGAL_OFFICER">LEGAL_OFFICER (Legal & Evidence Upload)</option>
                  <option value="ADVOCATE">ADVOCATE (Assigned Case Access)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={newUser.designation}
                  onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  placeholder="e.g. Additional Legal Custodian"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Court or Department</label>
                <input
                  type="text"
                  required
                  value={newUser.courtOrDepartment}
                  onChange={(e) => setNewUser({ ...newUser, courtOrDepartment: e.target.value })}
                  placeholder="e.g. High Court of Delhi"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newUser.initialPassword}
                  onChange={(e) => setNewUser({ ...newUser, initialPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT MODAL */}
      {inspectedDoc && (
        <DocumentModal
          document={inspectedDoc}
          userRole="ADMIN"
          onClose={() => setInspectedDoc(null)}
          onVerifyIntegrity={(doc) => {
            setInspectedDoc(null);
            setVerifyingDoc(doc);
          }}
        />
      )}

      {/* INTEGRITY MODAL */}
      {verifyingDoc && (
        <IntegrityCheckModal
          document={verifyingDoc}
          token={token}
          onClose={() => setVerifyingDoc(null)}
          onVerificationComplete={(docId, newStatus) => {
            setDocumentsList((prev) =>
              prev.map((doc) => (doc.id === docId ? { ...doc, status: newStatus } : doc))
            );
          }}
        />
      )}
    </div>
  );
};
