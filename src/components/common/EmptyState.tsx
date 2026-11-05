import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-cream-50/60 rounded-2xl border border-dashed border-ink-border/80 my-4">
      <div className="w-14 h-14 rounded-full bg-cream-200/80 flex items-center justify-center mb-4 text-sage-800">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="font-editorial text-xl text-ink-primary mb-1">{title}</h4>
      <p className="text-sm text-ink-secondary max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sage-800 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition shadow-soft"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
