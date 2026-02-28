import React from 'react';

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
};

export function PageHeader({ title, description, actions, breadcrumb }: Props) {
  return (
    <div className="mb-4">
      {breadcrumb}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">{title}</h1>
          {description && (
            <p className="mt-1 text-secondary-700 max-w-3xl">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

