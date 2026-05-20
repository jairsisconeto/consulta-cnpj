import type { CompanySummary } from '../utils/summary'
import { formatCnpjDisplay } from '../utils/formatters'

interface SummaryCardProps {
  summary: CompanySummary
  fieldCount: number
}

function SummaryItem({
  label,
  value,
  fullWidth,
}: {
  label: string
  value: string | null
  fullWidth?: boolean
}) {
  if (!value) return null
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}

export function SummaryCard({ summary, fieldCount }: SummaryCardProps) {
  const cnpjFmt = summary.cnpj ? formatCnpjDisplay(summary.cnpj) : null
  const situacaoClass =
    summary.situacao?.toLowerCase() === 'ativa'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-amber-100 text-amber-800'

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
      <div className="border-b border-slate-100 bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-100">
              Razão social
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
              {summary.razaoSocial ?? '—'}
            </h2>
            {summary.fantasia && (
              <p className="mt-2 text-sm text-brand-100">
                <span className="font-medium">Fantasia:</span> {summary.fantasia}
              </p>
            )}
          </div>
          {summary.situacao && (
            <span
              className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${situacaoClass}`}
            >
              {summary.situacao}
            </span>
          )}
        </div>
        {cnpjFmt && (
          <p className="mt-3 font-mono text-sm text-brand-100">CNPJ {cnpjFmt}</p>
        )}
      </div>

      <dl className="grid gap-5 p-6 sm:grid-cols-2">
        <SummaryItem label="Endereço" value={summary.endereco} fullWidth />
        <SummaryItem label="Cidade / UF" value={summary.cidadeUf} />
        <SummaryItem label="CNAE principal" value={summary.cnae} fullWidth />
        <SummaryItem label="Telefone" value={summary.telefone} />
        <SummaryItem label="E-mail" value={summary.email} />
        <SummaryItem
          label="Inscrições estaduais"
          value={summary.inscricoesEstaduais}
          fullWidth
        />
      </dl>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-sm text-slate-600">
        <span className="font-semibold text-brand-700">{fieldCount}</span> campos preenchidos no
        retorno da API
      </div>
    </section>
  )
}
