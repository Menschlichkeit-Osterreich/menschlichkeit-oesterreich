import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent' | 'warning' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

export const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-400',
  secondary: 'border border-secondary-300 bg-white text-secondary-800 hover:bg-secondary-100 focus:ring-secondary-300',
  ghost: 'bg-transparent text-primary-700 hover:bg-secondary-50 focus:ring-primary-300',
  danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-400',
  success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-400',
  accent: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-400',
  warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-400',
  outline: 'border border-secondary-300 text-secondary-800 hover:bg-secondary-50 focus:ring-secondary-300',
};

export const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
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
