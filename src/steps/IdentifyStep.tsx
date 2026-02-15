import { useWizard } from '../hooks/useWizard';
import { REGIONS } from '../config/appConfig';
import StickyNav from '../components/StickyNav';

export default function IdentifyStep() {
  const {
    region,
    chapter,
    staffName,
    twoMonthMode,
    lockedScope,
    setRegion,
    setChapter,
    setStaffName,
    setTwoMonthMode,
    setStep,
    initGoals,
  } = useWizard();

  const regionConfig = REGIONS.find((r) => r.name === region);
  const chapters = regionConfig?.chapters || [];
  const hasChapters = chapters.length > 0;

  const isValid = region && staffName.trim().length > 0 && (!hasChapters || chapter);

  function handleNext() {
    if (!isValid) return;
    initGoals();
    setStep(2);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">About You</h2>
        <p className="text-sm text-gray-400 mt-1">
          We'll use this to pull relevant historical data.
        </p>
      </div>

      <div className="space-y-5">
        {/* Region */}
        <div>
          <label htmlFor="region" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Region
          </label>
          {lockedScope ? (
            <div className="input-field bg-gray-50 text-gray-500 cursor-not-allowed">
              {region}
            </div>
          ) : (
            <select
              id="region"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setChapter('');
              }}
              className="input-field"
            >
              <option value="">Select region...</option>
              {REGIONS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Chapter */}
        {hasChapters && (
          <div>
            <label htmlFor="chapter" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Chapter
            </label>
            {lockedScope ? (
              <div className="input-field bg-gray-50 text-gray-500 cursor-not-allowed">
                {chapter}
              </div>
            ) : (
              <select
                id="chapter"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="input-field"
              >
                <option value="">Select chapter...</option>
                {chapters.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Staff Name */}
        <div>
          <label htmlFor="staffName" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your Name
          </label>
          <input
            id="staffName"
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="Enter your name"
            className="input-field"
            autoComplete="name"
          />
        </div>

        {/* Month Window */}
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-2">Goal Window</span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTwoMonthMode(true)}
              className={`flex-1 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all ${
                twoMonthMode
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-glow'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div>Two months</div>
              <div className={`text-[11px] font-normal mt-0.5 ${twoMonthMode ? 'text-brand-400' : 'text-gray-400'}`}>
                Recommended
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTwoMonthMode(false)}
              className={`flex-1 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all ${
                !twoMonthMode
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-glow'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div>Just upcoming</div>
              <div className={`text-[11px] font-normal mt-0.5 ${!twoMonthMode ? 'text-brand-400' : 'text-gray-400'}`}>
                Single month
              </div>
            </button>
          </div>
        </div>
      </div>

      <StickyNav
        onBack={() => setStep(0)}
        onNext={handleNext}
        nextDisabled={!isValid}
      />
    </div>
  );
}
