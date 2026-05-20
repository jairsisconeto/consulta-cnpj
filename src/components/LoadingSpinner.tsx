export function LoadingSpinner({ label = 'Consultando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8" role="status" aria-live="polite">
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  )
}
