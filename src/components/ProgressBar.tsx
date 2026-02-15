const STEP_LABELS = ['Welcome', 'Identify', 'Goals', 'Review', 'Submit'];

export default function ProgressBar({ step }: { step: number }) {
  if (step === 0) return null;

  return (
    <div className="w-full px-4 pt-5 pb-3 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center max-w-lg mx-auto">
        {STEP_LABELS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          const isLast = i === STEP_LABELS.length - 1;

          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    done
                      ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md'
                      : active
                        ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400 shadow-glow'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[10px] leading-tight font-medium tracking-wide ${
                    active ? 'text-brand-600' : done ? 'text-brand-400' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-1.5 mt-[-14px]">
                  <div className="h-[2px] rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-500"
                      style={{ width: done ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
