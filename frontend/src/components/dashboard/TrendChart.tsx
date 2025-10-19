/**
 * TrendChart - Zeitreihen-Diagramm (Recharts)
 * Zeigt Line-Chart für KPIs über Zeit
 */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TimeSeriesPoint } from '@/lib/metricsAPI';

export interface TrendChartProps {
  data: TimeSeriesPoint[];
  title: string;
  xKey?: keyof TimeSeriesPoint;
  yKey?: keyof TimeSeriesPoint;
  color?: string;
  formatYAxis?: (value: number) => string;
  loading?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  xKey = 'date',
  yKey = 'value',
  color = '#2563eb', // blue-600
  formatYAxis,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xKey}
            stroke="#6b7280"
            style={{ fontSize: 12 }}
            tickFormatter={(value: string) => {
              // Format date: "2025-10-01" -> "Okt 25"
              const date = new Date(value);
              return date.toLocaleDateString('de-AT', { month: 'short', year: '2-digit' });
            }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: 12 }}
            tickFormatter={formatYAxis || ((value) => value.toString())}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            labelFormatter={(value: string) => {
              const date = new Date(value);
              return date.toLocaleDateString('de-AT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });
            }}
            formatter={formatYAxis ? [(value: number) => formatYAxis(value)] : undefined}
          />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
