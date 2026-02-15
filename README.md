# Monthly Goal Wizard

A browser-based goal-setting wizard for staff to set monthly chapter goals across 4 key metrics, anchored by historical data patterns.

No backend required — runs entirely in the browser and deploys to GitHub Pages.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173/Monthly-goal-wizard/](http://localhost:5173/Monthly-goal-wizard/) in your browser.

## Build

```bash
npm run build
npm run serve   # preview the production build
```

## GitHub Pages Deployment

1. Go to your repo **Settings > Pages**
2. Under **Build and deployment**, select **GitHub Actions** as the source
3. Push to `main` — the included workflow (`.github/workflows/deploy.yml`) will build and deploy automatically

The app will be available at `https://<username>.github.io/Monthly-goal-wizard/`.

## Updating Shared Historical Data

Historical reference data is shipped as a static CSV file at `/public/data/history.csv`.

To update:
1. Edit or replace `public/data/history.csv` with new data
2. Run validation: `npm run validate:data`
3. Commit and push to `main` — Pages will redeploy automatically

### CSV Format

```
region,chapter,metric_key,year,month,value
Midwest,Chicago,events,2023,2,5
```

Columns:
- **region** — region name (must match `src/config/appConfig.ts`)
- **chapter** — chapter name (can be blank)
- **metric_key** — one of: `events`, `new_teens`, `unique_attendance`, `one_on_ones`
- **year** — 4-digit year
- **month** — 1–12
- **value** — numeric value

## Prefilled Links

Regional directors can share links that preselect scope:

```
https://<username>.github.io/Monthly-goal-wizard/#/?region=Midwest&chapter=Chicago
```

When parameters are present, the region/chapter selectors are locked.

## How Staff Submit Goals

After completing the wizard, staff have 3 submission options:

1. **Copy** — copies the submission block to clipboard for pasting into Teams/email
2. **Download** — saves a `.txt` file with the full submission
3. **Email** — opens the default email client with the submission pre-filled

Each submission contains a human-readable summary and a machine-parseable JSON payload.

See `MonthlyGoals_sample_submission.txt` for an example.

## Data Validation

```bash
npm run validate:data
```

This validates `/public/data/history.csv` for correct columns, types, and metric keys, and optionally generates a JSON version.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- react-hook-form + zod
- HashRouter for GitHub Pages compatibility
- No backend — all data is static or stored in localStorage
