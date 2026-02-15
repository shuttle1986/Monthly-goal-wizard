import { useWizard } from '../hooks/useWizard';
import { METRICS, MONTH_NAMES } from '../config/appConfig';
import { computeStats } from '../utils/history';
import { parseYearMonth } from '../utils/months';
import StickyNav from '../components/StickyNav';

export default function ReviewStep() {
  const { region, chapter, staffName, months, goalsByMonth, history, setStep } = useWizard();

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Review Your Goals</h2>
        <p className="text-sm text-gray-400 mt-1">
          {staffName} &middot; {region}{chapter ? `, ${chapter}` : ''}
        </p>
      </div>

      {months.map((ym) => {
        const { month: monthNum } = parseYearMonth(ym);
        const monthLabel = MONTH_NAMES[monthNum - 1];
        const goals = goalsByMonth[ym] || [];

        return (
          <div key={ym} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">
                {monthLabel} {ym.split('-')[0]}
              </h3>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>

            <div className="space-y-2.5">
              {goals.map((goal) => {
                const metricConfig = METRICS.find((m) => m.key === goal.key);
                const stats = computeStats(history, region, chapter, goal.key, monthNum);

                return (
                  <div
                    key={goal.key}
                    className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center justify-between hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {metricConfig?.label || goal.label}
                      </div>
                      {stats && (
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Avg {Math.round(stats.avg)} &middot; range {stats.min}&ndash;{stats.max}
                        </div>
                      )}
                      {goal.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {goal.reasons.map((r) => (
                            <span key={r} className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-medium">
                              {r}
                            </span>
                          ))}
                          {goal.note && (
                            <span className="text-[10px] text-gray-400 italic">{goal.note}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-extrabold text-brand-600 ml-4 tabular-nums">
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
