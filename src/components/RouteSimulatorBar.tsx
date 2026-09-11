import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useThemeLanguage } from '../context/ThemeLanguageContext.js';
import { Navigation, Users, ShieldAlert, CheckCircle2, CornerDownRight, ExternalLink, ChevronDown, ChevronUp, Languages, Palette } from 'lucide-react';

interface RouteSimulatorBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenTestMatrix: () => void;
}

export const RouteSimulatorBar: React.FC<RouteSimulatorBarProps> = ({
  currentRoute,
  onNavigate,
  onOpenTestMatrix,
}) => {
  const { user, login } = useAuth();
  const { themeDetails, languageDetails, setIsLanguageModalOpen, setIsThemeModalOpen, t } =
    useThemeLanguage();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const routes = [
    { path: '/admin/dashboard', label: t('role_admin'), shortLabel: '/admin', allowedRole: 'ADMIN' },
    { path: '/user/dashboard', label: t('role_user'), shortLabel: '/user', allowedRole: 'USER' },
    { path: '/legal/dashboard', label: t('role_legal_officer'), shortLabel: '/legal', allowedRole: 'LEGAL_OFFICER' },
    { path: '/advocate/dashboard', label: t('role_advocate'), shortLabel: '/advocate', allowedRole: 'ADVOCATE' },
  ];

  const demoAccounts = [
    { email: 'admin@evinex.demo', pass: 'Evinex@Admin2026', role: 'ADMIN', label: t('role_admin') },
    { email: 'user@evinex.demo', pass: 'Evinex@User2026', role: 'USER', label: t('role_user') },
    { email: 'legalofficer@evinex.demo', pass: 'Evinex@Legal2026', role: 'LEGAL_OFFICER', label: t('role_legal_officer') },
    { email: 'advocate@evinex.demo', pass: 'Evinex@Advocate2026', role: 'ADVOCATE', label: t('role_advocate') },
  ];

  const handleQuickSwitch = async (email: string, pass: string) => {
    await login(email, pass);
  };

  return (
    <div
      id="route-simulator-bar"
      className="bg-[#0A101D] border-b border-slate-800/90 text-xs text-slate-300 transition-all"
    >
      {/* Mobile Bar Top Header: Always visible, compact on mobile */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] shrink-0">
            <Navigation className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Active Route:</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold truncate max-w-[140px] sm:max-w-none">
              {currentRoute}
            </code>
          </div>

          {/* Desktop inline routes */}
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">
              Test Route Access:
            </span>
            {routes.map((r) => {
              const isMatch = r.path === currentRoute;
              const willDeny = user && user.role !== r.allowedRole;

              return (
                <button
                  key={r.path}
                  id={`simulate-nav-${r.allowedRole.toLowerCase()}`}
                  onClick={() => onNavigate(r.path)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    isMatch
                      ? 'bg-red-600 text-white font-bold shadow'
                      : willDeny
                      ? 'bg-slate-900/90 text-slate-400 hover:text-red-300 hover:border-red-500/50 border border-slate-800'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                  title={willDeny ? `Simulate unauthorized navigation (Expect 403 Access Denied)` : `Navigate to ${r.label}`}
                >
                  <span>{r.path}</span>
                  {willDeny && (
                    <span className="text-[9px] px-1 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                      Deny
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side: Desktop switchers + Language/Theme + Mobile collapse toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Switch:</span>
            </div>

            <div className="flex items-center gap-1">
              {demoAccounts.map((acc) => {
                const isCurrent = user?.role === acc.role;
                return (
                  <button
                    key={acc.role}
                    id={`quick-switch-${acc.role.toLowerCase()}`}
                    onClick={() => handleQuickSwitch(acc.email, acc.pass)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {acc.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onOpenTestMatrix}
              className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>{t('btn_test_suite')}</span>
            </button>
          </div>

          {/* Mobile toggle button */}
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="lg:hidden flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold cursor-pointer"
          >
            <span>Simulate & Switch</span>
            {isMobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Expandable when toggled on screens < lg) */}
      {isMobileExpanded && (
        <div className="lg:hidden px-3 py-2.5 bg-slate-950/90 border-t border-slate-800/80 space-y-2.5">
          {/* Mobile Language & Theme Quick Triggers */}
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <button
              onClick={() => {
                setIsLanguageModalOpen(true);
                setIsMobileExpanded(false);
              }}
              className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span>Language ({languageDetails.nativeName})</span>
            </button>
            <button
              onClick={() => {
                setIsThemeModalOpen(true);
                setIsMobileExpanded(false);
              }}
              className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Theme ({themeDetails.name.split(' ')[0]})</span>
            </button>
          </div>

          {/* Mobile Test Route Access */}
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1.5">
              Simulate Route Access:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {routes.map((r) => {
                const isMatch = r.path === currentRoute;
                const willDeny = user && user.role !== r.allowedRole;
                return (
                  <button
                    key={r.path}
                    onClick={() => {
                      onNavigate(r.path);
                      setIsMobileExpanded(false);
                    }}
                    className={`p-2 rounded text-xs font-mono transition-all text-left flex items-center justify-between gap-1 cursor-pointer ${
                      isMatch
                        ? 'bg-red-600 text-white font-bold shadow'
                        : willDeny
                        ? 'bg-slate-900 text-slate-300 hover:text-red-300 border border-slate-800'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{r.shortLabel}</span>
                    {willDeny ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                        Deny
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">
                        Allow
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Quick Role Switch */}
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1.5">
              Switch Test Account:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => {
                const isCurrent = user?.role === acc.role;
                return (
                  <button
                    key={acc.role}
                    onClick={() => {
                      handleQuickSwitch(acc.email, acc.pass);
                      setIsMobileExpanded(false);
                    }}
                    className={`p-2 rounded text-xs font-bold uppercase transition-colors cursor-pointer text-left flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{acc.label}</span>
                    {isCurrent && <span className="text-[9px] font-mono">ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={() => {
                onOpenTestMatrix();
                setIsMobileExpanded(false);
              }}
              className="w-full py-2 rounded bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t('btn_test_suite')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
