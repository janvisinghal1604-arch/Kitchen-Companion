import { FreshnessStatus } from '../types';

/**
 * Calculates freshness status and days remaining based on estimated use-by date.
 */
export function getDaysRemaining(estimatedUseBy?: string): number | null {
  if (!estimatedUseBy) return null;
  const targetDate = new Date(estimatedUseBy);
  if (isNaN(targetDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function determineFreshnessStatus(estimatedUseBy?: string): FreshnessStatus {
  const days = getDaysRemaining(estimatedUseBy);
  if (days === null) return 'Needs Checking';

  if (days <= 1) return 'Use First';
  if (days <= 4) return 'Use Soon';
  return 'Fresh';
}

export function formatFreshnessLabel(estimatedUseBy?: string): {
  label: string;
  isUrgent: boolean;
  status: FreshnessStatus;
} {
  const days = getDaysRemaining(estimatedUseBy);
  const status = determineFreshnessStatus(estimatedUseBy);

  if (days === null) {
    return { label: 'Check freshness', isUrgent: false, status };
  }

  if (days < 0) {
    const overdue = Math.abs(days);
    return {
      label: `${overdue} ${overdue === 1 ? 'day' : 'days'} past date`,
      isUrgent: true,
      status: 'Use First'
    };
  }

  if (days === 0) {
    return { label: 'Use today', isUrgent: true, status: 'Use First' };
  }

  if (days === 1) {
    return { label: 'Use tomorrow (1d)', isUrgent: true, status: 'Use First' };
  }

  if (days <= 4) {
    return { label: `${days} days left`, isUrgent: false, status: 'Use Soon' };
  }

  return { label: `${days} days left`, isUrgent: false, status: 'Fresh' };
}

export function getFreshnessTheme(status: FreshnessStatus) {
  switch (status) {
    case 'Use First':
      return {
        bg: 'bg-tomato-50',
        text: 'text-tomato-700',
        border: 'border-tomato-200',
        dot: 'bg-tomato-500',
        badge: 'bg-tomato-100 text-tomato-800 border-tomato-200',
        accentBg: 'bg-tomato-50/50'
      };
    case 'Use Soon':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        accentBg: 'bg-amber-50/40'
      };
    case 'Fresh':
      return {
        bg: 'bg-sage-50',
        text: 'text-sage-800',
        border: 'border-sage-200',
        dot: 'bg-sage-500',
        badge: 'bg-sage-100 text-sage-800 border-sage-300',
        accentBg: 'bg-sage-50/30'
      };
    case 'Needs Checking':
    default:
      return {
        bg: 'bg-cream-200',
        text: 'text-ink-secondary',
        border: 'border-ink-border',
        dot: 'bg-ink-muted',
        badge: 'bg-cream-300 text-ink-primary border-ink-border',
        accentBg: 'bg-cream-100'
      };
  }
}
