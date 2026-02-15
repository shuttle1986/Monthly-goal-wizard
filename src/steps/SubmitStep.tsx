import { useMemo, useState } from 'react';
import { useWizard } from '../hooks/useWizard';
import {
  buildPayload,
  buildSubmissionBlock,
  buildReceiptLine,
  buildMailto,
  downloadFile,
  sanitizeFilename,
} from '../utils/submission';
import { toast } from '../components/Toast';
import Confetti from '../components/Confetti';

export default function SubmitStep() {
  const { region, chapter, staffName, months, goalsByMonth, setStep } = useWizard();
  const [showConfetti, setShowConfetti] = useState(true);

  const payload = useMemo(
    () => buildPayload(region, chapter, staffName, months, goalsByMonth),
    [region, chapter, staffName, months, goalsByMonth],
  );

  const submissionBlock = useMemo(() => buildSubmissionBlock(payload), [payload]);
  const receiptLine = useMemo(() => buildReceiptLine(payload), [payload]);
  const mailto = useMemo(() => buildMailto(payload, submissionBlock), [payload, submissionBlock]);

  const filename = `MonthlyGoals_${months.join('_')}_${sanitizeFilename(region)}_${sanitizeFilename(chapter)}_${sanitizeFilename(staffName)}.txt`;

  function handleCopy() {
    navigator.clipboard.writeText(submissionBlock).then(() => {
      toast('Copied — now paste into your Teams message/email');
    });
  }

  function handleDownload() {
    downloadFile(filename, submissionBlock);
    toast('Downloaded!');
  }

  function handleEmail() {
    if (mailto.needsAttachment) {
      downloadFile(filename, submissionBlock);
      toast('File downloaded — please attach it to the email');
    }
    window.location.href = mailto.href;
  }

  function handleCopyReceipt() {
    navigator.clipboard.writeText(receiptLine).then(() => {
      toast('Receipt copied!');
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {showConfetti && <Confetti />}

      <div className="text-center mb-8">
        <div className="text-4xl mb-3" aria-hidden="true">
          🎉
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Last step: submit your goals</h2>
        <p className="text-sm text-gray-500">
          Choose how you'd like to send your goals.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full bg-brand-600 text-white rounded-xl p-4 text-left hover:bg-brand-700 transition-colors"
        >
          <div className="font-semibold text-base">Copy submission</div>
          <div className="text-brand-200 text-sm mt-0.5">
            Copy to clipboard, then paste into Teams or email
          </div>
        </button>

        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="font-semibold text-base text-gray-900">Download submission</div>
          <div className="text-gray-500 text-sm mt-0.5">
            Save as .txt file to attach or keep for your records
          </div>
        </button>

        {/* Email */}
        <button
          type="button"
          onClick={handleEmail}
          className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="font-semibold text-base text-gray-900">Email submission</div>
          <div className="text-gray-500 text-sm mt-0.5">
            Open in your email client{mailto.needsAttachment ? ' (file will auto-download to attach)' : ''}
          </div>
        </button>
      </div>

      {/* Receipt */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 flex-1 mr-2 font-mono">{receiptLine}</p>
          <button
            type="button"
            onClick={handleCopyReceipt}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium whitespace-nowrap"
          >
            Copy receipt
          </button>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setShowConfetti(false);
            setStep(3);
          }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Back to review
        </button>
      </div>
    </div>
  );
}
