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

  // Slider visual range: pad 1.5x the historical range on each side, floor at 0
  const trackMin = Math.max(0, Math.floor(min - histRange * 1.5));
  const trackMax = Math.ceil(max + histRange * 1.5);
  const trackRange = trackMax - trackMin || 1;

  // Everything uses this one coordinate system
  const pct = (v: number) => ((v - trackMin) / trackRange) * 100;

  // Non-interactive: use padded visual range so the bar fills nicely
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

  // Clamp value to track range for the slider, but don't clamp the actual value
  const clampedValue = Math.max(trackMin, Math.min(trackMax, value ?? avg));

  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-500">
      <span className="tabular-nums w-7 text-right font-medium">{Math.round(min)}</span>

      <div className="relative flex-1 h-6">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full" />
        {/* Historical range bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-brand-100 to-brand-200 rounded-full"
          style={{ left: `${pct(min)}%`, width: `${Math.max(0, pct(max) - pct(min))}%` }}
        />
        {/* Avg tick */}
        <div
          className="absolute top-1/2 w-0.5 h-4 -translate-y-1/2 bg-brand-300 rounded-full opacity-50"
          style={{ left: `${pct(avg)}%` }}
          title={`Avg: ${Math.round(avg)}`}
        />
        {/* Native range input — same trackMin/trackMax as the visuals */}
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

      <span className="tabular-nums w-7 font-medium">{Math.round(max)}</span>
    </div>
  );
}
