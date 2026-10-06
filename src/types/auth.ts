export type User = {
  id: string;
  email: string;
  createdAt: string;
  passwordChangedAt: string;
  twoFactorEnabled: boolean;
};

export type AuthSuccess = {
  token: string;
  refreshToken: string;
  user: User;
};

export type LoginResult =
  | { requires2FA: true; pendingToken: string; email: string }
  | ({ requires2FA: false } & AuthSuccess);

export type SessionInfo = {
  id: string;
  label: string;
  detail: string;
  lastActiveAt: string;
  current: boolean;
};

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  at: string;
};

export type Enrollment = {
  otpauthUrl: string;
  manualEntryCode: string;
  qrCode?: string;
};
