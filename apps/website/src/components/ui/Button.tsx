import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent' | 'warning' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const base = 'inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

export const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  secondary: 'border border-paper-rule bg-white text-ink-body hover:bg-paper hover:border-primary-600',
  ghost: 'bg-transparent text-primary-600 underline underline-offset-4 hover:text-primary-700',
  danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800',
  accent: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800',
  warning: 'border border-warning-500 bg-white text-warning-700 hover:bg-warning-50',
  outline: 'border border-paper-rule bg-white text-ink-body hover:bg-paper hover:border-primary-600',
};

export const sizeStyles: Record<Size, string> = {
  sm: 'min-h-[36px] px-3 py-2 text-sm',
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[52px] px-6 py-3 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <button ref={ref} className={[base, variantStyles[variant], sizeStyles[size], className].join(' ')} {...props}>
        {props.children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonLinkProps) {
  return (
    <a className={[base, variantStyles[variant], sizeStyles[size], className].join(' ')} {...props}>
      {children}
    </a>
  );
}
