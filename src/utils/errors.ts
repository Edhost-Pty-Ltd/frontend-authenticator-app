export type AuthErrorCode =
  | 'invalid_credentials'
  | 'invalid_code'
  | 'rate_limited'
  | 'validation'
  | 'conflict'
  | 'expired';

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error && error.message && !/network|fetch|axios|status code/i.test(error.message)) {
    return fallback;
  }
  return fallback;
}
