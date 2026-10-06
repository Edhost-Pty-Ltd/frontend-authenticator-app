export type PasswordChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
};

export function utf8Size(value: string) {
  return new TextEncoder().encode(value).length;
}

export function passwordChecks(password: string): PasswordChecks {
  return {
    length: utf8Size(password) >= 8 && utf8Size(password) <= 72,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
}

export function isStrongPassword(password: string) {
  const checks = passwordChecks(password);
  return checks.length && checks.upper && checks.lower && checks.number;
}

export function isValidEmail(value: string) {
  const email = value.trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeBackupCode(value: string) {
  return value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
}

export function isBackupCode(value: string) {
  return /^[A-F0-9]{10}$/.test(normalizeBackupCode(value));
}

export function isSixDigitCode(value: string) {
  return /^\d{6}$/.test(value);
}
