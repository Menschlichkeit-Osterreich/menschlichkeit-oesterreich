import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={`bg-white shadow-md rounded-lg ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
