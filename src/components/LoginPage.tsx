import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useThemeLanguage } from '../context/ThemeLanguageContext.js';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound, AlertCircle, Sparkles, Scale, FileCheck, Languages, Palette } from 'lucide-react';
import { AshokaChakraIcon, NationalEmblemSeal } from './AshokaChakraIcon.js';
import { IndianNationalRibbon } from './IndianNationalRibbon.js';

interface LoginPageProps {
  onSuccessRedirect: (path: string) => void;
  onOpenTestMatrix?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessRedirect, onOpenTestMatrix }) => {
  const { login, loginError, sessionExpiredMessage, getRoleDashboardPath } = useAuth();
  const { themeDetails, languageDetails, setIsLanguageModalOpen, setIsThemeModalOpen, t } =
    useThemeLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo accounts quick-select to facilitate testing without manual typing
  const demoAccounts = [
    {
      roleName: t('role_admin'),
      roleBadge: 'ADMIN',
      email: 'admin@evinex.demo',
      pass: 'Evinex@Admin2026',
      color: 'hover:border-red-500/50 hover:bg-red-950/20 text-red-300',
    },
    {
      roleName: t('role_legal_officer'),
      roleBadge: 'LEGAL_OFFICER',
      email: 'legalofficer@evinex.demo',
      pass: 'Evinex@Legal2026',
      color: 'hover:border-amber-500/50 hover:bg-amber-950/20 text-amber-300',
    },
    {
      roleName: t('role_advocate'),
      roleBadge: 'ADVOCATE',
      email: 'advocate@evinex.demo',
      pass: 'Evinex@Advocate2026',
      color: 'hover:border-emerald-500/50 hover:bg-emerald-950/20 text-emerald-300',
    },
    {
      roleName: t('role_user'),
      roleBadge: 'USER',
      email: 'user@evinex.demo',
      pass: 'Evinex@User2026',
      color: 'hover:border-sky-500/50 hover:bg-sky-950/20 text-sky-300',
    },
  ];

  const handleQuickFill = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        // Successful login: the backend returned the authenticated role
        // Redirect according to their role
        const targetPath = getRoleDashboardPath();
        onSuccessRedirect(targetPath);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="evinex-login-page"
      className="relative min-h-screen w-full flex flex-col justify-between bg-transparent text-slate-100 overflow-hidden"
    >
      {/* Indian National Top Ribbon */}
      <IndianNationalRibbon />

      {/* Top Header bar with Indian Emblem */}
      <header className="relative z-10 w-full border-b border-slate-800/60 bg-[#070B16]/80 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <NationalEmblemSeal />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language button on header */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              type="button"
              className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 min-h-[34px] flex items-center gap-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-amber-300 font-bold hidden xs:inline">{languageDetails.nativeName}</span>
              <span className="font-mono uppercase text-[10px] text-slate-400">({languageDetails.code})</span>
            </button>

            {/* Theme button on header */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              type="button"
              className="text-[11px] sm:text-xs font-semibold px-2 py-1 min-h-[34px] flex items-center gap-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-400 border border-slate-700 cursor-pointer"
              title="Change National Theme"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            <span className="hidden sm:flex text-[10px] sm:text-[11px] font-mono uppercase tracking-wider sm:tracking-widest text-slate-400 bg-slate-900/80 px-2 sm:px-2.5 py-1 rounded border border-slate-800 items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>SHA-256 Ledger Live</span>
            </span>

            {onOpenTestMatrix && (
              <button
                type="button"
                onClick={onOpenTestMatrix}
                className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 min-h-[34px] flex items-center rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer whitespace-nowrap"
              >
                {t('btn_test_suite')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Login Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6 my-4 sm:my-6">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-5 sm:mb-8">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4 relative">
              <img
                src="/evinex_logo.png"
                alt="EviNex Logo"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-contain shadow-2xl shadow-sky-950/80 border border-sky-500/40 p-1.5 bg-[#0A1020]/90 transition-transform duration-300 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-slate-100 font-sans">
              Evi<span className="text-sky-400">Nex</span>
            </h1>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-semibold text-amber-400/90 mt-1 font-serif">
              सत्यमेव जयते • Secure Digital Document Management
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 sm:mt-2 font-normal">
              SECURE • TRACK • PROTECT
            </p>
          </div>

          {/* Glassmorphism Login Card */}
          <div
            id="login-card"
            className="relative rounded-2xl bg-[#0C1322]/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl p-4 sm:p-8 overflow-hidden transition-all duration-300 hover:border-slate-700"
          >
            {/* Red Accent Trim at Card Top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

            {/* Session Expired / Status Notice */}
            {sessionExpiredMessage && (
              <div
                id="session-expired-alert"
                className="mb-4 sm:mb-5 p-3 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{sessionExpiredMessage}</span>
              </div>
            )}

            {/* Login Error Notification */}
            {loginError && (
              <div
                id="login-error-alert"
                className="mb-4 sm:mb-5 p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-medium">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@evinex.demo"
                    className="w-full pl-9 pr-3 py-3 min-h-[44px] bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-3 min-h-[44px] bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer min-w-[40px] justify-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none min-h-[36px]">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>

                <span className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <KeyRound className="w-3 h-3 text-slate-400" />
                  PBKDF2-SHA512
                </span>
              </div>

              {/* Submit Login Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 min-h-[46px] rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-sm shadow-lg shadow-red-950/50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-red-500/40 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Login to Secure Repository</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Quick-Fill Section */}
            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Quick Demo Accounts
                </span>
                <span className="text-[10px] text-slate-500 hidden xs:inline">1-click test fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.roleBadge}
                    id={`quick-fill-${acc.roleBadge.toLowerCase()}`}
                    type="button"
                    onClick={() => handleQuickFill(acc.email, acc.pass)}
                    className={`text-left p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 transition-all text-xs cursor-pointer min-h-[44px] active:scale-[0.98] ${acc.color}`}
                  >
                    <div className="font-semibold text-[11px] leading-tight flex items-center justify-between">
                      <span>{acc.roleName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                      {acc.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with statutory notices */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 bg-[#070B16]/80 px-4 sm:px-6 py-3 sm:py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-[11px] sm:text-xs">Electronic Evidentiary Compliance: BSA, 2023 (Sec 63)</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-400">
            <span>EVINEX Cryptographic Vault • Zero-Trust RBAC</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
