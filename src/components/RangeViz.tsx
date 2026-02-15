import { useRef, useCallback } from 'react';
import type { MetricStats } from '../types';

interface RangeVizProps {
  stats: MetricStats;
  /** Current goal value (drives the draggable dot) */
  value?: number;
  /** Called when the user drags the dot */
  onChange?: (v: number) => void;
  /** Full slider bounds */
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
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const interactive = value !== undefined && onChange !== undefined;
  const fullRange = sliderMax - sliderMin || 1;

  const { min, max, avg } = stats;

  // Single coordinate system: everything maps to sliderMin–sliderMax
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - sliderMin) / fullRange) * 100));

  const posToValue = useCallback(
    (clientX: number) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(sliderMin + ratio * fullRange);
    },
    [sliderMin, fullRange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive) return;
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onChange(posToValue(e.clientX));
    },
    [interactive, onChange, posToValue],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !interactive) return;
      onChange(posToValue(e.clientX));
    },
    [interactive, onChange, posToValue],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const pctMin = pct(min);
  const pctMax = pct(max);
  const pctAvg = pct(avg);
  const pctValue = value !== undefined ? pct(value) : pctAvg;

  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-500">
      <span className="tabular-nums w-7 text-right font-medium">{Math.round(min)}</span>
      <div
        ref={trackRef}
        className={`relative flex-1 ${interactive ? 'h-8 cursor-pointer' : 'h-4'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full" />
        {/* Historical range bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-brand-100 to-brand-200 rounded-full"
          style={{ left: `${pctMin}%`, width: `${Math.max(0, pctMax - pctMin)}%` }}
        />
        {/* Avg tick (subtle context marker in interactive mode) */}
        {interactive && (
          <div
            className="absolute top-1/2 w-0.5 h-3.5 -translate-y-1/2 bg-brand-300 rounded-full opacity-60"
            style={{ left: `${pctAvg}%` }}
            title={`Avg: ${Math.round(avg)}`}
          />
        )}
        {/* Dot */}
        <div
          className={`absolute top-1/2 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-white shadow-sm ${
            interactive
              ? 'w-6 h-6 ring-[3px] shadow-lg hover:scale-110 active:scale-115 transition-transform'
              : 'w-3 h-3'
          }`}
          style={{ left: `${pctValue}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <span className="tabular-nums w-7 font-medium">{Math.round(max)}</span>
    </div>
  );
}
