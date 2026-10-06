export function nameFromEmail(email: string) {
  const local = email.split('@')[0] ?? '';
  const word = local.split(/[._+-]/).find((part) => part.length > 0) ?? 'there';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  if (parts[0] && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatWhen(iso: string, now = new Date()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;
  if (dayDiff > 1 && dayDiff < 30) return `${dayDiff} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function passwordStatus(changedAt: string, createdAt: string) {
  if (Math.abs(new Date(changedAt).getTime() - new Date(createdAt).getTime()) < 60_000) {
    return 'Set when you created your account';
  }
  const label = formatWhen(changedAt);
  if (label.startsWith('Today')) return 'Updated today';
  if (label.startsWith('Yesterday')) return 'Updated yesterday';
  return `Updated ${label}`;
}

export function formatSecret(secret: string) {
  const clean = secret.replace(/\s+/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') ?? clean;
}

export function formatBackupCode(code: string) {
  const clean = code.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}
