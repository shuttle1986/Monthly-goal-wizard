import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const CSV_PATH = resolve('public/data/history.csv');
const JSON_PATH = resolve('public/data/history.json');

const VALID_METRICS = ['events', 'new_teens', 'unique_attendance', 'one_on_ones'];

function main() {
  console.log(`Validating ${CSV_PATH}...\n`);

  let raw: string;
  try {
    raw = readFileSync(CSV_PATH, 'utf-8');
  } catch {
    console.error(`ERROR: Cannot read ${CSV_PATH}`);
    process.exit(1);
  }

  const lines = raw.trim().split('\n');
  if (lines.length < 2) {
    console.error('ERROR: CSV has no data rows');
    process.exit(1);
  }

  const header = lines[0].split(',').map((h) => h.trim());
  const expected = ['region', 'chapter', 'metric_key', 'year', 'month', 'value'];

  for (const col of expected) {
    if (!header.includes(col)) {
      console.error(`ERROR: Missing column "${col}". Found: ${header.join(', ')}`);
      process.exit(1);
    }
  }

  const errors: string[] = [];
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length !== expected.length) {
      errors.push(`Row ${i + 1}: Expected ${expected.length} columns, got ${parts.length}`);
      continue;
    }

    const region = parts[0].trim();
    const chapter = parts[1].trim();
    const metric_key = parts[2].trim();
    const year = parseInt(parts[3].trim(), 10);
    const month = parseInt(parts[4].trim(), 10);
    const value = parseFloat(parts[5].trim());

    if (!region) errors.push(`Row ${i + 1}: Empty region`);
    if (!metric_key) errors.push(`Row ${i + 1}: Empty metric_key`);
    if (!VALID_METRICS.includes(metric_key)) {
      errors.push(`Row ${i + 1}: Invalid metric_key "${metric_key}". Valid: ${VALID_METRICS.join(', ')}`);
    }
    if (isNaN(year) || year < 2000 || year > 2100) {
      errors.push(`Row ${i + 1}: Invalid year "${parts[3].trim()}"`);
    }
    if (isNaN(month) || month < 1 || month > 12) {
      errors.push(`Row ${i + 1}: Invalid month "${parts[4].trim()}"`);
    }
    if (isNaN(value)) {
      errors.push(`Row ${i + 1}: Invalid value "${parts[5].trim()}"`);
    }

    rows.push({ region, chapter, metric_key, year, month, value });
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} error(s):\n`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`OK: ${rows.length} valid rows`);

  const regions = new Set(rows.map((r) => r.region as string));
  const chapters = new Set(rows.map((r) => `${r.region}/${r.chapter}`));
  const metrics = new Set(rows.map((r) => r.metric_key as string));

  console.log(`Regions: ${[...regions].join(', ')}`);
  console.log(`Chapters: ${[...chapters].join(', ')}`);
  console.log(`Metrics: ${[...metrics].join(', ')}`);

  // Write JSON
  writeFileSync(JSON_PATH, JSON.stringify(rows, null, 2));
  console.log(`\nJSON written to ${JSON_PATH}`);
}

main();
