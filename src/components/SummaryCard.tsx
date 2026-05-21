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
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-200">{value}</dd>
    </div>
  )
}

export function SummaryCard({ summary, fieldCount }: SummaryCardProps) {
  const cnpjFmt = summary.cnpj ? formatCnpjDisplay(summary.cnpj) : null
  
  // Regra de Negócio: Trata tanto Receita Federal (Ativa) quanto Sintegra (Habilitado)
  const status = summary.situacao?.toLowerCase() || ''
  const isAtivo = status === 'ativa' || status === 'habilitado'
  
  const situacaoClass = isAtivo
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : 'bg-red-500/10 text-red-400 border border-red-500/20'

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-xl">
      {/* Cabeçalho do Card */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Razão social
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">
              {summary.razaoSocial ?? '—'}
            </h2>
            {summary.fantasia && (
              <p className="mt-2 text-sm text-slate-400">
                <span className="font-medium text-slate-300">Fantasia:</span> {summary.fantasia}
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
          <p className="mt-3 font-mono text-sm text-blue-400">CNPJ {cnpjFmt}</p>
        )}
      </div>

      {/* Corpo do Card */}
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

      {/* Rodapé do Card */}
      <div className="border-t border-slate-700 bg-slate-900/50 px-6 py-4 text-sm text-slate-400">
        <span className="font-semibold text-blue-400">{fieldCount}</span> campos preenchidos no retorno da API
      </div>
    </section>
  )
}