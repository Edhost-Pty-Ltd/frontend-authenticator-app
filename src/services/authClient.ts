import type { ActivityItem, AuthSuccess, Enrollment, LoginResult, SessionInfo, User } from '@/types/auth';

/**
 * UI-facing auth API.
 *
 * Screens should call these methods (through AuthProvider), not HTTP directly.
 * `mockAuthClient` is the current implementation. Replace it with a fetch
 * client for the Express API without changing the screens.
 *
 * Endpoint map:
 * register                 POST /auth/register
 * login                    POST /auth/login
 * verifyTwoFactor          POST /auth/2fa/verify
 * requestPasswordReset     POST /auth/password-reset/request
 * resetPassword            POST /auth/password-reset
 * logout                   POST /auth/logout
 * getCurrentUser           GET  /auth/me
 * getTwoFactorStatus       GET  /auth/2fa/status
 * enrollTwoFactor          POST /auth/2fa/enroll
 * activateTwoFactor        POST /auth/2fa/activate
 * disableTwoFactor         POST /auth/2fa/disable
 * regenerateBackupCodes    POST /auth/2fa/backup-codes/regenerate
 *
 * changePassword, listSessions, revokeSession, and listActivity are local
 * until matching routes exist. Password changes can later follow the reset flow.
 */
export interface AuthClient {
  register(input: { email: string; password: string }): Promise<AuthSuccess>;
  login(input: { email: string; password: string }): Promise<LoginResult>;
  verifyTwoFactor(input: {
    pendingToken: string;
    code: string;
    isBackupCode?: boolean;
  }): Promise<AuthSuccess>;
  requestPasswordReset(email: string): Promise<{ message: string; handoffToken: string | null }>;
  resetPassword(input: { token: string; password: string }): Promise<{ message: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  enrollTwoFactor(): Promise<Enrollment>;
  activateTwoFactor(code: string): Promise<{ backupCodes: string[] }>;
  disableTwoFactor(input: { password: string; code: string }): Promise<void>;
  regenerateBackupCodes(input: { password: string; code: string }): Promise<{ backupCodes: string[] }>;
  changePassword(input: { currentPassword: string; nextPassword: string }): Promise<void>;
  listSessions(): Promise<SessionInfo[]>;
  revokeSession(sessionId: string): Promise<void>;
  listActivity(): Promise<ActivityItem[]>;
}

export { mockAuthClient as authClient } from '@/services/mockAuth';
