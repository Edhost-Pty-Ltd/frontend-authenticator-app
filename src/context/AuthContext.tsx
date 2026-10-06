import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authClient } from '@/services/authClient';
import type { ActivityItem, AuthSuccess, LoginResult, User } from '@/types/auth';
import { nameFromEmail } from '@/utils/format';

const NAMES_KEY = 'authen.names.v1';

type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated';

type AuthValue = {
  status: AuthStatus;
  user: User | null;
  displayName: string;
  activity: ActivityItem[];
  pendingToken: string | null;
  pendingEmail: string | null;
  pendingResetToken: string | null;
  freshBackupCodes: string[] | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string) => Promise<void>;
  verifyTwoFactor: (code: string, isBackupCode?: boolean) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (password: string, token?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  rememberBackupCodes: (codes: string[]) => void;
  clearBackupCodes: () => void;
  enrollTwoFactor: () => ReturnType<typeof authClient.enrollTwoFactor>;
  activateTwoFactor: (code: string) => Promise<string[]>;
  disableTwoFactor: (password: string, code: string) => Promise<void>;
  regenerateBackupCodes: (password: string, code: string) => Promise<string[]>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<void>;
  listSessions: () => ReturnType<typeof authClient.listSessions>;
  revokeSession: (sessionId: string) => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function readNames() {
  try {
    const raw = await AsyncStorage.getItem(NAMES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayNameState] = useState('there');
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingResetToken, setPendingResetToken] = useState<string | null>(null);
  const [freshBackupCodes, setFreshBackupCodes] = useState<string[] | null>(null);

  const applyName = useCallback(async (email: string) => {
    const names = await readNames();
    setDisplayNameState(names[email] || nameFromEmail(email));
  }, []);

  const applySession = useCallback(
    async (result: AuthSuccess) => {
      setUser(result.user);
      setPendingToken(null);
      setPendingEmail(null);
      setStatus('authenticated');
      const items = await authClient.listActivity();
      setActivity(items);
      await applyName(result.user.email);
    },
    [applyName],
  );

  useEffect(() => {
    let cancelled = false;
    authClient
      .getCurrentUser()
      .then(async (current) => {
        if (cancelled) return;
        setUser(current);
        setActivity(await authClient.listActivity());
        await applyName(current.email);
        if (!cancelled) setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) setStatus('unauthenticated');
      });
    return () => {
      cancelled = true;
    };
  }, [applyName]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authClient.login({ email, password });
      if (result.requires2FA) {
        setPendingToken(result.pendingToken);
        setPendingEmail(result.email);
        return result;
      }
      await applySession(result);
      return result;
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const result = await authClient.register({ email, password });
      await applySession(result);
    },
    [applySession],
  );

  const verifyTwoFactor = useCallback(
    async (code: string, isBackupCode = false) => {
      if (!pendingToken) {
        throw new Error('Sign in again to verify your code.');
      }
      const result = await authClient.verifyTwoFactor({ pendingToken, code, isBackupCode });
      await applySession(result);
    },
    [applySession, pendingToken],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const result = await authClient.requestPasswordReset(email);
    setPendingResetToken(result.handoffToken);
    return result.message;
  }, []);

  const resetPassword = useCallback(
    async (password: string, token?: string) => {
      await authClient.resetPassword({ token: token || pendingResetToken || '', password });
      setPendingResetToken(null);
    },
    [pendingResetToken],
  );

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } finally {
      setUser(null);
      setActivity([]);
      setFreshBackupCodes(null);
      setPendingToken(null);
      setPendingEmail(null);
      setStatus('unauthenticated');
    }
  }, []);

  const refreshAccount = useCallback(async () => {
    const [current, items] = await Promise.all([authClient.getCurrentUser(), authClient.listActivity()]);
    setUser(current);
    setActivity(items);
  }, []);

  const setDisplayName = useCallback(
    async (name: string) => {
      if (!user) return;
      const trimmed = name.trim();
      const next = trimmed || nameFromEmail(user.email);
      const names = await readNames();
      names[user.email] = next;
      await AsyncStorage.setItem(NAMES_KEY, JSON.stringify(names));
      setDisplayNameState(next);
    },
    [user],
  );

  const rememberBackupCodes = useCallback((codes: string[]) => {
    setFreshBackupCodes(codes);
  }, []);

  const clearBackupCodes = useCallback(() => {
    setFreshBackupCodes(null);
  }, []);

  const activateTwoFactor = useCallback(async (code: string) => {
    const result = await authClient.activateTwoFactor(code);
    setFreshBackupCodes(result.backupCodes);
    setUser((current) => (current ? { ...current, twoFactorEnabled: true } : current));
    return result.backupCodes;
  }, []);

  const disableTwoFactor = useCallback(async (password: string, code: string) => {
    await authClient.disableTwoFactor({ password, code });
    setFreshBackupCodes(null);
    setUser((current) => (current ? { ...current, twoFactorEnabled: false } : current));
  }, []);

  const regenerateBackupCodes = useCallback(async (password: string, code: string) => {
    const result = await authClient.regenerateBackupCodes({ password, code });
    setFreshBackupCodes(result.backupCodes);
    return result.backupCodes;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, nextPassword: string) => {
    await authClient.changePassword({ currentPassword, nextPassword });
    const current = await authClient.getCurrentUser();
    setUser(current);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      displayName,
      activity,
      pendingToken,
      pendingEmail,
      pendingResetToken,
      freshBackupCodes,
      login,
      register,
      verifyTwoFactor,
      requestPasswordReset,
      resetPassword,
      logout,
      refreshAccount,
      setDisplayName,
      rememberBackupCodes,
      clearBackupCodes,
      enrollTwoFactor: authClient.enrollTwoFactor,
      activateTwoFactor,
      disableTwoFactor,
      regenerateBackupCodes,
      changePassword,
      listSessions: authClient.listSessions,
      revokeSession: authClient.revokeSession,
    }),
    [
      status,
      user,
      displayName,
      activity,
      pendingToken,
      pendingEmail,
      pendingResetToken,
      freshBackupCodes,
      login,
      register,
      verifyTwoFactor,
      requestPasswordReset,
      resetPassword,
      logout,
      refreshAccount,
      setDisplayName,
      rememberBackupCodes,
      clearBackupCodes,
      activateTwoFactor,
      disableTwoFactor,
      regenerateBackupCodes,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
