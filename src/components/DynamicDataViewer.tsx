import { useState, type ReactNode } from 'react'
import { formatValue, humanizeKey } from '../utils/formatters'

interface DynamicDataViewerProps {
  data: unknown
  rootLabel?: string
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function isArrayOfObjects(arr: unknown[]): arr is Record<string, unknown>[] {
  return arr.length > 0 && arr.every((item) => isPlainObject(item))
}

function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
  level = 0,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: ReactNode
  level?: number
}) {
  const [open, setOpen] = useState(defaultOpen || level < 1)

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white ${level > 0 ? 'shadow-sm' : ''}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-800">{title}</span>
        <span className="flex items-center gap-2 text-sm text-slate-500">
          {count !== undefined && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
              {count} {count === 1 ? 'item' : 'itens'}
            </span>
          )}
          <span className="text-brand-600" aria-hidden>
            {open ? '▾' : '▸'}
          </span>
        </span>
      </button>
      {open && <div className="border-t border-slate-100 px-4 pb-4 pt-2">{children}</div>}
    </div>
  )
}

function ObjectTable({ entries }: { entries: [string, unknown][] }) {
  const primitives = entries.filter(
    ([, v]) => v === null || typeof v !== 'object',
  )
  const nested = entries.filter(([, v]) => v !== null && typeof v === 'object')

  return (
    <div className="space-y-4">
      {primitives.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="min-w-full text-sm">
            <tbody>
              {primitives.map(([key, value]) => (
                <tr key={key} className="border-b border-slate-50 last:border-0">
                  <th className="whitespace-nowrap bg-slate-50 px-3 py-2 text-left font-medium text-slate-600">
                    {humanizeKey(key)}
                  </th>
                  <td className="px-3 py-2 text-slate-900 break-words">
                    {formatValue(key, value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {nested.map(([key, value]) => (
        <DataNode key={key} label={humanizeKey(key)} value={value} level={1} />
      ))}
    </div>
  )
}

function ArrayObjectTable({ items, label }: { items: Record<string, unknown>[]; label: string }) {
  const keys = [...new Set(items.flatMap((item) => Object.keys(item)))]

  return (
    <CollapsibleSection title={label} count={items.length} defaultOpen={items.length <= 5}>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-2 py-2 text-left font-semibold text-slate-600">#</th>
              {keys.map((k) => (
                <th key={k} className="px-2 py-2 text-left font-semibold text-slate-600">
                  {humanizeKey(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/50">
                <td className="px-2 py-2 font-mono text-slate-500">{idx + 1}</td>
                {keys.map((k) => (
                  <td key={k} className="max-w-xs px-2 py-2 align-top text-slate-800 break-words">
                    {formatCellValue(k, row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  )
}

function formatCellValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') {
    if (Array.isArray(value)) return `[${value.length} itens]`
    const o = value as Record<string, unknown>
    const desc = o.descricao ?? o.nome ?? o.sigla ?? o.id
    if (desc !== undefined) return formatValue(key, desc)
    return JSON.stringify(value)
  }
  return formatValue(key, value)
}

function DataNode({
  label,
  value,
  level = 0,
}: {
  label: string
  value: unknown
  level?: number
}) {
  if (value === null || value === undefined) {
    return (
      <div className="text-sm text-slate-500">
        <span className="font-medium text-slate-700">{label}:</span> —
      </div>
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <CollapsibleSection title={label} count={0} level={level}>
          <p className="text-sm text-slate-500">Lista vazia</p>
        </CollapsibleSection>
      )
    }

    if (isArrayOfObjects(value)) {
      return <ArrayObjectTable items={value} label={label} />
    }

    return (
      <CollapsibleSection title={label} count={value.length} level={level}>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-800">
          {value.map((item, i) => (
            <li key={i}>
              {typeof item === 'object' && item !== null ? (
                <DataNode label={`Item ${i + 1}`} value={item} level={level + 1} />
              ) : (
                formatValue(label, item)
              )}
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    )
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) {
      return (
        <CollapsibleSection title={label} level={level}>
          <p className="text-sm text-slate-500">Objeto vazio</p>
        </CollapsibleSection>
      )
    }

    const allPrimitive = entries.every(([, v]) => v === null || typeof v !== 'object')

    if (allPrimitive && entries.length <= 8) {
      return (
        <CollapsibleSection title={label} count={entries.length} level={level} defaultOpen>
          <ObjectTable entries={entries} />
        </CollapsibleSection>
      )
    }

    return (
      <CollapsibleSection title={label} count={entries.length} level={level}>
        <ObjectTable entries={entries} />
      </CollapsibleSection>
    )
  }

  return (
    <div className="text-sm">
      <span className="font-medium text-slate-700">{label}:</span>{' '}
      <span className="text-slate-900">{formatValue(label, value)}</span>
    </div>
  )
}

export function DynamicDataViewer({ data, rootLabel = 'Dados completos da API' }: DynamicDataViewerProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900">{rootLabel}</h3>
        <p className="text-xs text-slate-500">Expanda seções para ver objetos e listas aninhados</p>
      </div>
      <DataNode label={rootLabel} value={data} level={0} />
    </section>
  )
}
