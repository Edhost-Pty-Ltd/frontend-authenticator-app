import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { loadAccounts, saveAccounts } from '@/services/authenticatorStore';
import type { AuthenticatorAccount, ParsedSetup } from '@/types/authenticator';
import { createId } from '@/utils/id';

type AuthenticatorValue = {
  accounts: AuthenticatorAccount[];
  ready: boolean;
  now: number;
  addAccount: (setup: ParsedSetup) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
};

const AuthenticatorContext = createContext<AuthenticatorValue | null>(null);

export function AuthenticatorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AuthenticatorAccount[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setAccounts([]);
      setReady(false);
      return;
    }
    let cancelled = false;
    setReady(false);
    loadAccounts(userId)
      .then((loaded) => {
        if (!cancelled) setAccounts(loaded);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = useCallback(
    async (next: AuthenticatorAccount[]) => {
      setAccounts(next);
      if (user) await saveAccounts(user.id, next);
    },
    [user],
  );

  const addAccount = useCallback(
    async (setup: ParsedSetup) => {
      const duplicate = accounts.some(
        (item) => item.secret === setup.secret && item.issuer === setup.issuer && item.label === setup.label,
      );
      if (duplicate) throw new Error('This account is already saved on this device.');
      const account: AuthenticatorAccount = {
        id: createId('code'),
        issuer: setup.issuer,
        label: setup.label,
        secret: setup.secret,
        digits: setup.digits,
        period: setup.period,
        algorithm: setup.algorithm,
        createdAt: new Date().toISOString(),
      };
      await persist([account, ...accounts]);
    },
    [accounts, persist],
  );

  const removeAccount = useCallback(
    async (id: string) => {
      await persist(accounts.filter((item) => item.id !== id));
    },
    [accounts, persist],
  );

  const value = useMemo(
    () => ({ accounts, ready, now, addAccount, removeAccount }),
    [accounts, ready, now, addAccount, removeAccount],
  );

  return <AuthenticatorContext.Provider value={value}>{children}</AuthenticatorContext.Provider>;
}

export function useAuthenticator() {
  const value = useContext(AuthenticatorContext);
  if (!value) throw new Error('useAuthenticator must be used within AuthenticatorProvider');
  return value;
}
