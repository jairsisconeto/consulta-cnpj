import { useCallback, useState } from 'react'
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

export default function App() {
  const [cnpjInput, setCnpjInput] = useState('')
  const [fetchState, setFetchState] = useState<FetchState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [jsonModalOpen, setJsonModalOpen] = useState(false)

  const consultar = useCallback(async () => {
    const digits = onlyDigits(cnpjInput)
    if (!isValidCnpjLength(cnpjInput)) {
      setErrorMessage('Informe um CNPJ válido com 14 dígitos.')
      setFetchState('error')
      setData(null)
      return
    }

    setFetchState('loading')
    setErrorMessage(null)
    setData(null)

    try {
      const res = await fetch(`${API_BASE}/${digits}`)
      const body: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'CNPJ não encontrado.' : 'Erro na consulta.')
      }
      setData(body as Record<string, unknown>)
      setFetchState('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido.')
      setFetchState('error')
    }
  }, [cnpjInput])

  const fieldCount = data ? countFilledFields(data) : 0
  const summary = data ? extractSummary(data) : null

  return (
    // Alteração principal: Fundo escuro (slate-950) e texto claro (slate-200)
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

        {/* Card de Busca Moderno */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); void consultar(); }}>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-400">CNPJ</label>
              <CnpjInput value={cnpjInput} onChange={setCnpjInput} disabled={fetchState === 'loading'} />
            </div>
            <button type="submit" disabled={fetchState === 'loading'} className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
              {fetchState === 'loading' ? 'Consultando...' : 'Consultar'}
            </button>
          </form>
        </div>

        {fetchState === 'success' && data && summary && (
          <div className="mt-8 space-y-6">
            <SummaryCard summary={summary} fieldCount={fieldCount} />
            
            {/* Container Dinâmico com fundo escuro */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-inner">
              <h2 className="mb-4 text-xl font-semibold text-white">Detalhamento Técnico</h2>
              <DynamicDataViewer data={data} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}