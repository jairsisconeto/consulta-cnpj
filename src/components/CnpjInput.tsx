import { formatCnpjMask, onlyDigits } from '../utils/cnpj'

interface CnpjInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
}

export function CnpjInput({ value, onChange, disabled, id = 'cnpj' }: CnpjInputProps) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="00.000.000/0000-00"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(formatCnpjMask(e.target.value))}
      onPaste={(e) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text')
        onChange(formatCnpjMask(onlyDigits(text)))
      }}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg tracking-wide text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
    />
  )
}
