import { useCallback, useState, useEffect } from 'react'
import { CnpjInput } from './components/CnpjInput'
import { DynamicDataViewer } from './components/DynamicDataViewer'
import { ErrorAlert } from './components/ErrorAlert'
import { LoadingSpinner } from './components/LoadingSpinner'
import { RawJsonModal } from './components/RawJsonModal'
import { SummaryCard } from './components/SummaryCard'
import { onlyDigits, isValidCnpjLength } from './utils/cnpj'
import { countFilledFields } from './utils/fieldCounter'
import { extractSummary } from './utils/summary'

const API_BASE = 'https://publica.cnpj.ws/cnpj'
type FetchState = 'idle' | 'loading' | 'success' | 'error'

// Definição da estrutura do item de histórico
interface HistoricoItem {
  cnpj: string;
  razaoSocial: string;
  dataConsulta: string;
}

export default function App() {
  const [cnpjInput, setCnpjInput] = useState('')
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [jsonModalOpen, setJsonModalOpen] = useState(false)
  
  // Estado para armazenar o histórico local
  const [historico, setHistorico] = useState<HistoricoItem[]>([])

  // Efeito executado ao montar o componente: carrega dados salvos no navegador
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('cnpj_panel_history')
    if (dadosSalvos) {
      try {
        setHistorico(JSON.parse(dadosSalvos))
      } catch (e) {
        console.error('Erro ao ler o localStorage:', e)
      }
    }
  }, [])

  const consultarCnpjDireto = useCallback(async (cnpjAlvo: string) => {
    const digits = onlyDigits(cnpjAlvo)
    setFetchState('loading')
    setErrorMessage(null)
    setData(null)

    try {
      const res = await fetch(`${API_BASE}/${digits}`)
      const body: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'CNPJ não encontrado.' : 'Erro na consulta.')
      }

      const dataObj = body as Record<string, any>
      setData(dataObj)
      setFetchState('success')

      // Atualização atómica do histórico local
      const cnpjItem = dataObj?.estabelecimento?.cnpj || digits
      const razaoItem = dataObj?.razao_social || 'Sem Razão Social'
      const dataAtual = new Date().toLocaleDateString('pt-BR')

      setHistorico((prev) => {
        // Remove o item se ele já existir na lista antiga (evita duplicados)
        const filtrado = prev.filter((item) => item.cnpj !== cnpjItem)
        // Adiciona no topo e limita o tamanho máximo a 5 registos
        const atualizado = [
          { cnpj: cnpjItem, razaoSocial: razaoItem, dataConsulta: dataAtual },
          ...filtrado
        ].slice(0, 5)
        
        localStorage.setItem('cnpj_panel_history', JSON.stringify(atualizado))
        return atualizado
      })

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido.')
      setFetchState('error')
    }
  }, [])

  const handleSubmeter = (e: React.FormEvent) => {
    e.preventDefault()
    void consultarCnpjDireto(cnpjInput)
  }

  const limparHistorico = () => {
    localStorage.removeItem('cnpj_panel_history')
    setHistorico([])
  }

  const fieldCount = data ? countFilledFields(data) : 0
  const summary = data ? extractSummary(data) : null

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl">
        
        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-900/20">
            C
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Consulta CNPJ</h1>
          <p className="mt-3 text-slate-400">
            Painel de Dados Corporativos via <a href="https://publica.cnpj.ws" className="text-blue-400 hover:underline">publica.cnpj.ws</a>
          </p>
        </header>

        {/* Formulário Principal de Procura */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleSubmeter}>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-400">CNPJ</label>
              <CnpjInput value={cnpjInput} onChange={setCnpjInput} disabled={fetchState === 'loading'} />
            </div>
            <button type="submit" disabled={fetchState === 'loading'} className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
              {fetchState === 'loading' ? 'Consultando...' : 'Consultar'}
            </button>
          </form>
        </div>

        {/* SEÇÃO: CONSULTAS RECENTES (HISTÓRICO) */}
        {historico.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultas Recentes (Salvas no Browser)</h3>
              <button type="button" onClick={limparHistorico} className="text-xs font-semibold text-red-400 hover:underline">
                Limpar Histórico
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {historico.map((item) => (
                <button
                  key={item.cnpj}
                  type="button"
                  onClick={() => {
                    setCnpjInput(item.cnpj);
                    void consultarCnpjDireto(item.cnpj);
                  }}
                  className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900 p-3 text-left transition hover:border-blue-500/50 hover:bg-slate-800/60"
                >
                  <span className="truncate w-full text-xs font-bold text-slate-200">{item.razaoSocial}</span>
                  <span className="mt-1 font-mono text-[11px] text-blue-400">
                    {item.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                  </span>
                  <span className="mt-2 text-[10px] text-slate-500">Acesso em: {item.dataConsulta}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {fetchState === 'loading' && (
          <div className="mt-6 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {fetchState === 'error' && errorMessage && (
          <div className="mt-6">
            <ErrorAlert message={errorMessage} onDismiss={() => setFetchState('idle')} />
          </div>
        )}

        {fetchState === 'success' && data && summary && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setJsonModalOpen(true)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700">
                Ver JSON bruto
              </button>
              <button type="button" onClick={() => void navigator.clipboard.writeText(JSON.stringify(data, null, 2))} className="rounded-lg border border-blue-900 bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-900/50">
                Copiar JSON
              </button>
            </div>

            <SummaryCard summary={summary} fieldCount={fieldCount} data={data} />
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-inner">
              <h2 className="mb-4 text-xl font-semibold text-white">Detalhamento Técnico</h2>
              <DynamicDataViewer data={data} />
            </div>
          </div>
        )}
      </div>
      
      <RawJsonModal open={jsonModalOpen} data={data} onClose={() => setJsonModalOpen(false)} />
    </div>
  )
}