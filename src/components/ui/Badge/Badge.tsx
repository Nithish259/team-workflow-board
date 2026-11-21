import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export const Badge = ({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full
        px-2.5 py-1 text-xs font-semibold
    ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
