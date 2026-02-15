import { v4 as uuidv4 } from 'uuid';
import { APP_VERSION, MONTH_NAMES, METRICS } from '../config/appConfig';
import type { GoalsByMonth, SubmissionPayload } from '../types';

export function buildPayload(
  region: string,
  chapter: string,
  staff: string,
  months: string[],
  goalsByMonth: GoalsByMonth,
): SubmissionPayload {
  const metricsByMonth: SubmissionPayload['metricsByMonth'] = {};
  for (const ym of months) {
    metricsByMonth[ym] = (goalsByMonth[ym] || []).map((g) => ({
      key: g.key,
      label: g.label,
      goalValue: g.goalValue ?? 0,
      reasons: g.reasons,
      note: g.note,
    }));
  }

  return {
    submissionId: uuidv4(),
    createdAtIso: new Date().toISOString(),
    region,
    chapter,
    staff,
    months,
    metricsByMonth,
    appVersion: APP_VERSION,
  };
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function buildSubmissionBlock(payload: SubmissionPayload): string {
  const lines: string[] = [];
  lines.push('NCSY Monthly Goals Submission');
  lines.push(`Region: ${payload.region}`);
  lines.push(`Chapter: ${payload.chapter || '(none)'}`);
  lines.push(`Staff: ${payload.staff}`);
  lines.push(`Window: ${payload.months.join(', ')}`);
  lines.push(`Submitted: ${new Date(payload.createdAtIso).toLocaleString()}`);
  lines.push('');

  for (const ym of payload.months) {
    lines.push(formatMonth(ym));
    const metrics = payload.metricsByMonth[ym] || [];
    for (const m of metrics) {
      let line = `  - ${m.label}: ${m.goalValue}`;
      if (m.reasons.length > 0) {
        line += ` (Reasons: ${m.reasons.join(', ')})`;
      }
      if (m.note) {
        line += ` (Note: ${m.note})`;
      }
      lines.push(line);
    }
    lines.push('');
  }

  lines.push('---TECH (do not edit)---');
  lines.push(JSON.stringify(payload, null, 2));

  return lines.join('\n');
}

export function buildHumanOnlyBlock(payload: SubmissionPayload): string {
  const lines: string[] = [];
  lines.push('NCSY Monthly Goals Submission');
  lines.push(`Region: ${payload.region}`);
  lines.push(`Chapter: ${payload.chapter || '(none)'}`);
  lines.push(`Staff: ${payload.staff}`);
  lines.push(`Window: ${payload.months.join(', ')}`);
  lines.push(`Submitted: ${new Date(payload.createdAtIso).toLocaleString()}`);
  lines.push('');

  for (const ym of payload.months) {
    lines.push(formatMonth(ym));
    const metrics = payload.metricsByMonth[ym] || [];
    for (const m of metrics) {
      let line = `  - ${m.label}: ${m.goalValue}`;
      if (m.reasons.length > 0) {
        line += ` (Reasons: ${m.reasons.join(', ')})`;
      }
      if (m.note) {
        line += ` (Note: ${m.note})`;
      }
      lines.push(line);
    }
    lines.push('');
  }

  lines.push('(Full submission attached as .txt file)');
  return lines.join('\n');
}

export function buildReceiptLine(payload: SubmissionPayload): string {
  const metricCount = METRICS.length;
  return `Goals submitted: ${payload.months.join(', ')} | ${payload.region} | ${payload.chapter || '(none)'} | ${payload.staff} | ${metricCount} metrics`;
}

export function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildMailto(
  payload: SubmissionPayload,
  fullBlock: string,
): { href: string; needsAttachment: boolean } {
  const subject = encodeURIComponent(
    `Monthly Goals ${payload.months.join(', ')} – ${payload.staff} (${payload.region})`,
  );

  const humanBlock = buildHumanOnlyBlock(payload);

  if (fullBlock.length <= 1500) {
    const body = encodeURIComponent(fullBlock);
    return { href: `mailto:?subject=${subject}&body=${body}`, needsAttachment: false };
  }

  const body = encodeURIComponent(humanBlock);
  return { href: `mailto:?subject=${subject}&body=${body}`, needsAttachment: true };
}
