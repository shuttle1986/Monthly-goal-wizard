import type { HistoryRow, EventRow, MetricStats, NeighborMonth } from '../types';
import { MONTH_NAMES } from '../config/appConfig';

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

// ── Events ──

export async function loadEvents(basePath: string): Promise<EventRow[]> {
  const url = `${basePath}data/events.csv`;
  const res = await fetch(url);
  if (!res.ok) return []; // events are optional context
  const text = await res.text();
  return parseEventsCsv(text);
}

function parseEventsCsv(text: string): EventRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const rows: EventRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 7) continue;
    rows.push({
      region: parts[0].trim(),
      chapter: parts[1].trim(),
      year: parseInt(parts[2].trim(), 10),
      month: parseInt(parts[3].trim(), 10),
      event_name: parts[4].trim(),
      metric_key: parts[5].trim(),
      value: parseFloat(parts[6].trim()),
    });
  }
  return rows;
}

// ── Neighbor months (prev / current / next) ──

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function wrapMonth(m: number): number {
  return ((m - 1 + 12) % 12) + 1; // 1-indexed, wraps 0→12 and 13→1
}

export function getNeighborMonths(
  history: HistoryRow[],
  events: EventRow[],
  region: string,
  chapter: string,
  metricKey: string,
  month: number,
): NeighborMonth[] {
  const months = [wrapMonth(month - 1), month, wrapMonth(month + 1)];

  return months.map((m) => {
    const stats = computeStats(history, region, chapter, metricKey, m);
    const avg = stats ? stats.avg : 0;

    // Notable events for this month/metric (most recent years first)
    const monthEvents = events
      .filter(
        (e) =>
          e.region === region &&
          e.chapter === chapter &&
          e.metric_key === metricKey &&
          e.month === m,
      )
      .sort((a, b) => b.year - a.year)
      .map((e) => ({ name: e.event_name, year: e.year, value: e.value }));

    return {
      month: m,
      monthLabel: SHORT_MONTHS[m - 1],
      avg: Math.round(avg),
      events: monthEvents,
    };
  });
}
