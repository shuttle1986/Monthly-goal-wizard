interface StickyNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export default function StickyNav({
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  showBack = true,
}: StickyNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-nav border-t border-gray-100 px-4 py-3 z-30">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex-1 max-w-[140px]"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="btn-primary flex-1 max-w-[200px]"
          >
            {nextLabel}
            <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
