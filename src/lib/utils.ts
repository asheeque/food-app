import { supabase } from '@/lib/supabase/client'

/** Fetch wrapper that attaches the current Supabase session token as Bearer auth. */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = (await supabase.auth.getSession()).data.session?.access_token
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

/** Format a number as AED currency. e.g. 2450 → "AED 2,450" */
export function formatAED(amount: number, compact = false): string {
  if (compact && amount >= 1_000_000) {
    return `AED ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (compact && amount >= 1_000) {
    return `AED ${(amount / 1_000).toFixed(1)}K`
  }
  return `AED ${amount.toLocaleString('en-AE')}`
}

/** Format an ISO string to a readable time. e.g. "2026-06-22T06:15:00Z" → "6:15 AM" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Format an ISO string to date + time. e.g. "Jun 22, 6:15 AM" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AE', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Return a human-relative time string. e.g. "2 hours ago" */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

/** Return width% string for bar charts (0–100 clamped) */
export function barWidth(value: number, max: number): string {
  return `${clamp((value / max) * 100, 2, 100).toFixed(1)}%`
}
