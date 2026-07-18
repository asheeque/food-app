/** Strips everything but digits so "+971 50 123 4567" and "971501234567" compare equal. */
export function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? '').replace(/\D/g, '')
}

interface NamedItem {
  name: string
}

/** Best-effort match of a free-text (AI-parsed) item name against a supplier's inventory, by exact then substring match. */
export function matchInventoryItem<T extends NamedItem>(items: T[], name: string): T | null {
  const needle = name.trim().toLowerCase()
  if (!needle) return null
  const exact = items.find((i) => i.name.trim().toLowerCase() === needle)
  if (exact) return exact
  const partial = items.find((i) => {
    const hay = i.name.trim().toLowerCase()
    return hay.includes(needle) || needle.includes(hay)
  })
  return partial ?? null
}
