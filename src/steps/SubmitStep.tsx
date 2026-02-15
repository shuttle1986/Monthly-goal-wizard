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
      toast('Copied \u2014 now paste into your Teams message/email');
    });
  }

  function handleDownload() {
    downloadFile(filename, submissionBlock);
    toast('Downloaded!');
  }

  function handleEmail() {
    if (mailto.needsAttachment) {
      downloadFile(filename, submissionBlock);
      toast('File downloaded \u2014 please attach it to the email');
    }
    window.location.href = mailto.href;
  }

  function handleCopyReceipt() {
    navigator.clipboard.writeText(receiptLine).then(() => {
      toast('Receipt copied!');
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-12 animate-slide-up">
      {showConfetti && <Confetti />}

      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
          Last step: submit your goals
        </h2>
        <p className="text-sm text-gray-400">
          Choose how you'd like to send your goals.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl p-5 text-left hover:from-brand-700 hover:to-brand-600 transition-all shadow-md hover:shadow-lg active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base">Copy submission</div>
              <div className="text-brand-200 text-sm mt-0.5">
                Copy to clipboard, then paste into Teams or email
              </div>
            </div>
          </div>
        </button>

        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left hover:bg-gray-50 hover:border-gray-200 transition-all shadow-card hover:shadow-card-hover active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
              <svg className="w-5 h-5 text-gray-500 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base text-gray-900">Download submission</div>
              <div className="text-gray-400 text-sm mt-0.5">
                Save as .txt file to attach or keep for records
              </div>
            </div>
          </div>
        </button>

        {/* Email */}
        <button
          type="button"
          onClick={handleEmail}
          className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left hover:bg-gray-50 hover:border-gray-200 transition-all shadow-card hover:shadow-card-hover active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
              <svg className="w-5 h-5 text-gray-500 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base text-gray-900">Email submission</div>
              <div className="text-gray-400 text-sm mt-0.5">
                Open in your email client{mailto.needsAttachment ? ' (file will auto-download)' : ''}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Receipt */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-gray-500 flex-1 font-mono leading-relaxed">{receiptLine}</p>
          <button
            type="button"
            onClick={handleCopyReceipt}
            className="text-xs text-brand-500 hover:text-brand-600 font-semibold whitespace-nowrap flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
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
          className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          &larr; Back to review
        </button>
      </div>
    </div>
  );
}
