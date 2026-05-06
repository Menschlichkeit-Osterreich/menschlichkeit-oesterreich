export interface MetricPoint {
  date: string;
  value: number;
  label?: string;
}

/** Alias used by dashboard charts */
export type TimeSeriesPoint = MetricPoint;

export interface MetricSeries {
  key: string;
  name: string;
  color?: string;
  data: MetricPoint[];
}

/** Stub: In production this would fetch from the API */
export async function fetchMetrics(_seriesKeys: string[]): Promise<MetricSeries[]> {
  return [];
}
