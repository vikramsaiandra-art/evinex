import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { LoginPage } from './components/LoginPage.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { UserDashboard } from './components/UserDashboard.js';
import { LegalOfficerDashboard } from './components/LegalOfficerDashboard.js';
import { AdvocateDashboard } from './components/AdvocateDashboard.js';
import { AccessDeniedScreen } from './components/AccessDeniedScreen.js';
import { AccessDeniedToast } from './components/AccessDeniedToast.js';
import { TestMatrixModal } from './components/TestMatrixModal.js';
import { RouteSimulatorBar } from './components/RouteSimulatorBar.js';
import { AshokaChakraIcon } from './components/AshokaChakraIcon.js';
import { LanguageSelectorModal } from './components/LanguageSelectorModal.js';
import { ThemeSelectorModal } from './components/ThemeSelectorModal.js';
import { IndianNationalBackground } from './components/IndianNationalBackground.js';

// Route matching helper
const getRoleDefaultRoute = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
      return '/user/dashboard';
    case 'LEGAL_OFFICER':
      return '/legal/dashboard';
    case 'ADVOCATE':
      return '/advocate/dashboard';
    default:
      return '/user/dashboard';
  }
};

const AppContent: React.FC = () => {
  const { user, token, isLoading, accessDeniedMessage, triggerAccessDenied, clearAccessDenied } =
    useAuth();
  const {
    themeDetails,
    isLanguageModalOpen,
    setIsLanguageModalOpen,
    isThemeModalOpen,
    setIsThemeModalOpen,
  } = useThemeLanguage();

  const [currentRoute, setCurrentRoute] = useState<string>('/login');
  const [isTestMatrixOpen, setIsTestMatrixOpen] = useState(false);

  // Sync route on login or user change
  useEffect(() => {
    if (user) {
      // If currently on login or default root, route to role dashboard
      if (currentRoute === '/login' || currentRoute === '/') {
        setCurrentRoute(getRoleDefaultRoute(user.role));
      }
    } else {
      setCurrentRoute('/login');
    }
  }, [user]);

  // Route navigation handler with RBAC validation & auditing
  const handleNavigate = async (targetRoute: string) => {
    setCurrentRoute(targetRoute);

    if (!user) return;

    // Check if user is attempting an unauthorized route
    let isUnauthorized = false;
    let requiredRole = '';

    if (targetRoute === '/admin/dashboard' && user.role !== 'ADMIN') {
      isUnauthorized = true;
      requiredRole = 'ADMIN';
    } else if (targetRoute === '/user/dashboard' && user.role !== 'USER') {
      isUnauthorized = true;
      requiredRole = 'USER';
    } else if (targetRoute === '/legal/dashboard' && user.role !== 'LEGAL_OFFICER') {
      isUnauthorized = true;
      requiredRole = 'LEGAL_OFFICER';
    } else if (targetRoute === '/advocate/dashboard' && user.role !== 'ADVOCATE') {
      isUnauthorized = true;
      requiredRole = 'ADVOCATE';
    }

    if (isUnauthorized) {
      triggerAccessDenied(
        `Access denied. You do not have permission to access ${targetRoute}. Required: ${requiredRole}, Authenticated: ${user.role}`
      );

      // Log to backend audit ledger
      try {
        await fetch('/api/audit-logs/unauthorized', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attemptedRoute: targetRoute,
            requiredRole,
          }),
        });
      } catch (err) {
        console.error('Failed to log unauthorized attempt:', err);
      }
    }
  };

  // If initial auth check is running
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B16] flex flex-col items-center justify-center text-slate-100 space-y-4">
        <div className="relative flex items-center justify-center">
          <img
            src="/evinex_logo.png"
            alt="EviNex Logo"
            className="w-20 h-20 rounded-2xl object-contain shadow-2xl shadow-sky-950/80 border border-sky-500/40 p-1 bg-[#0A1020] animate-pulse"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-200">EviNex Security Gateway</p>
          <p className="text-xs text-slate-400 mt-1">Verifying cryptographic session credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, render LoginPage
  if (!user || !token) {
    return (
      <div className={`min-h-screen ${themeDetails.bgClass} text-slate-100 flex flex-col justify-between transition-colors duration-300 relative overflow-x-hidden`}>
        {/* Authentic Indian National Background (Tricolor glows, Ashoka Chakra & Jaali) */}
        <IndianNationalBackground />

        <div className="relative z-10 flex flex-col flex-1 justify-between">
          <LoginPage onOpenTestMatrix={() => setIsTestMatrixOpen(true)} />
        </div>

        <TestMatrixModal
          isOpen={isTestMatrixOpen}
          onClose={() => setIsTestMatrixOpen(false)}
        />
        <LanguageSelectorModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
        />
        <ThemeSelectorModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />
        {accessDeniedMessage && (
          <AccessDeniedToast message={accessDeniedMessage} onClose={clearAccessDenied} />
        )}
      </div>
    );
  }

  // Validate authorization for current route
  const isRouteAuthorized = () => {
    switch (currentRoute) {
      case '/admin/dashboard':
        return user.role === 'ADMIN';
      case '/user/dashboard':
        return user.role === 'USER';
      case '/legal/dashboard':
        return user.role === 'LEGAL_OFFICER';
      case '/advocate/dashboard':
        return user.role === 'ADVOCATE';
      default:
        return true;
    }
  };

  // Render the appropriate role dashboard or access denied screen
  const renderDashboard = () => {
    if (!isRouteAuthorized()) {
      return (
        <AccessDeniedScreen
          attemptedRoute={currentRoute}
          userRole={user.role}
          onReturnToAuthorized={() => setCurrentRoute(getRoleDefaultRoute(user.role))}
        />
      );
    }

    switch (currentRoute) {
      case '/admin/dashboard':
        return <AdminDashboard />;
      case '/user/dashboard':
        return <UserDashboard />;
      case '/legal/dashboard':
        return <LegalOfficerDashboard />;
      case '/advocate/dashboard':
        return <AdvocateDashboard />;
      default:
        // Fallback to role's home
        switch (user.role) {
          case 'ADMIN':
            return <AdminDashboard />;
          case 'USER':
            return <UserDashboard />;
          case 'LEGAL_OFFICER':
            return <LegalOfficerDashboard />;
          case 'ADVOCATE':
            return <AdvocateDashboard />;
          default:
            return <UserDashboard />;
        }
    }
  };

  return (
    <div className={`min-h-screen ${themeDetails.bgClass} text-slate-100 flex flex-col transition-colors duration-300 relative overflow-x-hidden`}>
      {/* Authentic Indian National Background (Tricolor glows, Ashoka Chakra & Jaali) */}
      <IndianNationalBackground />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Global Navbar */}
        <Navbar onOpenTestMatrix={() => setIsTestMatrixOpen(true)} />

        {/* Interactive Route Simulator & Quick Switch Bar */}
        <RouteSimulatorBar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenTestMatrix={() => setIsTestMatrixOpen(true)}
        />

        {/* Main Viewport */}
        <div className="flex-1 flex flex-col">{renderDashboard()}</div>
      </div>

      {/* Access Denied Toast Notification */}
      <AccessDeniedToast message={accessDeniedMessage} onClose={clearAccessDenied} />

      {/* Interactive Role Matrix & Live RBAC Test Suite Modal */}
      <TestMatrixModal
        isOpen={isTestMatrixOpen}
        onClose={() => setIsTestMatrixOpen(false)}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeLanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeLanguageProvider>
  );
}
