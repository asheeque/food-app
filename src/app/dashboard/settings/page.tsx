'use client'

import { useState } from 'react'

const NAV_TABS = ['General', 'Notifications', 'Integrations', 'WhatsApp API', 'Users & Roles', 'Billing', 'Security']

const INTEGRATIONS = [
  { name: 'WhatsApp Business API', desc: 'Receive and parse orders via WhatsApp messages', status: 'Connected',     ok: true  },
  { name: 'OpenAI Whisper',        desc: 'Speech-to-text transcription for voice orders',  status: 'Connected',     ok: true  },
  { name: 'GPT-4o',                desc: 'AI order parsing and intent extraction',          status: 'Connected',     ok: true  },
  { name: 'Supabase',              desc: 'Database, auth and realtime subscriptions',       status: 'Connected',     ok: true  },
  { name: 'SMS Gateway',           desc: 'Fallback SMS notifications for order updates',    status: 'Inactive',      ok: false },
  { name: 'Payment Gateway',       desc: 'Invoice generation and payment collection',       status: 'Pending setup', ok: null  },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Integrations')

  return (
    <div className="flex flex-col gap-8 font-sans">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>
          Settings
        </p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          Settings
        </h1>
      </div>

      <div className="flex gap-8 items-start">

        {/* Left nav */}
        <nav className="shrink-0 w-44 flex flex-col gap-0.5" aria-label="Settings sections">
          {NAV_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTab === tab ? 'rgba(29,58,80,0.08)' : 'transparent',
                color: activeTab === tab ? '#1D3A50' : '#6B7280',
                fontWeight: activeTab === tab ? 600 : 400,
                borderLeft: activeTab === tab ? '3px solid #C9943E' : '3px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          {activeTab === 'Integrations' ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold mb-1" style={{ color: '#111827' }}>Integrations</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>Manage connected services and APIs powering Deira Fresh.</p>
              </div>

              {/* Integration cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {INTEGRATIONS.map(({ name, desc, status, ok }) => (
                  <div key={name} className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>{name}</p>
                      <span
                        className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: ok === true ? 'rgba(74,124,92,0.10)' : ok === false ? 'rgba(156,163,175,0.15)' : 'rgba(245,158,11,0.10)',
                          color: ok === true ? '#2D6A4F' : ok === false ? '#6B7280' : '#92400E',
                        }}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{desc}</p>
                    <button
                      className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#F3F4F6] transition-colors"
                      style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }}
                      type="button"
                    >
                      {ok ? 'Configure' : 'Set up'}
                    </button>
                  </div>
                ))}
              </div>

              {/* API Keys */}
              <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>API Keys</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#6B7280' }}>
                      Live API Key
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value="df_live_••••••••••••••••••••••••••••••"
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono"
                        style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#374151' }}
                      />
                      <button
                        className="px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity text-white"
                        style={{ backgroundColor: '#1D3A50' }}
                        type="button"
                      >
                        Reveal
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#6B7280' }}>
                      Webhook URL
                    </label>
                    <input
                      readOnly
                      value="https://api.deirafresh.ae/webhook/whatsapp"
                      className="w-full px-4 py-2.5 rounded-lg text-sm font-mono"
                      style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#374151' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-10 text-center bg-white" style={{ border: '1px solid #E5E7EB' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#111827' }}>{activeTab}</p>
              <p className="text-sm" style={{ color: '#6B7280' }}>Coming soon.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
