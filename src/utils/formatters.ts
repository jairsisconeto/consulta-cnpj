import { onlyDigits } from './cnpj'

const CNPJ_KEYS = /cnpj/i
const CEP_KEYS = /^cep$|codigo_postal/i
const DATE_KEYS =
  /data|date|atualizado_em|created|updated|inicio|exclusao|opcao|situacao/i
const CAPITAL_KEYS = /capital_social|capital/i
const BOOL_KEYS = /^ativo$|^mei$|^simples$|boolean/i

export function formatCnpjDisplay(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length !== 14) return value
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

export function formatCepDisplay(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length !== 8) return value
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function formatDateDisplay(value: string): string {
  const isoDate = /^\d{4}-\d{2}-\d{2}/
  const isoDateTime = /^\d{4}-\d{2}-\d{2}T/
  if (isoDateTime.test(value)) {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }
  if (isoDate.test(value)) {
    const [y, m, day] = value.split('T')[0].split('-')
    return `${day}/${m}/${y}`
  }
  return value
}

export function formatCapitalDisplay(value: string | number): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'))
  if (Number.isNaN(num)) return String(value)
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatBooleanDisplay(value: boolean): string {
  return value ? 'Sim' : 'Não'
}

export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return formatBooleanDisplay(value)

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return '—'

    if (CNPJ_KEYS.test(key) && /^\d{14}$/.test(onlyDigits(trimmed))) {
      return formatCnpjDisplay(trimmed)
    }
    if (CEP_KEYS.test(key) && /^\d{8}$/.test(onlyDigits(trimmed))) {
      return formatCepDisplay(trimmed)
    }
    if (DATE_KEYS.test(key)) {
      return formatDateDisplay(trimmed)
    }
    if (CAPITAL_KEYS.test(key) && /^[\d.,]+$/.test(trimmed)) {
      return formatCapitalDisplay(trimmed)
    }
    if (BOOL_KEYS.test(key) && /^(true|false|sim|não|nao|s|n)$/i.test(trimmed)) {
      return /^(true|sim|s)$/i.test(trimmed) ? 'Sim' : 'Não'
    }
    return trimmed
  }

  if (typeof value === 'number') {
    if (CAPITAL_KEYS.test(key)) return formatCapitalDisplay(value)
    return String(value)
  }

  return String(value)
}

export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
