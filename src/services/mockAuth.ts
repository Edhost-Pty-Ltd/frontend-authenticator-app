import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthClient } from '@/services/authClient';
import type { ActivityItem, SessionInfo, User } from '@/types/auth';
import { AuthError } from '@/utils/errors';
import { createId, delay } from '@/utils/id';
import { isSixDigitCode, isStrongPassword, isValidEmail, normalizeBackupCode } from '@/utils/validation';

const USERS_KEY = 'authen.users.v1';
const SESSION_KEY = 'authen.session.v1';
const LATENCY_MS = 700;

type StoredCode = { code: string; used: boolean };

type StoredUser = {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  passwordChangedAt: string;
  twoFactorEnabled: boolean;
  pendingSecret: string | null;
  backupCodes: StoredCode[];
  sessions: SessionInfo[];
  activity: ActivityItem[];
  resetToken: string | null;
  resetExpiresAt: string | null;
};

type PersistedSession = {
  token: string;
  refreshToken: string;
  userId: string;
  sessionId: string;
};

type Database = { users: StoredUser[] };

const SEEDED_CODES = [
  'A4C91E27B0',
  'B83D0F11C6',
  'C2E77A90D4',
  'D19B4E58A2',
  'E60C3D71F8',
  'F55A28C6B1',
  '0AB47D93E6',
  '1C8E52A0F7',
  '2D6F10B8C3',
  '3E91A4D7B5',
];

const failures = new Map<string, { count: number; until: number }>();

let database: Database = { users: [] };
let session: PersistedSession | null = null;
let loaded: Promise<void> | null = null;

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function seedUser(): StoredUser {
  const createdAt = daysAgo(40);
  return {
    id: 'usr_avery',
    email: 'avery@authen.app',
    password: 'AuthenKey1',
    createdAt,
    passwordChangedAt: daysAgo(12),
    twoFactorEnabled: true,
    pendingSecret: null,
    backupCodes: SEEDED_CODES.map((code) => ({ code, used: false })),
    sessions: [
      {
        id: 'ses_mac',
        label: 'Mac',
        detail: 'Browser',
        lastActiveAt: daysAgo(2),
        current: false,
      },
    ],
    activity: [
      {
        id: 'act_password',
        title: 'Password updated',
        detail: 'Changed from a trusted session',
        at: daysAgo(12),
      },
      {
        id: 'act_2fa',
        title: 'Two-factor authentication enabled',
        detail: 'Authenticator app',
        at: daysAgo(21),
      },
      {
        id: 'act_created',
        title: 'Account created',
        detail: 'avery@authen.app',
        at: createdAt,
      },
    ],
    resetToken: null,
    resetExpiresAt: null,
  };
}

async function ensureLoaded() {
  if (!loaded) {
    loaded = (async () => {
      try {
        const raw = await AsyncStorage.getItem(USERS_KEY);
        if (raw) database = JSON.parse(raw) as Database;
      } catch {
        database = { users: [] };
      }
      if (!Array.isArray(database.users) || database.users.length === 0) {
        database = { users: [seedUser()] };
        await persistUsers();
      }
      try {
        const rawSession = await AsyncStorage.getItem(SESSION_KEY);
        session = rawSession ? (JSON.parse(rawSession) as PersistedSession) : null;
      } catch {
        session = null;
      }
    })();
  }
  await loaded;
}

async function persistUsers() {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(database));
}

async function persistSession() {
  if (session) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else await AsyncStorage.removeItem(SESSION_KEY);
}

function toPublic(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    passwordChangedAt: user.passwordChangedAt,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

function assertNotLocked(key: string) {
  const current = failures.get(key);
  if (current && current.until > Date.now()) {
    throw new AuthError('rate_limited', 'Too many attempts. Please wait a moment before trying again.');
  }
}

function registerFailure(key: string, limit = 5) {
  const now = Date.now();
  const current = failures.get(key);
  const count = !current || current.until > now ? 1 : current.count + 1;
  if (count >= limit) {
    failures.set(key, { count, until: now + 30_000 });
    throw new AuthError('rate_limited', 'Too many attempts. Please wait a moment before trying again.');
  }
  failures.set(key, { count, until: 0 });
}

function clearFailures(key: string) {
  failures.delete(key);
}

function requireUser() {
  if (!session) {
    throw new AuthError('expired', 'Your session ended. Sign in again.');
  }
  const user = database.users.find((item) => item.id === session?.userId);
  if (!user) throw new AuthError('expired', 'Your session ended. Sign in again.');
  return user;
}

function addActivity(user: StoredUser, title: string, detail: string) {
  user.activity.unshift({
    id: createId('act'),
    title,
    detail,
    at: new Date().toISOString(),
  });
  user.activity = user.activity.slice(0, 12);
}

function openSession(user: StoredUser, activity?: { title: string; detail: string }): PersistedSession {
  const sessionId = createId('ses');
  const next: PersistedSession = {
    token: createId('access'),
    refreshToken: createId('refresh'),
    userId: user.id,
    sessionId,
  };
  user.sessions = [
    {
      id: sessionId,
      label: 'This device',
      detail: 'Authen app',
      lastActiveAt: new Date().toISOString(),
      current: true,
    },
    ...user.sessions
      .filter((item) => item.id !== sessionId)
      .map((item) => ({ ...item, current: false })),
  ].slice(0, 6);
  addActivity(user, activity?.title ?? 'Signed in', activity?.detail ?? 'Authen app');
  return next;
}

function randomBase32(length = 16) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let output = '';
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  for (const byte of bytes) output += alphabet[byte % alphabet.length];
  return output;
}

function randomBackupCodes(count = 10) {
  return Array.from({ length: count }, () => {
    const bytes = new Uint8Array(5);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  });
}

function acceptsAuthenticatorCode(code: string) {
  return isSixDigitCode(code) && code !== '000000' && code !== '111111';
}

function assertPasswordAndCode(user: StoredUser, password: string, code: string) {
  if (user.password !== password || !acceptsAuthenticatorCode(code)) {
    throw new AuthError(
      'invalid_code',
      "We couldn't confirm that request. Check your password and authenticator code, then try again.",
    );
  }
}

export const mockAuthClient: AuthClient = {
  async register({ email, password }) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized) || !isStrongPassword(password)) {
      throw new AuthError(
        'validation',
        'Use a valid email and a password with 8 or more characters, including uppercase, lowercase, and a number.',
      );
    }
    if (database.users.some((user) => user.email === normalized)) {
      throw new AuthError('conflict', 'An account with that email already exists. Try signing in instead.');
    }
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: createId('usr'),
      email: normalized,
      password,
      createdAt: now,
      passwordChangedAt: now,
      twoFactorEnabled: false,
      pendingSecret: null,
      backupCodes: [],
      sessions: [],
      activity: [],
      resetToken: null,
      resetExpiresAt: null,
    };
    addActivity(user, 'Account created', normalized);
    session = openSession(user);
    database.users.push(user);
    await persistUsers();
    await persistSession();
    return { token: session.token, refreshToken: session.refreshToken, user: toPublic(user) };
  },

  async login({ email, password }) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const normalized = email.trim().toLowerCase();
    const key = `login:${normalized}`;
    assertNotLocked(key);
    if (!isValidEmail(normalized) || password.length === 0) {
      throw new AuthError('validation', 'Enter the email and password for your account.');
    }
    const user = database.users.find((item) => item.email === normalized);
    if (!user || user.password !== password) {
      registerFailure(key);
      throw new AuthError(
        'invalid_credentials',
        "We couldn't sign you in. Check your email and password and try again.",
      );
    }
    clearFailures(key);
    if (user.twoFactorEnabled) {
      const pendingToken = `pending.${user.id}.${Date.now() + 5 * 60_000}.${createId('nonce')}`;
      return { requires2FA: true, pendingToken, email: user.email };
    }
    session = openSession(user);
    await persistUsers();
    await persistSession();
    return {
      requires2FA: false,
      token: session.token,
      refreshToken: session.refreshToken,
      user: toPublic(user),
    };
  },

  async verifyTwoFactor({ pendingToken, code, isBackupCode }) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const parts = pendingToken.split('.');
    const userId = parts[1];
    const expiresAt = Number(parts[2]);
    if (!userId || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
      throw new AuthError('expired', 'That sign-in attempt expired. Go back and sign in again.');
    }
    const user = database.users.find((item) => item.id === userId);
    if (!user || !user.twoFactorEnabled) {
      throw new AuthError('expired', 'That sign-in attempt expired. Go back and sign in again.');
    }
    const key = `totp:${user.id}`;
    assertNotLocked(key);
    if (isBackupCode) {
      const normalized = normalizeBackupCode(code);
      const match = user.backupCodes.find((item) => item.code === normalized);
      if (!match) {
        registerFailure(key);
        throw new AuthError(
          'invalid_code',
          "That recovery code isn't valid. Check the code and try again.",
        );
      }
      if (match.used) {
        throw new AuthError('invalid_code', 'That recovery code has already been used.');
      }
      match.used = true;
    } else if (!acceptsAuthenticatorCode(code)) {
      registerFailure(key);
      throw new AuthError(
        'invalid_code',
        "That code isn't valid. Check the code in your authenticator and try again.",
      );
    }
    clearFailures(key);
    session = openSession(
      user,
      isBackupCode
        ? { title: 'Signed in with a recovery code', detail: 'One-time code used' }
        : { title: 'Signed in', detail: 'Authenticator code confirmed' },
    );
    await persistUsers();
    await persistSession();
    return { token: session.token, refreshToken: session.refreshToken, user: toPublic(user) };
  },

  async requestPasswordReset(email) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      throw new AuthError('validation', 'Enter the email address for your account.');
    }
    const key = `reset:${normalized}`;
    assertNotLocked(key);
    registerFailure(key, 4);
    const message = 'If an account exists for that email, reset instructions are on the way.';
    const user = database.users.find((item) => item.email === normalized);
    if (!user) return { message, handoffToken: null };
    const token = `${createId('sel')}.${createId('sec')}`;
    user.resetToken = token;
    user.resetExpiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
    await persistUsers();
    return { message, handoffToken: token };
  },

  async resetPassword({ token, password }) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    if (!token || !isStrongPassword(password)) {
      throw new AuthError(
        'validation',
        'This reset link needs a new password with uppercase, lowercase, and a number.',
      );
    }
    const user = database.users.find((item) => item.resetToken === token);
    if (!user || !user.resetExpiresAt || new Date(user.resetExpiresAt).getTime() < Date.now()) {
      throw new AuthError(
        'expired',
        'This reset link is invalid or has expired. Request a new one and try again.',
      );
    }
    user.password = password;
    user.passwordChangedAt = new Date().toISOString();
    user.resetToken = null;
    user.resetExpiresAt = null;
    user.sessions = [];
    addActivity(user, 'Password updated', 'Reset from a recovery link');
    if (session?.userId === user.id) {
      session = null;
      await persistSession();
    }
    await persistUsers();
    return { message: 'Password updated successfully' };
  },

  async logout() {
    await delay(300);
    await ensureLoaded();
    if (session) {
      const user = database.users.find((item) => item.id === session?.userId);
      if (user) {
        user.sessions = user.sessions.filter((item) => item.id !== session?.sessionId);
        await persistUsers();
      }
    }
    session = null;
    await persistSession();
  },

  async getCurrentUser() {
    await ensureLoaded();
    return toPublic(requireUser());
  },

  async enrollTwoFactor() {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const user = requireUser();
    if (user.twoFactorEnabled) {
      throw new AuthError(
        'conflict',
        'Two-factor authentication is already on. Turn it off before setting up a new authenticator.',
      );
    }
    const secret = randomBase32(20);
    user.pendingSecret = secret;
    await persistUsers();
    const label = encodeURIComponent(user.email);
    return {
      manualEntryCode: secret,
      otpauthUrl: `otpauth://totp/Authen:${label}?secret=${secret}&issuer=Authen&digits=6&period=30`,
    };
  },

  async activateTwoFactor(code) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const user = requireUser();
    if (user.twoFactorEnabled) {
      throw new AuthError('conflict', 'Two-factor authentication is already on.');
    }
    if (!user.pendingSecret) {
      throw new AuthError('validation', 'Start setup again to get a new QR code.');
    }
    if (!acceptsAuthenticatorCode(code)) {
      throw new AuthError(
        'invalid_code',
        "That code isn't valid. Check the code in your authenticator and try again.",
      );
    }
    const backupCodes = randomBackupCodes(10);
    user.twoFactorEnabled = true;
    user.pendingSecret = null;
    user.backupCodes = backupCodes.map((value) => ({ code: value, used: false }));
    addActivity(user, 'Two-factor authentication enabled', 'Authenticator app');
    await persistUsers();
    return { backupCodes };
  },

  async disableTwoFactor({ password, code }) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const user = requireUser();
    if (!user.twoFactorEnabled) {
      throw new AuthError('validation', 'Two-factor authentication is already off.');
    }
    assertPasswordAndCode(user, password, code);
    user.twoFactorEnabled = false;
    user.pendingSecret = null;
    user.backupCodes = [];
    addActivity(user, 'Two-factor authentication turned off', 'Protection reduced');
    await persistUsers();
  },

  async regenerateBackupCodes({ password, code }) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const user = requireUser();
    if (!user.twoFactorEnabled) {
      throw new AuthError('validation', 'Turn on two-factor authentication before creating recovery codes.');
    }
    assertPasswordAndCode(user, password, code);
    const backupCodes = randomBackupCodes(10);
    user.backupCodes = backupCodes.map((value) => ({ code: value, used: false }));
    addActivity(user, 'Recovery codes replaced', 'Previous codes no longer work');
    await persistUsers();
    return { backupCodes };
  },

  async changePassword({ currentPassword, nextPassword }) {
    await delay(LATENCY_MS);
    await ensureLoaded();
    const user = requireUser();
    if (user.password !== currentPassword) {
      throw new AuthError('invalid_credentials', "That password doesn't match. Try again.");
    }
    if (!isStrongPassword(nextPassword)) {
      throw new AuthError(
        'validation',
        'Use 8 or more characters with uppercase, lowercase, and a number.',
      );
    }
    if (nextPassword === currentPassword) {
      throw new AuthError('validation', 'Choose a password that is different from your current one.');
    }
    user.password = nextPassword;
    user.passwordChangedAt = new Date().toISOString();
    addActivity(user, 'Password updated', 'Changed while signed in');
    await persistUsers();
  },

  async listSessions() {
    await ensureLoaded();
    const user = requireUser();
    return user.sessions.map((item) => ({ ...item }));
  },

  async revokeSession(sessionId) {
    await delay(400);
    await ensureLoaded();
    const user = requireUser();
    const target = user.sessions.find((item) => item.id === sessionId);
    if (!target) return;
    if (target.current) {
      throw new AuthError('validation', 'Sign out to end the session on this device.');
    }
    user.sessions = user.sessions.filter((item) => item.id !== sessionId);
    addActivity(user, 'Session signed out', target.label);
    await persistUsers();
  },

  async listActivity() {
    await ensureLoaded();
    return requireUser().activity.map((item) => ({ ...item }));
  },
};
