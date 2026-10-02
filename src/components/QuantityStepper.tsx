export function QuantityStepper({
  value,
  max,
  onChange,
  label,
}: {
  value: number
  max: number
  onChange: (value: number) => void
  label: string
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={`Decrease quantity of ${label}`}
      >
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        +
      </button>
    </div>
  )
}
