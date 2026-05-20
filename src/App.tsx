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
        const msg =
          body &&
          typeof body === 'object' &&
          'message' in body &&
          typeof (body as { message: unknown }).message === 'string'
            ? (body as { message: string }).message
            : res.status === 404
              ? 'CNPJ não encontrado na base pública.'
              : `Erro ${res.status}: não foi possível consultar.`
        throw new Error(msg)
      }

      if (!body || typeof body !== 'object') {
        throw new Error('Resposta inválida da API.')
      }

      setData(body as Record<string, unknown>)
      setFetchState('success')
    } catch (err) {
      const msg =
        err instanceof TypeError && err.message.includes('fetch')
          ? 'Falha de rede ou bloqueio CORS. Tente novamente ou use um proxy.'
          : err instanceof Error
            ? err.message
            : 'Erro desconhecido.'
      setErrorMessage(msg)
      setFetchState('error')
    }
  }, [cnpjInput])

  const fieldCount = data ? countFilledFields(data) : 0
  const summary = data ? extractSummary(data) : null

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 text-center sm:mb-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-600/30">
          C
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Consulta CNPJ
        </h1>
        <p className="mt-2 text-slate-600">
          Dados públicos via{' '}
          <a
            href="https://publica.cnpj.ws"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            publica.cnpj.ws
          </a>
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6">
        <form
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            void consultar()
          }}
        >
          <div className="flex-1">
            <label htmlFor="cnpj" className="mb-1.5 block text-sm font-semibold text-slate-700">
              CNPJ
            </label>
            <CnpjInput
              value={cnpjInput}
              onChange={setCnpjInput}
              disabled={fetchState === 'loading'}
            />
          </div>
          <button
            type="submit"
            disabled={fetchState === 'loading'}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[160px]"
          >
            {fetchState === 'loading' ? 'Consultando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {fetchState === 'loading' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <LoadingSpinner />
        </div>
      )}

      {fetchState === 'error' && errorMessage && (
        <div className="mt-6">
          <ErrorAlert message={errorMessage} onDismiss={() => setFetchState('idle')} />
        </div>
      )}

      {fetchState === 'success' && data && summary && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setJsonModalOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Ver JSON bruto
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(JSON.stringify(data, null, 2))
              }}
              className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-100"
            >
              Copiar JSON
            </button>
          </div>

          <SummaryCard summary={summary} fieldCount={fieldCount} />

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm sm:p-6">
            <DynamicDataViewer data={data} />
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-slate-500">
        Fonte: API pública CNPJ.ws — uso informativo. Respeite limites de requisição.
      </footer>

      <RawJsonModal
        open={jsonModalOpen}
        data={data}
        onClose={() => setJsonModalOpen(false)}
      />
    </div>
  )
}
