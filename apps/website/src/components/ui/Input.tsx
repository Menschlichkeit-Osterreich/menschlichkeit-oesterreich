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
    const describedBy = state === 'error' || helperText ? `${inputId}-desc` : undefined;
    const showRequiredIndicator = Boolean(label && props.required);

    const ringByState: Record<State, string> = {
      default: 'border-paper-rule hover:border-ink-subtle',
      success: 'border-2 border-success-600',
      warning: 'border-2 border-warning-500',
      error: 'border-2 border-error-600',
    };
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-body">
            <span>{label}</span>
            {showRequiredIndicator && (
              <>
                <span aria-hidden="true" className="ml-1 font-semibold text-error-700">
                  *
                </span>
                <span className="sr-only">Pflichtfeld</span>
              </>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={state === 'error'}
          aria-required={props.required || undefined}
          aria-describedby={describedBy}
          className={[
            'block w-full min-h-[52px] rounded-sm border bg-white px-4 py-3 text-base text-ink-deep transition-colors duration-150',
            ringByState[state],
            'disabled:bg-paper-rule-faint disabled:text-ink-subtle',
            className,
          ].join(' ')}
          {...props}
        />
        {(state === 'error' && (error || helperText)) && (
          <p id={describedBy} className="mt-1.5 text-sm text-error-700">
            {error || helperText}
          </p>
        )}
        {state !== 'error' && helperText && (
          <p id={describedBy} className="mt-1.5 text-sm text-ink-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
