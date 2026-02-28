import React from 'react';

type State = 'default' | 'success' | 'warning' | 'error';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string; // deprecated: use state + helperText
  state?: State;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, helperText, state = error ? 'error' : 'default', className = '', ...props }, ref) => {
    const inputId = id || React.useId();
    const describedBy = (state === 'error' || helperText) ? `${inputId}-desc` : undefined;

    const ringByState: Record<State, string> = {
      default: 'focus:border-primary-500 focus:ring-primary-500 border-secondary-300',
      success: 'focus:border-success-500 focus:ring-success-500 border-success-300',
      warning: 'focus:border-warning-500 focus:ring-warning-500 border-warning-300',
      error: 'focus:border-error-500 focus:ring-error-500 border-error-300',
    };
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={state === 'error'}
          aria-describedby={describedBy}
          className={[
            'block w-full rounded-md shadow-sm',
            ringByState[state],
            'disabled:bg-secondary-50 disabled:text-secondary-500',
            className,
          ].join(' ')}
          {...props}
        />
        {(state === 'error' && (error || helperText)) && (
          <p id={describedBy} className="mt-1 text-sm text-error-600">
            {error || helperText}
          </p>
        )}
        {state !== 'error' && helperText && (
          <p id={describedBy} className="mt-1 text-sm text-secondary-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
