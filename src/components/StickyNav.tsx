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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-30">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex-1 max-w-[140px]"
          >
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
          </button>
        )}
      </div>
    </div>
  );
}
