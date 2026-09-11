import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useThemeLanguage } from '../context/ThemeLanguageContext.js';
import { ShieldCheck, LogOut, Lock, Award, TestTube, Scale, BookOpen, Languages, Palette } from 'lucide-react';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';
import { IndianNationalRibbon } from './IndianNationalRibbon.js';

interface NavbarProps {
  onOpenTestMatrix?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTestMatrix }) => {
  const { user, logout } = useAuth();
  const { themeDetails, languageDetails, setIsLanguageModalOpen, setIsThemeModalOpen, t } =
    useThemeLanguage();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'ADMIN':
        return (
          <span
            id="role-badge-admin"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-red-950/80 text-red-300 border border-red-500/40 shadow-sm whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <span className="hidden xs:inline">{t('role_admin')}</span>
            <span className="xs:hidden">Admin</span>
          </span>
        );
      case 'USER':
        return (
          <span
            id="role-badge-user"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-500/40 shadow-sm whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            {t('role_user')}
          </span>
        );
      case 'LEGAL_OFFICER':
        return (
          <span
            id="role-badge-legal"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span className="hidden xs:inline">{t('role_legal_officer')}</span>
            <span className="xs:hidden">Legal</span>
          </span>
        );
      case 'ADVOCATE':
        return (
          <span
            id="role-badge-advocate"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {t('role_advocate')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-[#070B16]/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 shadow-md"
    >
      {/* Indian National Top Ribbon */}
      <IndianNationalRibbon />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Brand / Logo with Ashoka insignia */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative flex items-center justify-center">
            <img
              src="/evinex_logo.png"
              alt="EviNex Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain shadow-md border border-sky-500/30 shrink-0"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-black tracking-wider text-slate-100 font-sans leading-tight">
                Evi<span className="text-sky-400">Nex</span>
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                SDMS v4.2
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-wide font-medium hidden sm:inline leading-tight">
              {t('app_subtitle')} •{' '}
              <span className="text-amber-300/90 font-serif font-semibold">सत्यमेव जयते</span>
            </span>
          </div>
        </div>

        {/* Right: Role indicator, Language/Theme triggers, RBAC Matrix & Logout */}
        {user && (
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Language Switcher Icon on small screens */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer md:hidden"
              title="Change language"
              aria-label="Change language"
            >
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono text-[10px] uppercase">{languageDetails.code}</span>
            </button>

            {/* Quick Theme Switcher Icon on small screens */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              type="button"
              className="inline-flex items-center p-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700 cursor-pointer md:hidden"
              title="Change theme"
              aria-label="Change theme"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {/* RBAC Matrix & Testing Suite Button */}
            {onOpenTestMatrix && (
              <button
                id="open-test-matrix-btn"
                onClick={onOpenTestMatrix}
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer active:scale-95"
                title="View Role Permission Matrix & Run Verification Tests"
                aria-label="View Role Permission Matrix & Run Verification Tests"
              >
                <TestTube className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline text-slate-300">{t('btn_test_suite')}</span>
              </button>
            )}

            {/* Role Badge */}
            <div className="flex items-center">{getRoleBadge()}</div>

            {/* User Profile Info on Large screens */}
            <div className="hidden lg:flex flex-col text-right border-l border-slate-800 pl-3">
              <span className="text-xs font-bold text-slate-200 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[150px] xl:max-w-[200px]">
                {user.designation}
              </span>
            </div>

            {/* Logout Button */}
            <button
              id="logout-btn"
              onClick={() => logout()}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] rounded-lg text-xs font-medium text-slate-300 hover:text-red-300 bg-slate-800/60 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 transition-all cursor-pointer active:scale-95"
              aria-label="Log out of session"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="hidden md:inline">{t('btn_logout')}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
