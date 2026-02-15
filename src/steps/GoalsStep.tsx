import { useState } from 'react';
import { useWizard } from '../hooks/useWizard';
import { METRICS, MONTH_NAMES, REASON_CHIPS } from '../config/appConfig';
import { computeStats, roundGoal } from '../utils/history';
import { parseYearMonth } from '../utils/months';
import StickyNav from '../components/StickyNav';
import RangeViz from '../components/RangeViz';
import VariabilityBadge from '../components/VariabilityBadge';

export default function GoalsStep() {
  const {
    region,
    chapter,
    months,
    history,
    goalsByMonth,
    setGoalValue,
    setGoalReasons,
    setGoalNote,
    clearCurrentDraft,
    setStep,
  } = useWizard();

  const [monthIdx, setMonthIdx] = useState(0);
  const currentMonth = months[monthIdx];
  const { month: monthNum } = parseYearMonth(currentMonth);
  const monthLabel = MONTH_NAMES[monthNum - 1];

  const currentGoals = goalsByMonth[currentMonth] || [];

  const allFilled = currentGoals.every((g) => g.goalValue !== null && g.goalValue >= 0);

  function handleBack() {
    if (monthIdx > 0) {
      setMonthIdx(monthIdx - 1);
    } else {
      setStep(1);
    }
  }

  function handleNext() {
    if (monthIdx < months.length - 1) {
      setMonthIdx(monthIdx + 1);
    } else {
      setStep(3);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {monthLabel}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {months.length > 1
              ? `Month ${monthIdx + 1} of ${months.length} \u2022 Set your 4 goals`
              : 'Set your 4 goals below'}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCurrentDraft}
          className="text-xs text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>

      <div className="space-y-4">
        {METRICS.map((metric, idx) => {
          const goal = currentGoals.find((g) => g.key === metric.key);
          const stats = computeStats(history, region, chapter, metric.key, monthNum);

          return (
            <div key={metric.key} className="animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <MetricCard
                metric={metric}
                stats={stats}
                monthLabel={monthLabel}
                goalValue={goal?.goalValue ?? null}
                reasons={goal?.reasons || []}
                note={goal?.note || ''}
                onValueChange={(v) => setGoalValue(currentMonth, metric.key, v)}
                onReasonsChange={(r) => setGoalReasons(currentMonth, metric.key, r)}
                onNoteChange={(n) => setGoalNote(currentMonth, metric.key, n)}
              />
            </div>
          );
        })}
      </div>

      <StickyNav
        onBack={handleBack}
        onNext={handleNext}
        nextDisabled={!allFilled}
        nextLabel={monthIdx < months.length - 1 ? 'Next Month' : 'Review'}
      />
    </div>
  );
}

interface MetricCardProps {
  metric: (typeof METRICS)[number];
  stats: ReturnType<typeof computeStats>;
  monthLabel: string;
  goalValue: number | null;
  reasons: string[];
  note: string;
  onValueChange: (v: number | null) => void;
  onReasonsChange: (r: string[]) => void;
  onNoteChange: (n: string) => void;
}

function MetricCard({
  metric,
  stats,
  monthLabel,
  goalValue,
  reasons,
  note,
  onValueChange,
  onReasonsChange,
  onNoteChange,
}: MetricCardProps) {
  const [showReasons, setShowReasons] = useState(reasons.length > 0 || note.length > 0);

  const defaultAvg = stats ? roundGoal(stats.avg) : null;
  const displayValue = goalValue !== null ? goalValue : '';

  function handleInputChange(raw: string) {
    if (raw === '') {
      onValueChange(null);
      return;
    }
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0) {
      onValueChange(num);
    }
  }

  function handleStep(delta: number) {
    const current = goalValue ?? defaultAvg ?? 0;
    const next = Math.max(0, current + delta);
    onValueChange(next);
  }

  function toggleReason(chip: string) {
    if (reasons.includes(chip)) {
      onReasonsChange(reasons.filter((r) => r !== chip));
    } else {
      onReasonsChange([...reasons, chip]);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900">{metric.label}</h3>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed" title={metric.description}>
            {metric.description}
          </p>
        </div>
      </div>

      {/* Context strip */}
      {stats ? (
        <div className="bg-gradient-to-br from-gray-50 to-brand-50/30 rounded-xl p-3.5 mb-4">
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-600 mb-2.5">
            <span className="font-medium">
              Typical for {monthLabel}:
            </span>
            <span className="font-bold text-brand-600 text-sm">{Math.round(stats.avg)}</span>
            <span className="text-gray-400">
              ({stats.min}–{stats.max} over {stats.countYears} yrs)
            </span>
            <VariabilityBadge variability={stats.variability} />
          </div>
          <RangeViz
            stats={stats}
            value={goalValue ?? defaultAvg ?? 0}
            onChange={onValueChange}
          />
        </div>
      ) : (
        <div className="bg-amber-50/60 rounded-xl p-3.5 mb-4 flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700">
            No history available for this chapter — use your best estimate.
          </p>
        </div>
      )}

      {/* Number input + stepper */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition-all"
          aria-label={`Decrease ${metric.label}`}
        >
          &minus;
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={defaultAvg !== null ? String(defaultAvg) : '0'}
          className="flex-1 text-center text-3xl font-extrabold py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all tabular-nums text-gray-900"
          aria-label={`${metric.label} goal value`}
        />
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition-all"
          aria-label={`Increase ${metric.label}`}
        >
          +
        </button>
      </div>

      {/* Use avg button */}
      {defaultAvg !== null && goalValue !== null && goalValue !== defaultAvg && (
        <button
          type="button"
          onClick={() => onValueChange(defaultAvg)}
          className="text-xs text-brand-500 hover:text-brand-600 font-medium mb-2 flex items-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset to avg ({defaultAvg})
        </button>
      )}

      {/* Reasons */}
      {!showReasons ? (
        <button
          type="button"
          onClick={() => setShowReasons(true)}
          className="text-xs text-gray-400 hover:text-brand-500 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add reason
        </button>
      ) : (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {REASON_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => toggleReason(chip)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  reasons.includes(chip)
                    ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300 shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          {reasons.includes('Other') && (
            <input
              type="text"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Short note..."
              className="input-field text-sm mt-1.5"
            />
          )}
        </div>
      )}
    </div>
  );
}
