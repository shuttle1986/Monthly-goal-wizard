import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { HistoryRow, EventRow, GoalsByMonth, MonthGoal } from '../types';
import { METRICS } from '../config/appConfig';
import { loadHistory, loadEvents } from '../utils/history';
import { loadProfile, saveProfile, loadDraft, saveDraft, clearDraft } from '../utils/storage';
import { getUpcomingMonths } from '../utils/months';

interface WizardState {
  step: number;
  region: string;
  chapter: string;
  staffName: string;
  twoMonthMode: boolean;
  months: string[];
  goalsByMonth: GoalsByMonth;
  history: HistoryRow[];
  events: EventRow[];
  historyLoading: boolean;
  lockedScope: boolean;
  urlRegion: string;
  urlChapter: string;
}

interface WizardActions {
  setStep: (s: number) => void;
  setRegion: (r: string) => void;
  setChapter: (c: string) => void;
  setStaffName: (n: string) => void;
  setTwoMonthMode: (v: boolean) => void;
  setGoalValue: (month: string, metricKey: string, value: number | null) => void;
  setGoalReasons: (month: string, metricKey: string, reasons: string[]) => void;
  setGoalNote: (month: string, metricKey: string, note: string) => void;
  clearCurrentDraft: () => void;
  initGoals: () => void;
}

type WizardCtx = WizardState & WizardActions;

const WizardContext = createContext<WizardCtx | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const upcoming = getUpcomingMonths();

  // Parse URL params from hash
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const urlRegion = hashParams.get('region') || '';
  const urlChapter = hashParams.get('chapter') || '';
  const lockedScope = !!(urlRegion);

  const profile = loadProfile();

  const [step, setStep] = useState(0);
  const [region, setRegion] = useState(urlRegion || profile?.lastRegion || '');
  const [chapter, setChapter] = useState(urlChapter || profile?.lastChapter || '');
  const [staffName, setStaffName] = useState(profile?.staffName || '');
  const [twoMonthMode, setTwoMonthMode] = useState(true);
  const [goalsByMonth, setGoalsByMonth] = useState<GoalsByMonth>({});
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const months = twoMonthMode ? upcoming.twoMonths : upcoming.oneMonth;

  // Load history on mount
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    Promise.all([
      loadHistory(base),
      loadEvents(base),
    ])
      .then(([h, e]) => { setHistory(h); setEvents(e); })
      .catch((err) => console.warn('Could not load data:', err))
      .finally(() => setHistoryLoading(false));
  }, []);

  // Save profile when identity changes
  const prevProfile = useRef({ staffName, region, chapter });
  useEffect(() => {
    if (staffName && region) {
      if (
        staffName !== prevProfile.current.staffName ||
        region !== prevProfile.current.region ||
        chapter !== prevProfile.current.chapter
      ) {
        saveProfile({ staffName, lastRegion: region, lastChapter: chapter });
        prevProfile.current = { staffName, region, chapter };
      }
    }
  }, [staffName, region, chapter]);

  // Auto-save draft
  useEffect(() => {
    if (region && staffName && Object.keys(goalsByMonth).length > 0) {
      saveDraft(region, chapter, staffName, months, goalsByMonth);
    }
  }, [goalsByMonth, region, chapter, staffName, months]);

  const initGoals = useCallback(() => {
    // Try to load draft
    const draft = loadDraft(region, chapter, staffName, months);
    if (draft && Object.keys(draft).length > 0) {
      setGoalsByMonth(draft);
      return;
    }

    // Initialize empty goals
    const init: GoalsByMonth = {};
    for (const ym of months) {
      init[ym] = METRICS.map((m) => ({
        key: m.key,
        label: m.label,
        goalValue: null,
        reasons: [],
        note: '',
      }));
    }
    setGoalsByMonth(init);
  }, [region, chapter, staffName, months]);

  const setGoalValue = useCallback((month: string, metricKey: string, value: number | null) => {
    setGoalsByMonth((prev) => {
      const updated = { ...prev };
      updated[month] = (updated[month] || []).map((g) =>
        g.key === metricKey ? { ...g, goalValue: value } : g,
      );
      return updated;
    });
  }, []);

  const setGoalReasons = useCallback((month: string, metricKey: string, reasons: string[]) => {
    setGoalsByMonth((prev) => {
      const updated = { ...prev };
      updated[month] = (updated[month] || []).map((g) =>
        g.key === metricKey ? { ...g, reasons } : g,
      );
      return updated;
    });
  }, []);

  const setGoalNote = useCallback((month: string, metricKey: string, note: string) => {
    setGoalsByMonth((prev) => {
      const updated = { ...prev };
      updated[month] = (updated[month] || []).map((g) =>
        g.key === metricKey ? { ...g, note } : g,
      );
      return updated;
    });
  }, []);

  const clearCurrentDraft = useCallback(() => {
    clearDraft(region, chapter, staffName, months);
    const init: GoalsByMonth = {};
    for (const ym of months) {
      init[ym] = METRICS.map((m) => ({
        key: m.key,
        label: m.label,
        goalValue: null,
        reasons: [],
        note: '',
      }));
    }
    setGoalsByMonth(init);
  }, [region, chapter, staffName, months]);

  const value: WizardCtx = {
    step,
    region,
    chapter,
    staffName,
    twoMonthMode,
    months,
    goalsByMonth,
    history,
    events,
    historyLoading,
    lockedScope,
    urlRegion,
    urlChapter,
    setStep,
    setRegion,
    setChapter,
    setStaffName,
    setTwoMonthMode,
    setGoalValue,
    setGoalReasons,
    setGoalNote,
    clearCurrentDraft,
    initGoals,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardCtx {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}
