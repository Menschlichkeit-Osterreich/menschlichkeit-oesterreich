import React from 'react';

type Variant = 'info' | 'success' | 'warning' | 'error';

const styles: Record<Variant, { box: string; title: string; text: string }> = {
  info: {
    box: 'bg-secondary-50 border-secondary-200',
    title: 'text-secondary-800',
    text: 'text-secondary-700',
  },
  success: {
    box: 'bg-success-50 border-success-200',
    title: 'text-success-800',
    text: 'text-success-700',
  },
  warning: {
    box: 'bg-warning-50 border-warning-200',
    title: 'text-warning-800',
    text: 'text-warning-700',
  },
  error: {
    box: 'bg-error-50 border-error-200',
    title: 'text-error-800',
    text: 'text-error-700',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  role = 'status',
}: {
  variant?: Variant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  role?: 'status' | 'alert';
}) {
  const s = styles[variant];
  return (
    <div role={role} className={[`border rounded-md p-3 ${s.box}`, className].join(' ')}>
      {title && <div className={[`mb-1 font-medium ${s.title}`].join(' ')}>{title}</div>}
      {children && <div className={s.text}>{children}</div>}
    </div>
  );
}

