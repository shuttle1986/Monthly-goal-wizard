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
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {monthLabel} Goals
          </h2>
          <p className="text-xs text-gray-500">
            {months.length > 1
              ? `Month ${monthIdx + 1} of ${months.length}`
              : 'Set your goals below'}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCurrentDraft}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear draft
        </button>
      </div>

      <div className="space-y-4">
        {METRICS.map((metric) => {
          const goal = currentGoals.find((g) => g.key === metric.key);
          const stats = computeStats(history, region, chapter, metric.key, monthNum);

          return (
            <MetricCard
              key={metric.key}
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{metric.label}</h3>
          <p className="text-[11px] text-gray-400 mt-0.5" title={metric.description}>
            {metric.description}
          </p>
        </div>
      </div>

      {/* Context strip */}
      {stats ? (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <span>
              Typical for {monthLabel}:{' '}
              <span className="font-semibold">{Math.round(stats.avg)}</span>{' '}
              <span className="text-gray-400">
                ({stats.min}–{stats.max}) from {stats.countYears} yrs
              </span>
            </span>
            <VariabilityBadge variability={stats.variability} />
          </div>
          <RangeViz stats={stats} />
        </div>
      ) : (
        <div className="bg-amber-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-amber-700">
            No history available for this chapter — use your best estimate.
          </p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label={`Decrease ${metric.label}`}
        >
          -
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={defaultAvg !== null ? String(defaultAvg) : '0'}
          className="flex-1 text-center text-2xl font-bold py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          aria-label={`${metric.label} goal value`}
        />
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
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
          className="text-xs text-brand-600 hover:text-brand-700 mb-2"
        >
          Use avg ({defaultAvg})
        </button>
      )}

      {/* Reasons */}
      {!showReasons ? (
        <button
          type="button"
          onClick={() => setShowReasons(true)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          + Add reason
        </button>
      ) : (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {REASON_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => toggleReason(chip)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  reasons.includes(chip)
                    ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="input-field text-sm mt-1"
            />
          )}
        </div>
      )}
    </div>
  );
}
