import React from 'react';

interface KpiCardProps {
  title: string;
  value: number | string;
  delta?: number;
  deltaText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  delta,
  deltaText,
  icon,
  variant = 'default',
  loading = false,
}) => {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  };

  const deltaClasses = delta && delta > 0
    ? 'text-green-600'
    : delta && delta < 0
    ? 'text-red-600'
    : 'text-gray-500';

  if (loading) {
    return (
      <div className={`rounded-lg border p-6 ${variantClasses[variant]} animate-pulse`}>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-6 ${variantClasses[variant]} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {(delta !== undefined || deltaText) && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${deltaClasses}`}>
              {delta !== undefined && (
                <span className="font-semibold">
                  {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta)}
                </span>
              )}
              {deltaText && <span>{deltaText}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-3 bg-gray-100 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
