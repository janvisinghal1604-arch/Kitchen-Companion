import React from 'react';
import { useKitchen } from '../../context/KitchenContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useKitchen();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-tomato-500 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sage-800 shrink-0" />
        };

        const bgStyles = {
          success: 'bg-white border-sage-300 text-ink-primary',
          error: 'bg-white border-tomato-200 text-ink-primary',
          warning: 'bg-white border-amber-200 text-ink-primary',
          info: 'bg-white border-ink-border text-ink-primary'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-card transition-all transform translate-y-0 ${bgStyles[toast.type]}`}
          >
            <div className="flex items-center gap-2.5">
              {icons[toast.type]}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink-secondary hover:text-ink-primary p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
