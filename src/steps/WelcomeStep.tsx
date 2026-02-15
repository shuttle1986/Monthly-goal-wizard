import { useWizard } from '../hooks/useWizard';

export default function WelcomeStep() {
  const { setStep } = useWizard();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="text-5xl mb-6" aria-hidden="true">
        🎯
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Monthly Goal Wizard</h1>
      <p className="text-gray-600 text-lg mb-2 max-w-sm">
        Set your chapter goals for the upcoming months in just a few steps.
      </p>
      <p className="text-gray-400 text-sm mb-8">Takes ~2 minutes</p>
      <button
        type="button"
        onClick={() => setStep(1)}
        className="btn-primary text-lg px-10 py-4"
      >
        Get Started
      </button>
    </div>
  );
}
