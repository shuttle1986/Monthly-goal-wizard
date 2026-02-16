import type { NeighborMonth } from '../types';

interface Props {
  neighbors: NeighborMonth[];
  currentMonth: number;
}

export default function MonthSparkline({ neighbors, currentMonth }: Props) {
  if (neighbors.length === 0) return null;

  const values = neighbors.map((n) => n.avg);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const W = 200;
  const H = 48;
  const padX = 8;
  const padTop = 6;
  const padBot = 16;
  const plotH = H - padTop - padBot;

  const points = neighbors.map((n, i) => {
    const x = padX + (i / (neighbors.length - 1)) * (W - padX * 2);
    const y = padTop + plotH - ((n.avg - minVal) / range) * plotH;
    return { x, y, ...n };
  });

  // Trend arrow between prev and current
  const prev = neighbors[0]?.avg ?? 0;
  const curr = neighbors[1]?.avg ?? 0;
  const next = neighbors[2]?.avg ?? 0;
  const trendPrev = curr > prev ? 'up' : curr < prev ? 'down' : 'flat';
  const trendNext = next > curr ? 'up' : next < curr ? 'down' : 'flat';

  const arrowChar = (t: string) => t === 'up' ? '\u2197' : t === 'down' ? '\u2198' : '\u2192';

  // Collect unique events across all 3 months (most recent year only per event name)
  const allEvents: { month: string; name: string; year: number; value: number }[] = [];
  for (const n of neighbors) {
    const seen = new Set<string>();
    for (const e of n.events) {
      if (!seen.has(e.name)) {
        seen.add(e.name);
        allEvents.push({ month: n.monthLabel, ...e });
      }
    }
  }

  return (
    <div className="mt-2">
      {/* Sparkline */}
      <div className="flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[200px] h-12">
          {/* Connecting line */}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#c7d2fe"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots and labels */}
          {points.map((p, i) => {
            const isCurrent = p.month === currentMonth;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isCurrent ? 4.5 : 3}
                  fill={isCurrent ? '#6366f1' : '#a5b4fc'}
                  stroke="white"
                  strokeWidth="1.5"
                />
                <text
                  x={p.x}
                  y={H - 2}
                  textAnchor="middle"
                  className="text-[9px]"
                  fill={isCurrent ? '#4338ca' : '#9ca3af'}
                  fontWeight={isCurrent ? 700 : 500}
                >
                  {p.monthLabel}
                </text>
                <text
                  x={p.x}
                  y={p.y - 7}
                  textAnchor="middle"
                  className="text-[9px]"
                  fill={isCurrent ? '#4338ca' : '#6b7280'}
                  fontWeight={isCurrent ? 700 : 500}
                >
                  {p.avg}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trend summary */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 mt-0.5">
        <span>{arrowChar(trendPrev)} from {neighbors[0]?.monthLabel}</span>
        <span>{arrowChar(trendNext)} to {neighbors[2]?.monthLabel}</span>
      </div>

      {/* Notable events */}
      {allEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {allEvents.slice(0, 3).map((e, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="text-amber-400">&#9733;</span>
              <span>
                {e.month} {e.year}: <span className="text-gray-500 font-medium">{e.name}</span> ({e.value})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
