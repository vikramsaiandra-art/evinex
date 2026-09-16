import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import { AshokaChakraIcon } from './AshokaChakraIcon.js';

interface AccessDeniedScreenProps {
  attemptedRoute: string;
  userRole: string;
  onReturnToAuthorized: () => void;
  onSwitchAccount?: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  attemptedRoute,
  userRole,
  onReturnToAuthorized,
  onSwitchAccount,
}) => {
  return (
    <div
      id="access-denied-screen"
      className="min-h-app flex items-center justify-center p-4 bg-[#070B16] text-slate-100"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0D1322] border-2 border-red-500/60 shadow-2xl shadow-red-950/50 p-5 sm:p-8 text-center space-y-5 sm:space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-lg shadow-red-950/60">
          <ShieldAlert className="w-9 h-9 animate-pulse" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/90 text-red-400 border border-red-800">
            HTTP 403 FORBIDDEN • STRICT RBAC
          </div>
          <h2 className="text-xl font-black text-slate-100 font-sans tracking-tight">
            Access denied. You do not have permission to access this resource.
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            The requested URI <code className="text-red-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">{attemptedRoute}</code> is restricted. Your current security credential has role <code className="text-amber-400 font-mono font-bold">{userRole}</code>, which is strictly prohibited from accessing this protected route.
          </p>
        </div>

        {/* Audit Log Stamp */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Security Action:</span>
            <span className="text-red-400 font-bold">UNAUTHORIZED_ROUTE_BLOCKED</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Evidentiary Audit:</span>
            <span className="text-emerald-400">Logged to Immutable Ledger</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Statutory Compliance:</span>
            <span className="text-slate-300">BSA 2023 Sec 63 / IT Act 2000</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onReturnToAuthorized}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/60 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Authorized Dashboard</span>
          </button>

          {onSwitchAccount && (
            <button
              onClick={onSwitchAccount}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer"
            >
              Switch Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
