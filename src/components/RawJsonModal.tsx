import { useEffect, useState } from 'react'

interface RawJsonModalProps {
  open: boolean
  data: unknown
  onClose: () => void
}

export function RawJsonModal({ open, data, onClose }: RawJsonModalProps) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data, null, 2)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  if (!open) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="json-modal-title" className="text-lg font-bold text-slate-900">
            JSON bruto
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {copied ? 'Copiado!' : 'Copiar JSON'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Fechar
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto bg-slate-900 p-5 text-xs leading-relaxed text-emerald-100 sm:text-sm">
          {json}
        </pre>
      </div>
    </div>
  )
}
