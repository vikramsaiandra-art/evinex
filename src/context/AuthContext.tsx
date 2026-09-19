import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types.js';
import { apiUrl, describeApiTarget } from '../apiBase.js';

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

// ------------------------------------------------------------
// PRECISE LOGIN-FAILURE REPORTING
// Distinguishes "wrong credentials" from "backend unreachable"
// and "database down" so production deployment issues are never
// misreported (or silently swallowed) as invalid credentials.
// ------------------------------------------------------------
interface LoginResponsePayload {
  error?: string;
  token?: string;
  user?: User;
}

function describeLoginFailure(
  response: Response,
  data: LoginResponsePayload | null,
  credentialFallback: string
): string {
  if (response.status === 503) {
    return 'Database connection unavailable. Please try again shortly.';
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    // A non-JSON body (e.g. a static host's HTML 404 page) means the
    // request never reached the EVINEX API — a deployment/config issue.
    if (response.status === 404) {
      return `API endpoint not found (HTTP 404, non-JSON response from ${describeApiTarget()}). The deployed API URL (VITE_API_BASE) is wrong or the backend routes are missing — see the Console for details.`;
    }
    if (response.status >= 500) {
      return `Backend error (HTTP ${response.status}, non-JSON response) from ${describeApiTarget()}. Check the deployed backend logs — see the Console for details.`;
    }
    return `Authentication server unavailable. The API endpoint did not respond correctly (HTTP ${response.status}, non-JSON from ${describeApiTarget()}) — check the deployed API URL (VITE_API_BASE).`;
  }
  return data?.error || credentialFallback;
}

function serverUnavailableMessage(): string {
  return 'Authentication server unavailable. Check your connection or the deployed API URL (VITE_API_BASE).';
}

// fetch() only rejects with TypeError on network-level failures —
// either the backend is down/unreachable, or the response was blocked
// by CORS. This keeps "wrong password" and "backend unreachable"
// clearly separate for both users and deployers.
function networkFailureMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return `Cannot reach the authentication server at ${describeApiTarget()}. The backend may be down or blocking cross-origin (CORS) requests — see the Console for details.`;
  }
  return serverUnavailableMessage();
}

// Console-only diagnostic (never shown in the UI): status, content
// type and the exact API target, so deployment issues are visible in
// DevTools. Contains no secrets.
function logFailedAuthRequest(action: string, response: Response): void {
  // eslint-disable-next-line no-console
  console.error(
    `[EVINEX AUTH] ${action} → HTTP ${response.status} ` +
      `(${response.headers.get('content-type') || 'no content-type'}) ` +
      `from ${describeApiTarget()}`
  );
}

async function parseJsonResponse(response: Response): Promise<LoginResponsePayload | null> {
  try {
    return (await response.json()) as LoginResponsePayload;
  } catch {
    // Body was not JSON (HTML error page, empty body, etc.)
    return null;
  }
}

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

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        logFailedAuthRequest(`POST ${apiUrl('/api/auth/login')}`, response);
        setLoginError(describeLoginFailure(response, data, 'Invalid email or password.'));
        return false;
      }

      if (!data || !data.token || !data.user) {
        console.error('Login response missing token/user payload.', data);
        setLoginError(serverUnavailableMessage());
        return false;
      }

      return completeLogin(data.token, data.user, rememberMe);
    } catch (err) {
      console.error(`[EVINEX AUTH] POST ${apiUrl('/api/auth/login')} failed before a response was received:`, err);
      setLoginError(networkFailureMessage(err));
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

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        logFailedAuthRequest(`POST ${apiUrl('/api/auth/admin-login')}`, response);
        setLoginError(describeLoginFailure(response, data, 'Invalid administrator credentials.'));
        return false;
      }

      if (!data || !data.token || !data.user) {
        console.error('Admin login response missing token/user payload.', data);
        setLoginError(serverUnavailableMessage());
        return false;
      }

      return completeLogin(data.token, data.user, rememberMe);
    } catch (err) {
      console.error(`[EVINEX AUTH] POST ${apiUrl('/api/auth/admin-login')} failed before a response was received:`, err);
      setLoginError(networkFailureMessage(err));
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

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        logFailedAuthRequest(`POST ${apiUrl('/api/auth/google')}`, response);
        setLoginError(describeLoginFailure(response, data, 'Google sign-in failed.'));
        return false;
      }

      if (!data || !data.token || !data.user) {
        console.error('Google sign-in response missing token/user payload.', data);
        setLoginError(serverUnavailableMessage());
        return false;
      }

      return completeLogin(data.token, data.user, true);
    } catch (err) {
      console.error(`[EVINEX AUTH] POST ${apiUrl('/api/auth/google')} failed before a response was received:`, err);
      setLoginError(networkFailureMessage(err));
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
