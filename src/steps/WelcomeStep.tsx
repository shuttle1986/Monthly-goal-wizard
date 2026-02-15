import { useWizard } from '../hooks/useWizard';

export default function WelcomeStep() {
  const { setStep } = useWizard();

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative animate-slide-up">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
          <span className="text-4xl" aria-hidden="true">🎯</span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Monthly Goal Wizard
        </h1>
        <p className="text-gray-500 text-lg mb-2 max-w-xs mx-auto leading-relaxed">
          Set your chapter goals for the upcoming months in just a few steps.
        </p>

        <div className="inline-flex items-center gap-1.5 text-gray-400 text-sm mt-1 mb-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Takes ~2 minutes
        </div>

        <div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="btn-primary text-lg px-12 py-4 shadow-lg shadow-brand-200/50"
          >
            Get Started
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
