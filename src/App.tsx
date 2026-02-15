import { Routes, Route } from 'react-router-dom';
import { WizardProvider, useWizard } from './hooks/useWizard';
import ProgressBar from './components/ProgressBar';
import ToastContainer from './components/Toast';
import WelcomeStep from './steps/WelcomeStep';
import IdentifyStep from './steps/IdentifyStep';
import GoalsStep from './steps/GoalsStep';
import ReviewStep from './steps/ReviewStep';
import SubmitStep from './steps/SubmitStep';

function WizardShell() {
  const { step } = useWizard();

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar step={step} />
      <main>
        {step === 0 && <WelcomeStep />}
        {step === 1 && <IdentifyStep />}
        {step === 2 && <GoalsStep />}
        {step === 3 && <ReviewStep />}
        {step === 4 && <SubmitStep />}
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <WizardProvider>
            <WizardShell />
          </WizardProvider>
        }
      />
    </Routes>
  );
}
