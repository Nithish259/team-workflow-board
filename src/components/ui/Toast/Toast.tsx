import { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '!',
  info: 'i',
};

export function Toast({ toast, onClose }: ToastProps) {
  const toastId = toast?.id;

  useEffect(() => {
    if (!toastId) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastId, onClose]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm">
      <div
        role={toast.variant === 'error' ? 'alert' : 'status'}
        className={`
          pointer-events-auto flex items-center gap-3
          rounded-xl border px-4 py-3 shadow-lg
          ${variantStyles[toast.variant]}
        `}
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current font-bold"
        >
          {variantIcons[toast.variant]}
        </span>

        <p className="flex-1 text-sm font-medium">{toast.message}</p>

        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="rounded px-1 text-lg hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ×
        </button>
      </div>
    </div>
  );
}
