import type { MetricStats } from '../types';

interface RangeVizProps {
  stats: MetricStats;
  /** If provided with onChange, overlays a draggable slider */
  value?: number;
  onChange?: (v: number) => void;
}

export default function RangeViz({
  stats,
  value,
  onChange,
}: RangeVizProps) {
  const interactive = value !== undefined && onChange !== undefined;
  const { min, max, avg } = stats;
  const histRange = max - min || 1;

  // ── Non-interactive (read-only, e.g. ReviewStep) ──
  if (!interactive) {
    const pad = histRange * 0.15;
    const vMin = min - pad;
    const vRange = (max + pad) - vMin;
    const roPct = (v: number) => ((v - vMin) / vRange) * 100;

    return (
      <div className="flex items-center gap-2.5 text-xs text-gray-500">
        <span className="tabular-nums w-7 text-right font-medium">{Math.round(min)}</span>
        <div className="relative flex-1 h-4">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-brand-100 to-brand-200 rounded-full"
            style={{ left: `${roPct(min)}%`, width: `${roPct(max) - roPct(min)}%` }}
          />
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-white shadow-sm"
            style={{ left: `${roPct(avg)}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <span className="tabular-nums w-7 font-medium">{Math.round(max)}</span>
      </div>
    );
  }

  // ── Interactive: Baseline → Growth runway ──
  // Track starts at historical min, ends at a growth ceiling
  // No visible runway below baseline.
  const trackMin = min;
  const growthCeiling = Math.ceil(max + histRange * 1.0); // ~2x the spread above max
  const trackMax = growthCeiling;
  const trackRange = trackMax - trackMin || 1;

  const pct = (v: number) => Math.max(0, Math.min(100, ((v - trackMin) / trackRange) * 100));

  // Growth markers
  const g10 = Math.round(max * 1.1);
  const g25 = Math.round(max * 1.25);

  // Baseline occupies the left portion, growth runway is the rest
  const baselineEnd = pct(max);
  const pctAvg = pct(avg);

  const clampedValue = Math.max(trackMin, Math.min(trackMax, value ?? avg));

  return (
    <div>
      {/* Labels */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 px-0.5">
        <span className="font-medium text-gray-500">Baseline</span>
        <span className="font-medium text-emerald-500">Growth</span>
      </div>

      <div className="relative h-7">
        {/* Baseline band (min → max) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-brand-100 to-brand-200 rounded-l-full"
          style={{ left: 0, width: `${baselineEnd}%` }}
        />
        {/* Growth runway (max → ceiling) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-r-full"
          style={{ left: `${baselineEnd}%`, width: `${100 - baselineEnd}%` }}
        />
        {/* Avg marker */}
        <div
          className="absolute top-1/2 w-0.5 h-4 -translate-y-1/2 bg-brand-400 rounded-full opacity-60"
          style={{ left: `${pctAvg}%` }}
          title={`Avg: ${Math.round(avg)}`}
        />
        {/* +10% tick */}
        {g10 <= trackMax && (
          <div
            className="absolute top-1/2 w-px h-3 -translate-y-1/2 bg-emerald-300 opacity-50"
            style={{ left: `${pct(g10)}%` }}
            title={`+10%: ${g10}`}
          />
        )}
        {/* +25% tick */}
        {g25 <= trackMax && (
          <div
            className="absolute top-1/2 w-px h-3 -translate-y-1/2 bg-emerald-300 opacity-50"
            style={{ left: `${pct(g25)}%` }}
            title={`+25%: ${g25}`}
          />
        )}
        {/* Native range slider */}
        <input
          type="range"
          className="range-overlay"
          min={trackMin}
          max={trackMax}
          step={1}
          value={clampedValue}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
        />
      </div>

      {/* Scale labels */}
      <div className="flex items-center justify-between text-[10px] text-gray-300 mt-0.5 px-0.5">
        <span>{Math.round(min)}</span>
        <span className="text-gray-400 font-medium" title="Historical avg">{Math.round(avg)}</span>
        <span>{Math.round(max)}</span>
        {g10 <= trackMax && <span className="text-emerald-400">+10%</span>}
        <span>{trackMax}</span>
      </div>
    </div>
  );
}
