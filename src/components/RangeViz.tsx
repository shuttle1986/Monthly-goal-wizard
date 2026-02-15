import type { MetricStats } from '../types';

interface RangeVizProps {
  stats: MetricStats;
}

export default function RangeViz({ stats }: RangeVizProps) {
  const { min, max, avg } = stats;
  const range = max - min;
  if (range === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute left-1/2 top-0 w-2.5 h-2.5 -translate-x-1/2 mt-[1px] rounded-full bg-brand-500" />
        </div>
        <span className="whitespace-nowrap tabular-nums">{Math.round(avg)}</span>
      </div>
    );
  }

  // Pad the visual range a little
  const pad = range * 0.15;
  const vMin = min - pad;
  const vMax = max + pad;
  const vRange = vMax - vMin;

  const pctMin = ((min - vMin) / vRange) * 100;
  const pctMax = ((max - vMin) / vRange) * 100;
  const pctAvg = ((avg - vMin) / vRange) * 100;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="tabular-nums w-6 text-right">{Math.round(min)}</span>
      <div className="relative flex-1 h-3">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full" />
        {/* Range bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-brand-100 rounded-full"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />
        {/* Avg dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-white"
          style={{ left: `${pctAvg}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <span className="tabular-nums w-6">{Math.round(max)}</span>
    </div>
  );
}
