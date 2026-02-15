interface Props {
  variability: 'consistent' | 'mixed' | 'volatile';
}

const config = {
  consistent: {
    label: 'Consistent',
    icon: '\u2713',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    tooltip: 'This metric has been very steady across past years for this month.',
  },
  mixed: {
    label: 'Mixed',
    icon: '\u223C',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    tooltip: 'This metric has shown moderate variation year-to-year for this month.',
  },
  volatile: {
    label: 'Volatile',
    icon: '\u26A0',
    className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    tooltip: 'This metric has varied significantly year-to-year. Consider context when setting your goal.',
  },
};

export default function VariabilityBadge({ variability }: Props) {
  const c = config[variability];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-help ${c.className}`}
      title={c.tooltip}
    >
      <span aria-hidden="true">{c.icon}</span>
      {c.label}
    </span>
  );
}
