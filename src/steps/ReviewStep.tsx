import { useWizard } from '../hooks/useWizard';
import { METRICS, MONTH_NAMES } from '../config/appConfig';
import { computeStats } from '../utils/history';
import { parseYearMonth } from '../utils/months';
import StickyNav from '../components/StickyNav';

export default function ReviewStep() {
  const { region, chapter, staffName, months, goalsByMonth, history, setStep } = useWizard();

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Review Your Goals</h2>
      <p className="text-sm text-gray-500 mb-4">
        {staffName} &middot; {region}{chapter ? `, ${chapter}` : ''}
      </p>

      {months.map((ym) => {
        const { month: monthNum } = parseYearMonth(ym);
        const monthLabel = MONTH_NAMES[monthNum - 1];
        const goals = goalsByMonth[ym] || [];

        return (
          <div key={ym} className="mb-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center justify-between">
              <span>{monthLabel} {ym.split('-')[0]}</span>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Edit
              </button>
            </h3>

            <div className="space-y-2">
              {goals.map((goal) => {
                const metricConfig = METRICS.find((m) => m.key === goal.key);
                const stats = computeStats(history, region, chapter, goal.key, monthNum);

                return (
                  <div
                    key={goal.key}
                    className="bg-white rounded-lg border border-gray-200 p-3 flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {metricConfig?.label || goal.label}
                      </div>
                      {stats && (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Avg {Math.round(stats.avg)} ({stats.min}–{stats.max})
                        </div>
                      )}
                      {goal.reasons.length > 0 && (
                        <div className="text-[11px] text-gray-400 mt-1">
                          {goal.reasons.join(', ')}
                          {goal.note ? ` — ${goal.note}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-brand-600 ml-4 tabular-nums">
                      {goal.goalValue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <StickyNav
        onBack={() => setStep(2)}
        onNext={() => setStep(4)}
        nextLabel="Continue to Submit"
      />
    </div>
  );
}
