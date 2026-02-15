export interface MetricConfig {
  key: string;
  label: string;
  description: string;
  unitLabel: string;
  goalMin: number;
  suggestedMax: number;
}

export interface RegionConfig {
  name: string;
  chapters: string[];
}

export const APP_VERSION = '1.0.0';

export const REGIONS: RegionConfig[] = [
  {
    name: 'Midwest',
    chapters: ['Chicago', 'Detroit', 'Cleveland', 'Milwaukee', 'Indianapolis'],
  },
  {
    name: 'Northeast',
    chapters: ['New York', 'Boston', 'Philadelphia', 'Hartford', 'Pittsburgh'],
  },
  {
    name: 'Southeast',
    chapters: ['Atlanta', 'Miami', 'Charlotte', 'Nashville', 'Tampa'],
  },
  {
    name: 'Southwest',
    chapters: ['Dallas', 'Houston', 'Phoenix', 'San Antonio', 'Austin'],
  },
  {
    name: 'West Coast',
    chapters: ['Los Angeles', 'San Francisco', 'Seattle', 'Portland', 'San Diego'],
  },
];

export const METRICS: MetricConfig[] = [
  {
    key: 'events',
    label: 'Events Held',
    description:
      'Total number of chapter events (Shabbatons, lounges, programs) held during the month.',
    unitLabel: 'events',
    goalMin: 0,
    suggestedMax: 30,
  },
  {
    key: 'new_teens',
    label: 'New Teens',
    description:
      'Number of teens attending a chapter event for the first time this month.',
    unitLabel: 'teens',
    goalMin: 0,
    suggestedMax: 100,
  },
  {
    key: 'unique_attendance',
    label: 'Unique Attendance',
    description:
      'Total unique teens who attended at least one event during the month.',
    unitLabel: 'teens',
    goalMin: 0,
    suggestedMax: 500,
  },
  {
    key: 'one_on_ones',
    label: 'One-on-Ones',
    description:
      'Number of individual one-on-one meetings or hangouts with teens during the month.',
    unitLabel: 'meetings',
    goalMin: 0,
    suggestedMax: 100,
  },
];

export const REASON_CHIPS = [
  'Travel / OOO',
  'Staffing change',
  'Special program',
  'Seasonality',
  'Community event',
  'Other',
] as const;

export type ReasonChip = (typeof REASON_CHIPS)[number];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
