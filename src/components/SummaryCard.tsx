import type { CompanySummary } from '../utils/summary'
import { formatCnpjDisplay } from '../utils/formatters'

interface SummaryCardProps {
  summary: CompanySummary
  fieldCount: number
  data: Record<string, any>
}

function TableCell({ label, value, colSpan = 1 }: { label: string; value: string | null; colSpan?: number }) {
  if (!value) return null
  return (
    <div className={`border border-slate-700 bg-slate-800/30 p-3 sm:col-span-${colSpan}`}>
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="mt-1 block text-sm font-medium text-slate-200">{value}</span>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-700 border-t border-slate-700 first:border-t-0">
      <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">{title}</h3>
    </div>
  )
}

// Função auxiliar para formatar datas no padrão BR (YYYY-MM-DD -> DD/MM/YYYY)
const formatDataBR = (dataStr?: string) => {
  if (!dataStr) return '—'
  const partes = dataStr.split('-')
  if (partes.length !== 3) return dataStr
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

export function SummaryCard({ summary, fieldCount, data }: SummaryCardProps) {
  const cnpjFmt = summary.cnpj ? formatCnpjDisplay(summary.cnpj) : null
  const status = summary.situacao?.toLowerCase() || ''
  const isAtivo = status === 'ativa' || status === 'habilitado'
  const situacaoClass = isAtivo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'

  // --- EXTRAÇÃO DE DADOS FEDERAIS PROFUNDOS ---
  const atividadesSecundarias = data?.estabelecimento?.atividades_secundarias || []
  const socios = data?.socios || []
  
  const porte = data?.porte?.descricao || 'Não Informado'
  const capitalSocial = data?.capital_social ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.capital_social)) : '—'
  const natJuridica = data?.natureza_juridica?.descricao ? `${data.natureza_juridica.id || ''} - ${data.natureza_juridica.descricao}` : '—'

  // --- DADOS DO SIMPLES NACIONAL ---
  const simples = data?.simples || {}
  const optanteSimples = simples.simples === 'S' ? 'Sim' : 'Não'
  const dataOpcaoSimples = formatDataBR(simples.data_opcao_simples)
  const dataExclusaoSimples = formatDataBR(simples.data_exclusao_simples)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
      
      {/* --- CABEÇALHO PRINCIPAL --- */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Razão Social</span>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{summary.razaoSocial ?? '—'}</h2>
          {cnpjFmt && <p className="mt-1 font-mono text-xs text-slate-400">CNPJ: {cnpjFmt}</p>}
        </div>
        {summary.situacao && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${situacaoClass}`}>
            {summary.situacao}
          </span>
        )}
      </div>

      {/* --- SEÇÃO: IDENTIFICAÇÃO BÁSICA --- */}
      <SectionHeader title="1. Identificação Básica" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <TableCell label="Nome Fantasia" value={summary.fantasia || '—'} colSpan={2} />
        <TableCell label="Inscrição Estadual" value={summary.inscricoesEstaduais || 'Não Informada'} colSpan={2} />
      </div>

      {/* --- SEÇÃO: DADOS CORPORATIVOS E FINANCEIROS --- */}
      <SectionHeader title="2. Dados Corporativos" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <TableCell label="Porte da Empresa" value={porte} colSpan={1} />
        <TableCell label="Capital Social" value={capitalSocial} colSpan={1} />
        <TableCell label="Natureza Jurídica" value={natJuridica} colSpan={2} />
      </div>

      {/* --- SEÇÃO: REGIME TRIBUTÁRIO --- */}
      <SectionHeader title="3. Regime Tributário (Federal)" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <TableCell label="Optante pelo Simples?" value={optanteSimples} colSpan={1} />
        <TableCell label="Data da Opção (Simples)" value={dataOpcaoSimples} colSpan={1} />
        <TableCell label="Data da Exclusão (Simples)" value={dataExclusaoSimples} colSpan={2} />
      </div>

      {/* --- SEÇÃO: ENDEREÇO E CONTATO --- */}
      <SectionHeader title="4. Localização e Contato" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <TableCell label="Logradouro / Endereço" value={summary.endereco} colSpan={4} />
        <TableCell label="Cidade / UF" value={summary.cidadeUf} colSpan={2} />
        <TableCell label="Telefone" value={summary.telefone || '—'} colSpan={1} />
        <TableCell label="E-mail" value={summary.email || '—'} colSpan={1} />
      </div>

      {/* --- SEÇÃO: ATIVIDADE PRINCIPAL --- */}
      <SectionHeader title="5. Atividade Econômica Principal" />
      <div className="grid grid-cols-1 gap-0">
        <TableCell label="CNAE Principal" value={summary.cnae} colSpan={1} />
      </div>

      {/* --- SEÇÃO: ATIVIDADES SECUNDÁRIAS --- */}
      <SectionHeader title="6. Atividades Econômicas Secundárias" />
      <div className="border border-slate-700 bg-slate-900/50 p-4">
        {atividadesSecundarias.length > 0 ? (
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 text-sm text-slate-300 scrollbar-thin scrollbar-thumb-slate-700">
            {atividadesSecundarias.map((act: any, idx: number) => (
              <li key={idx} className="flex items-start gap-3 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-950/50 border border-blue-900/30 px-2 py-0.5 rounded shrink-0">
                  {act.codigo}
                </span>
                <span className="text-slate-300 text-xs">{act.descricao}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">Nenhuma atividade secundária declarada.</p>
        )}
      </div>

      {/* --- SEÇÃO: QUADRO DE SÓCIOS (QSA) --- */}
      <SectionHeader title="7. Quadro de Sócios e Administradores (QSA)" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 bg-slate-950/20">
        {socios.length > 0 ? (
          socios.map((socio: any, idx: number) => (
            <div key={idx} className="border border-slate-700 p-4 flex flex-col justify-between gap-2 bg-slate-900/40">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nome do Integrante</span>
                <span className="text-sm font-semibold text-slate-200">{socio.nome}</span>
              </div>
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-blue-400 bg-blue-950/60 border border-blue-900/40 px-2.5 py-0.5 rounded">
                  {socio.qualificacao_socio?.descricao || 'Sócio'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-slate-700 p-4 sm:col-span-2 text-xs text-slate-500 italic">
            Informações do QSA indisponíveis para este tipo de empresa.
          </div>
        )}
      </div>

      {/* RODAPÉ INFORMATIVO */}
      <div className="bg-slate-950 px-6 py-3 text-center text-xs text-slate-500 border-t border-slate-800">
        Mapeamento concluído. <span className="font-semibold text-blue-400">{fieldCount}</span> propriedades indexadas no ecossistema.
      </div>
    </section>
  )
}