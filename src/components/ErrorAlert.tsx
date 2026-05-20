interface ErrorAlertProps {
  title?: string
  message: string
  onDismiss?: () => void
}

export function ErrorAlert({ title = 'Erro na consulta', message, onDismiss }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-red-800">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
            aria-label="Fechar erro"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
