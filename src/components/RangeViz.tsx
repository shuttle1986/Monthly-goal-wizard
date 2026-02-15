import { useRef, useCallback } from 'react';
import type { MetricStats } from '../types';

interface RangeVizProps {
  stats: MetricStats;
  /** Current goal value (drives the draggable thumb) */
  value?: number;
  /** Called when the user drags the thumb */
  onChange?: (v: number) => void;
  /** Slider min/max bounds */
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
  const range = sliderMax - sliderMin || 1;

  // Convert a pixel position on the track to a value
  const posToValue = useCallback(
    (clientX: number) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(sliderMin + pct * range);
    },
    [sliderMin, range],
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

  // Positions as percentages
  const { min, max, avg } = stats;
  const pct = (v: number) => ((v - sliderMin) / range) * 100;

  const pctMin = pct(min);
  const pctMax = pct(max);
  const pctAvg = pct(avg);
  const pctValue = value !== undefined ? pct(value) : undefined;

  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-500">
      <span className="tabular-nums w-7 text-right font-medium">{Math.round(min)}</span>
      <div
        ref={trackRef}
        className={`relative flex-1 h-8 ${interactive ? 'cursor-pointer' : ''}`}
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
          style={{
            left: `${pctMin}%`,
            width: `${Math.max(0, pctMax - pctMin)}%`,
          }}
        />
        {/* Avg marker (subtle tick) */}
        <div
          className="absolute top-1/2 w-0.5 h-3.5 -translate-y-1/2 bg-brand-300 rounded-full opacity-60"
          style={{ left: `${pctAvg}%` }}
          title={`Avg: ${Math.round(avg)}`}
        />
        {/* Draggable goal thumb */}
        {interactive && pctValue !== undefined && (
          <div
            className="absolute top-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-[3px] ring-white shadow-lg hover:scale-110 active:scale-115 active:shadow-xl transition-transform"
            style={{ left: `${pctValue}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
        {/* Static avg dot (when not interactive) */}
        {!interactive && (
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 ring-2 ring-white shadow-sm"
            style={{ left: `${pctAvg}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
      </div>
      <span className="tabular-nums w-7 font-medium">{Math.round(max)}</span>
    </div>
  );
}
