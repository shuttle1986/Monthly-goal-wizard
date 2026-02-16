export interface HistoryRow {
  region: string;
  chapter: string;
  metric_key: string;
  year: number;
  month: number;
  value: number;
}

export interface MetricStats {
  avg: number;
  min: number;
  max: number;
  stdev: number;
  countYears: number;
  variability: 'consistent' | 'mixed' | 'volatile';
  values: number[];
}

export interface EventRow {
  region: string;
  chapter: string;
  year: number;
  month: number;
  event_name: string;
  metric_key: string;
  value: number;
}

export interface NeighborMonth {
  month: number;
  monthLabel: string;
  avg: number;
  events: { name: string; year: number; value: number }[];
}

export interface MonthGoal {
  key: string;
  label: string;
  goalValue: number | null;
  reasons: string[];
  note: string;
}

export interface GoalsByMonth {
  [yearMonth: string]: MonthGoal[];
}

export interface WizardData {
  region: string;
  chapter: string;
  staffName: string;
  months: string[]; // "YYYY-MM"
  goalsByMonth: GoalsByMonth;
}

export interface UserProfile {
  staffName: string;
  lastRegion: string;
  lastChapter: string;
}

export interface DraftKey {
  region: string;
  chapter: string;
  staff: string;
  months: string[];
}

export interface SubmissionPayload {
  submissionId: string;
  createdAtIso: string;
  region: string;
  chapter: string;
  staff: string;
  months: string[];
  metricsByMonth: {
    [yearMonth: string]: {
      key: string;
      label: string;
      goalValue: number;
      reasons: string[];
      note: string;
    }[];
  };
  appVersion: string;
}
