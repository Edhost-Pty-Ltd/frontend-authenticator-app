export type TotpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

export type AuthenticatorAccount = {
  id: string;
  issuer: string;
  label: string;
  secret: string;
  digits: number;
  period: number;
  algorithm: TotpAlgorithm;
  createdAt: string;
};

export type ParsedSetup = {
  issuer: string;
  label: string;
  secret: string;
  digits: number;
  period: number;
  algorithm: TotpAlgorithm;
};
