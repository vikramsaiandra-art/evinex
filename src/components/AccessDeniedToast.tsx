import React, { useEffect } from 'react';
import { AlertOctagon, X } from 'lucide-react';

interface AccessDeniedToastProps {
  message: string | null;
  onClose: () => void;
}

export const AccessDeniedToast: React.FC<AccessDeniedToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      id="access-denied-notification"
      role="alert"
      className="fixed top-20 right-3 left-3 sm:left-auto sm:right-6 z-50 max-w-md w-full bg-[#1A0B0E] border-2 border-red-500/70 text-red-200 p-4 rounded-xl shadow-2xl shadow-red-950/80 backdrop-blur-md transition-all animate-bounce"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-900/60 border border-red-500/50 text-red-300 shrink-0">
          <AlertOctagon className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-100 flex items-center gap-1.5">
            RBAC Authorization Guard
          </h4>
          <p className="text-xs text-red-300/95 mt-1 font-medium leading-relaxed">
            {message}
          </p>
          <span className="inline-block mt-2 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
            HTTP 403 Forbidden • Redirected to Assigned Workspace
          </span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="text-red-400 hover:text-red-100 p-1 rounded-md hover:bg-red-900/40 cursor-pointer"
          aria-label="Dismiss access denied alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
