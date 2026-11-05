import React from 'react';
import { FreshnessStatus } from '../../types';
import { getFreshnessTheme } from '../../lib/freshness';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sage' | 'tomato' | 'cream' | 'freshness';
  freshnessStatus?: FreshnessStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  freshnessStatus,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  if (variant === 'freshness' && freshnessStatus) {
    const theme = getFreshnessTheme(freshnessStatus);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${theme.badge} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
        {children}
      </span>
    );
  }

  const variantStyles: Record<string, string> = {
    default: 'bg-cream-200 text-ink-primary border border-ink-border/50',
    sage: 'bg-sage-100 text-sage-800 border border-sage-200',
    tomato: 'bg-tomato-100 text-tomato-800 border border-tomato-200',
    cream: 'bg-cream-50 text-ink-primary border border-cream-300'
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center rounded-full ${style} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};
