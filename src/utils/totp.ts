import { hmac } from '@noble/hashes/hmac.js';
import { sha1 } from '@noble/hashes/legacy.js';
import { sha256, sha512 } from '@noble/hashes/sha2.js';

import type { ParsedSetup, TotpAlgorithm } from '@/types/authenticator';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const hashers = {
  SHA1: sha1,
  SHA256: sha256,
  SHA512: sha512,
} as const;

export function normalizeSecret(secret: string) {
  return secret.toUpperCase().replace(/[\s=-]/g, '');
}

export function decodeBase32(input: string) {
  const cleaned = normalizeSecret(input);
  if (!cleaned || !/^[A-Z2-7]+$/.test(cleaned)) {
    throw new Error('The setup key is not valid.');
  }

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of cleaned) {
    const value = BASE32.indexOf(char);
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  if (bytes.length === 0) throw new Error('The setup key is not valid.');
  return Uint8Array.from(bytes);
}

function counterBytes(counter: number) {
  const bytes = new Uint8Array(8);
  let value = BigInt(counter);
  for (let index = 7; index >= 0; index -= 1) {
    bytes[index] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}

export function generateTotp({
  secret,
  timeMs = Date.now(),
  period = 30,
  digits = 6,
  algorithm = 'SHA1',
}: {
  secret: string;
  timeMs?: number;
  period?: number;
  digits?: number;
  algorithm?: TotpAlgorithm;
}) {
  const key = decodeBase32(secret);
  const counter = Math.floor(timeMs / 1000 / period);
  const digest = hmac(hashers[algorithm], key, counterBytes(counter));
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);
  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function secondsRemaining(timeMs = Date.now(), period = 30) {
  const elapsed = Math.floor(timeMs / 1000) % period;
  return period - elapsed;
}

export function formatCode(code: string) {
  if (code.length === 6) return `${code.slice(0, 3)} ${code.slice(3)}`;
  if (code.length === 8) return `${code.slice(0, 4)} ${code.slice(4)}`;
  return code;
}

function requireAlgorithm(value: string | null): TotpAlgorithm {
  const algorithm = (value ?? 'SHA1').toUpperCase();
  if (algorithm === 'SHA1' || algorithm === 'SHA256' || algorithm === 'SHA512') return algorithm;
  throw new Error('This setup uses an unsupported code algorithm.');
}

export function parseOtpAuth(value: string): ParsedSetup {
  const trimmed = value.trim();
  if (!trimmed.toLowerCase().startsWith('otpauth://')) {
    throw new Error('Scan the setup QR code from the website, or paste the setup link.');
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('That setup link could not be read.');
  }

  const type = url.hostname.toLowerCase();
  if (type === 'hotp') {
    throw new Error('Authen creates time-based codes. This setup uses a counter.');
  }
  if (type !== 'totp') {
    throw new Error('This is not a time-based authenticator setup.');
  }

  const secret = normalizeSecret(url.searchParams.get('secret') ?? '');
  if (secret.length < 8) throw new Error('This setup is missing a shared secret.');
  decodeBase32(secret);

  const digits = Number(url.searchParams.get('digits') ?? '6');
  const period = Number(url.searchParams.get('period') ?? '30');
  if (![6, 7, 8].includes(digits)) throw new Error('Authen supports 6, 7, or 8 digit codes.');
  if (!Number.isInteger(period) || period < 15 || period > 120) {
    throw new Error('This setup uses an unsupported refresh interval.');
  }

  const path = decodeURIComponent(url.pathname.replace(/^\//, ''));
  let issuer = (url.searchParams.get('issuer') ?? '').trim();
  let label = path.trim();
  const splitAt = path.indexOf(':');
  if (splitAt >= 0) {
    const pathIssuer = path.slice(0, splitAt).trim();
    const account = path.slice(splitAt + 1).trim();
    if (!issuer) issuer = pathIssuer;
    label = account || label;
  }

  return {
    issuer: issuer || label || 'Account',
    label: label || issuer || 'Account',
    secret,
    digits,
    period,
    algorithm: requireAlgorithm(url.searchParams.get('algorithm')),
  };
}

export function parseSetupKey(secret: string, issuer: string, account: string): ParsedSetup {
  const normalized = normalizeSecret(secret);
  if (normalized.length < 8) {
    throw new Error('Enter the setup key shown beside the QR code.');
  }
  decodeBase32(normalized);
  const name = issuer.trim() || 'Account';
  const label = account.trim() || name;
  return {
    issuer: name,
    label,
    secret: normalized,
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  };
}
