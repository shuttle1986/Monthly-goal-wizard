export function getUpcomingMonths(): { twoMonths: string[]; oneMonth: string[] } {
  const now = new Date();
  let y1 = now.getFullYear();
  let m1 = now.getMonth() + 2; // next month (0-indexed + 1 for next + 1 for 1-indexed)
  if (m1 > 12) {
    m1 -= 12;
    y1 += 1;
  }

  let y2 = y1;
  let m2 = m1 + 1;
  if (m2 > 12) {
    m2 -= 12;
    y2 += 1;
  }

  const fmt = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

  return {
    oneMonth: [fmt(y1, m1)],
    twoMonths: [fmt(y1, m1), fmt(y2, m2)],
  };
}

export function parseYearMonth(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-').map(Number);
  return { year: y, month: m };
}
