'use client'

import { useWhatsAppLog } from '@/hooks/useWhatsAppLog'
import { formatDateTime } from '@/lib/utils'
import { useState } from 'react'

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  Confirmed: { bg: 'rgba(29,58,80,0.08)',   text: '#1D3A50', dot: '#1D3A50' },
  Pending:   { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

export default function WhatsAppLogPage() {
  const { data: messages } = useWhatsAppLog()
  const [search, setSearch] = useState('')

  const INTEGRATIONS = [
    { label: 'Webhook',       value: 'Pending setup', ok: false },
    { label: 'Phone number',  value: 'Not configured', ok: false },
    { label: 'Whisper (STT)', value: 'Pending setup', ok: false },
    { label: 'GPT-4o',        value: 'Pending setup', ok: false },
    { label: 'Total',         value: `${messages.length} messages`, ok: true },
  ]

  const filtered = messages.filter((m) =>
    m.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
    m.transcriptPreview.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 font-sans">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>
          Integrations
        </p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          WhatsApp Log
        </h1>
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {INTEGRATIONS.map(({ label, value, ok }) => (
          <div key={label} className="rounded-xl px-4 py-3 bg-white flex flex-col gap-1" style={{ border: '1px solid #E5E7EB' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>{label}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ok ? '#2D6A4F' : '#EF4444' }} />
              <span className="text-xs font-semibold truncate" style={{ color: '#111827' }}>{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search messages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white"
          style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }}
        />
      </div>

      {/* Log table */}
      <section aria-label="WhatsApp message log">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Time', 'Restaurant', 'Type', 'Transcript', 'Parsed', 'Status', 'Order'].map((col) => (
                  <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>
                    No messages match your search.
                  </td>
                </tr>
              ) : filtered.map((msg, idx) => {
                const s = STATUS_STYLE[msg.status] ?? STATUS_STYLE.Pending
                return (
                  <tr
                    key={msg.id}
                    className="hover:bg-[#F9FAFB] transition-colors"
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9',
                      borderTop: '1px solid #E5E7EB',
                    }}
                  >
                    <td className="py-3.5 px-5 text-xs whitespace-nowrap" style={{ color: '#6B7280' }}>
                      {formatDateTime(msg.receivedAt)}
                    </td>
                    <td className="py-3.5 px-5 font-medium" style={{ color: '#111827' }}>
                      {msg.restaurantName}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: msg.type === 'Voice' ? 'rgba(29,58,80,0.08)' : 'rgba(201,148,62,0.10)',
                          color: msg.type === 'Voice' ? '#1D3A50' : '#92400E',
                        }}
                      >
                        {msg.type === 'Voice' ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        )}
                        {msg.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-[260px]">
                      <p className="text-xs truncate" style={{ color: '#374151' }}>
                        &ldquo;{msg.transcriptPreview}&rdquo;
                      </p>
                    </td>
                    <td className="py-3.5 px-5">
                      {msg.parsed ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" aria-label="Parsed">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-semibold" style={{ color: '#1D3A50' }}>
                      {msg.orderId ? `#${msg.orderId}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs" style={{ color: '#9CA3AF' }}>
          Showing {filtered.length} of {messages.length} messages
        </p>
      </section>
    </div>
  )
}
