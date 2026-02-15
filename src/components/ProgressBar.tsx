const STEP_LABELS = ['Welcome', 'Identify', 'Goals', 'Review', 'Submit'];

export default function ProgressBar({ step }: { step: number }) {
  if (step === 0) return null;

  return (
    <div className="w-full px-4 pt-4 pb-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {STEP_LABELS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? 'bg-brand-600 text-white'
                    : active
                      ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? '\u2713' : i + 1}
              </div>
              <span
                className={`mt-1 text-[10px] leading-tight ${
                  active ? 'text-brand-700 font-semibold' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress line */}
      <div className="max-w-lg mx-auto mt-1">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
