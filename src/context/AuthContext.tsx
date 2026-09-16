import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  accessDeniedMessage: string | null;
  sessionExpiredMessage: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  adminLogin: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAccessDenied: () => void;
  triggerAccessDenied: (attemptedPath: string) => void;
  getRoleDashboardPath: (role?: Role) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'evinex_auth_token';
const USER_KEY = 'evinex_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // Helper to map role to required route
  const getRoleDashboardPath = useCallback((role?: Role): string => {
    const targetRole = role || user?.role;
    switch (targetRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'USER':
        return '/user/dashboard';
      case 'LEGAL_OFFICER':
        return '/legal/dashboard';
      case 'ADVOCATE':
        return '/advocate/dashboard';
      default:
        return '/login';
    }
  }, [user?.role]);

  // Verify session on initial load
  useEffect(() => {
    const verifyInitialSession = async () => {
      const activeToken = token;
      if (!activeToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token invalid or expired
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
          setUser(null);
          setToken(null);
          setSessionExpiredMessage('Your session has expired. Please log in again.');
        }
      } catch (err) {
        console.error('Session validation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyInitialSession();
  }, [token]);

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setLoginError(null);
    setAccessDeniedMessage(null);
    setSessionExpiredMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || 'Invalid email or password.');
        return false;
      }

      return completeLogin(data.token, data.user, rememberMe);
    } catch (err) {
      console.error('Login request failure:', err);
      setLoginError('Invalid email or password.');
      return false;
    }
  };

  // Dedicated Administrator Portal login (POST /api/auth/admin-login)
  const adminLogin = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setLoginError(null);
    setAccessDeniedMessage(null);
    setSessionExpiredMessage(null);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || 'Invalid administrator credentials.');
        return false;
      }

      return completeLogin(data.token, data.user, rememberMe);
    } catch (err) {
      console.error('Admin portal login failure:', err);
      setLoginError('Invalid administrator credentials.');
      return false;
    }
  };

  // Google Sign-In (Gmail) — credential is a Google ID token, or a
  // demo:<email> token when no OAuth client is configured on the server.
  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    setLoginError(null);
    setAccessDeniedMessage(null);
    setSessionExpiredMessage(null);

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.error || 'Google sign-in failed.');
        return false;
      }

      return completeLogin(data.token, data.user, true);
    } catch (err) {
      console.error('Google sign-in failure:', err);
      setLoginError('Google sign-in failed. Please try again.');
      return false;
    }
  };

  const completeLogin = (receivedToken: string, authenticatedUser: User, rememberMe: boolean): boolean => {
    setToken(receivedToken);
    setUser(authenticatedUser);

    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, receivedToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    } else {
      sessionStorage.setItem(TOKEN_KEY, receivedToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    }

    return true;
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Logout network sync error:', err);
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    setUser(null);
    setToken(null);
    setLoginError(null);
  };

  const triggerAccessDenied = (attemptedPath: string) => {
    console.warn(`RBAC Violation: Attempted access to ${attemptedPath}`);
    setAccessDeniedMessage('Access denied. You do not have permission to access this area.');
  };

  const clearAccessDenied = () => {
    setAccessDeniedMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        loginError,
        accessDeniedMessage,
        sessionExpiredMessage,
        login,
        adminLogin,
        loginWithGoogle,
        logout,
        clearAccessDenied,
        triggerAccessDenied,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
