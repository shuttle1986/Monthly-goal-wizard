import type { MetricStats } from '../types';

interface RangeVizProps {
  stats: MetricStats;
  /** If provided with onChange, overlays a draggable slider */
  value?: number;
  onChange?: (v: number) => void;
  sliderMin?: number;
  sliderMax?: number;
}

export default function RangeViz({
  stats,
  value,
  onChange,
  sliderMin = 0,
  sliderMax = 100,
}: RangeVizProps) {
  const interactive = value !== undefined && onChange !== undefined;
  const { min, max, avg } = stats;
  const range = max - min;

  // Padded visual range (original logic)
  const pad = range === 0 ? 1 : range * 0.15;
  const vMin = min - pad;
  const vMax = max + pad;
  const vRange = vMax - vMin;

  const pctMin = ((min - vMin) / vRange) * 100;
  const pctMax = ((max - vMin) / vRange) * 100;
  const pctAvg = ((avg - vMin) / vRange) * 100;

  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-500">
      <span className="tabular-nums w-7 text-right font-medium">{Math.round(min)}</span>

      <div className="relative flex-1 h-6">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full" />
        {/* Historical range bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-brand-100 to-brand-200 rounded-full"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />
        {/* Avg dot (only when not interactive) */}
        {!interactive && (
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-white shadow-sm"
            style={{ left: `${pctAvg}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
        {/* Avg tick (when interactive, show as subtle marker) */}
        {interactive && (
          <div
            className="absolute top-1/2 w-0.5 h-4 -translate-y-1/2 bg-brand-300 rounded-full opacity-50"
            style={{ left: `${pctAvg}%` }}
            title={`Avg: ${Math.round(avg)}`}
          />
        )}
        {/* Native range input overlaid — transparent track, styled thumb */}
        {interactive && (
          <input
            type="range"
            className="range-overlay"
            min={sliderMin}
            max={sliderMax}
            step={1}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
          />
        )}
      </div>

      <span className="tabular-nums w-7 font-medium">{Math.round(max)}</span>
    </div>
  );
}
