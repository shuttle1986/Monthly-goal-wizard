import type { MetricStats } from '../types';

interface RangeVizProps {
  stats: MetricStats;
}

export default function RangeViz({ stats }: RangeVizProps) {
  const { min, max, avg } = stats;
  const range = max - min;
  if (range === 0) {
    return (
      <div className="flex items-center gap-2.5 text-xs text-gray-500">
        <div className="relative w-full h-4 bg-gradient-to-r from-brand-50 to-brand-100 rounded-full overflow-hidden">
          <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-white shadow-sm" />
        </div>
        <span className="whitespace-nowrap tabular-nums font-semibold text-brand-600">{Math.round(avg)}</span>
      </div>
    );
  }

  const pad = range * 0.2;
  const vMin = min - pad;
  const vMax = max + pad;
  const vRange = vMax - vMin;

  const pctMin = ((min - vMin) / vRange) * 100;
  const pctMax = ((max - vMin) / vRange) * 100;
  const pctAvg = ((avg - vMin) / vRange) * 100;

  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-500">
      <span className="tabular-nums w-7 text-right font-medium">{Math.round(min)}</span>
      <div className="relative flex-1 h-4">
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full" />
        {/* Range bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-brand-100 to-brand-200 rounded-full"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />
        {/* Avg dot */}
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-white shadow-sm"
          style={{ left: `${pctAvg}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <span className="tabular-nums w-7 font-medium">{Math.round(max)}</span>
    </div>
  );
}
