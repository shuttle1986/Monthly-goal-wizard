import type { HistoryRow, MetricStats } from '../types';

export async function loadHistory(basePath: string): Promise<HistoryRow[]> {
  const url = `${basePath}data/history.csv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
  const text = await res.text();
  return parseCsv(text);
}

function parseCsv(text: string): HistoryRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const rows: HistoryRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 6) continue;
    rows.push({
      region: parts[0].trim(),
      chapter: parts[1].trim(),
      metric_key: parts[2].trim(),
      year: parseInt(parts[3].trim(), 10),
      month: parseInt(parts[4].trim(), 10),
      value: parseFloat(parts[5].trim()),
    });
  }
  return rows;
}

export function computeStats(
  history: HistoryRow[],
  region: string,
  chapter: string,
  metricKey: string,
  month: number,
): MetricStats | null {
  const filtered = history.filter(
    (r) =>
      r.region === region &&
      r.chapter === chapter &&
      r.metric_key === metricKey &&
      r.month === month,
  );

  if (filtered.length === 0) return null;

  const values = filtered.map((r) => r.value);
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / n;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const variance = values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / n;
  const stdev = Math.sqrt(variance);

  let variability: 'consistent' | 'mixed' | 'volatile';
  if (avg > 0) {
    const cv = stdev / avg;
    if (cv < 0.15) variability = 'consistent';
    else if (cv < 0.35) variability = 'mixed';
    else variability = 'volatile';
  } else {
    const range = max - min;
    if (range <= 1) variability = 'consistent';
    else if (range <= 3) variability = 'mixed';
    else variability = 'volatile';
  }

  return { avg, min, max, stdev, countYears: n, variability, values };
}

export function roundGoal(avg: number): number {
  return Math.round(avg);
}
