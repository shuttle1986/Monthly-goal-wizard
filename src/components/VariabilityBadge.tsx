interface Props {
  variability: 'consistent' | 'mixed' | 'volatile';
}

const config = {
  consistent: {
    label: 'Consistent',
    className: 'bg-green-100 text-green-800',
    tooltip: 'This metric has been very steady across past years for this month.',
  },
  mixed: {
    label: 'Mixed',
    className: 'bg-yellow-100 text-yellow-800',
    tooltip: 'This metric has shown moderate variation year-to-year for this month.',
  },
  volatile: {
    label: 'Volatile',
    className: 'bg-red-100 text-red-800',
    tooltip: 'This metric has varied significantly year-to-year. Consider context when setting your goal.',
  },
};

export default function VariabilityBadge({ variability }: Props) {
  const c = config[variability];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium cursor-help ${c.className}`}
      title={c.tooltip}
    >
      {c.label}
    </span>
  );
}
