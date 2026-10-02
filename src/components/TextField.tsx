export function TextField({
  id,
  label,
  type = 'text',
  value,
  error,
  autoComplete,
  wide = false,
  multiline = false,
  onChange,
}: {
  id: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'search'
  value: string
  error?: string
  autoComplete?: string
  wide?: boolean
  multiline?: boolean
  onChange: (value: string) => void
}) {
  const describedBy = error ? `${id}-error` : undefined
  const shared = {
    id,
    value,
    autoComplete,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    required: true,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
  }

  return (
    <div className={wide ? 'field wide' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea {...shared} rows={5} />
      ) : (
        <input {...shared} type={type} />
      )}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
