function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'boolean' || typeof value === 'number') return true
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as object).length > 0
  return true
}

export function countFilledFields(data: unknown): number {
  let count = 0

  function walk(node: unknown): void {
    if (node === null || node === undefined) return

    if (Array.isArray(node)) {
      for (const item of node) walk(item)
      return
    }

    if (typeof node === 'object') {
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (value !== null && typeof value === 'object') {
          walk(value)
        } else if (isFilled(value)) {
          count += 1
          void key
        }
      }
      return
    }

    if (isFilled(node)) count += 1
  }

  walk(data)
  return count
}
