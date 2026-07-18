'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { authedFetch } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = 'admin' | 'supplier' | 'restaurant'

interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole | null
  entityId: string | null
  createdAt: string
  lastSignIn: string | null
}

interface EntityOption { id: string; name: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      onClick={copy}
      type="button"
      className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
      style={{
        border: '1px solid #E5E7EB',
        color: copied ? '#2D6A4F' : '#1D3A50',
        backgroundColor: copied ? 'rgba(74,124,92,0.08)' : '#F9FAFB',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className="w-2 h-2 rounded-full shrink-0 inline-block"
      style={{ backgroundColor: ok ? '#2D6A4F' : '#9CA3AF' }}
    />
  )
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
      {title && <h2 className="text-sm font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: '#1D3A50' }}>{title}</h2>}
      {children}
    </div>
  )
}

const inputCls   = 'w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors'
const inputStyle = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }

// ─── General tab ─────────────────────────────────────────────────────────────

function GeneralTab() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [err, setErr]         = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? '')
    })
    authedFetch('/api/profile').then((r) => r.json()).then((d) => {
      if (d.name) setName(d.name)
    })
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      const session = (await supabase.auth.getSession()).data.session
      const token = session?.access_token
      const r = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5 max-w-xl">
      {err && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B', border: '1px solid rgba(239,68,68,0.2)' }}>
          {err}
        </div>
      )}
      <SectionCard title="Profile">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Display name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className={inputCls}
              style={{ ...inputStyle, color: '#6B7280', cursor: 'not-allowed' }}
            />
            <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>Email is managed by Supabase Auth and cannot be changed here.</p>
          </div>
        </div>
      </SectionCard>
      <button
        type="submit"
        disabled={saving}
        className="self-start px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#1D3A50' }}
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
      </button>
    </form>
  )
}

// ─── Security tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<{ text: string; ok: boolean } | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.next !== form.confirm) {
      setMsg({ text: 'New passwords do not match.', ok: false })
      return
    }
    if (form.next.length < 8) {
      setMsg({ text: 'Password must be at least 8 characters.', ok: false })
      return
    }
    setSaving(true)
    setMsg(null)
    // Re-authenticate with current password first
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email
    if (!email) { setSaving(false); setMsg({ text: 'Not authenticated.', ok: false }); return }

    const { error: reAuthErr } = await supabase.auth.signInWithPassword({ email, password: form.current })
    if (reAuthErr) {
      setSaving(false)
      setMsg({ text: 'Current password is incorrect.', ok: false })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: form.next })
    setSaving(false)
    if (error) {
      setMsg({ text: error.message, ok: false })
    } else {
      setMsg({ text: 'Password updated successfully.', ok: true })
      setForm({ current: '', next: '', confirm: '' })
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5 max-w-xl">
      {msg && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: msg.ok ? 'rgba(74,124,92,0.08)' : 'rgba(239,68,68,0.08)',
            color: msg.ok ? '#2D6A4F' : '#991B1B',
            border: `1px solid ${msg.ok ? 'rgba(74,124,92,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          {msg.text}
        </div>
      )}
      <SectionCard title="Change password">
        <div className="flex flex-col gap-4">
          {(['current', 'next', 'confirm'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                {field === 'current' ? 'Current password' : field === 'next' ? 'New password' : 'Confirm new password'}
              </label>
              <input
                type="password"
                value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                className={inputCls}
                style={inputStyle}
                placeholder="••••••••"
                autoComplete={field === 'current' ? 'current-password' : 'new-password'}
              />
            </div>
          ))}
        </div>
      </SectionCard>
      <button
        type="submit"
        disabled={saving || !form.current || !form.next || !form.confirm}
        className="self-start px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#1D3A50' }}
      >
        {saving ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}

// ─── WhatsApp API tab ────────────────────────────────────────────────────────

function WhatsAppAPITab() {
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-domain.com'
  const webhookUrl = `${appUrl}/api/webhook/whatsapp`

  const fields = [
    { label: 'Webhook URL',    value: webhookUrl,       hint: 'Paste this into Meta → WhatsApp → Configuration → Webhook URL' },
    { label: 'Webhook verify token', value: '(set META_VERIFY_TOKEN in .env)', hint: 'Must match the value you enter in Meta dashboard' },
    { label: 'Phone number ID', value: '(set META_PHONE_NUMBER_ID in .env)', hint: 'From Meta → WhatsApp → Phone numbers' },
  ]

  const envStatus = [
    { label: 'META_WHATSAPP_TOKEN',    configured: false },
    { label: 'META_PHONE_NUMBER_ID',   configured: false },
    { label: 'META_VERIFY_TOKEN',      configured: false },
    { label: 'META_APP_SECRET',        configured: false },
    { label: 'OPENAI_API_KEY',         configured: false },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <SectionCard title="Webhook config">
        <div className="flex flex-col gap-5">
          {fields.map(({ label, value, hint }) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: '#6B7280' }}>{label}</p>
              <div className="flex items-center gap-2">
                <input readOnly value={value} className={inputCls + ' font-mono text-xs'} style={inputStyle} />
                {value.startsWith('http') && <CopyButton value={value} />}
              </div>
              <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>{hint}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Environment variables">
        <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
          These must be set in your <span className="font-mono">.env.local</span> file before the WhatsApp pipeline will work.
        </p>
        <div className="flex flex-col gap-2">
          {envStatus.map(({ label, configured }) => (
            <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <span className="font-mono text-xs" style={{ color: '#374151' }}>{label}</span>
              <div className="flex items-center gap-1.5">
                <StatusDot ok={configured} />
                <span className="text-xs font-semibold" style={{ color: configured ? '#2D6A4F' : '#9CA3AF' }}>
                  {configured ? 'Set' : 'Not set'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs" style={{ color: '#9CA3AF' }}>
          Status is shown as &quot;Not set&quot; because env variables are not exposed to the browser. Check your .env.local to confirm.
        </p>
      </SectionCard>
    </div>
  )
}

// ─── Users & Roles tab ───────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', supplier: 'Supplier', restaurant: 'Restaurant' }
const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  admin:      { bg: 'rgba(29,58,80,0.08)',    text: '#1D3A50' },
  supplier:   { bg: 'rgba(201,148,62,0.10)',  text: '#92400E' },
  restaurant: { bg: 'rgba(74,124,92,0.10)',   text: '#2D6A4F' },
}

function UsersTab() {
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [invite, setInvite] = useState({ email: '', name: '', role: 'restaurant' as UserRole, entityId: '' })
  const [entities, setEntities] = useState<EntityOption[]>([])
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const r = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
    const d = await r.json()
    setUsers(Array.isArray(d) ? d : [])
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  useEffect(() => {
    if (!showInvite) return
    const table = invite.role === 'supplier' ? 'suppliers' : 'restaurants'
    const col   = invite.role === 'supplier' ? 'business_name' : 'name'
    supabase.from(table).select(`id, ${col}`).then(({ data }) => {
      setEntities((data ?? []).map((r: Record<string, string>) => ({ id: r.id, name: r[col] })))
    })
  }, [invite.role, showInvite])

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invite.email || !invite.role) return
    if (invite.role !== 'admin' && !invite.entityId) {
      setInviteMsg({ text: 'Please select a restaurant or supplier.', ok: false })
      return
    }
    setInviting(true)
    setInviteMsg(null)
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const r = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        email: invite.email,
        name: invite.name || invite.email,
        role: invite.role,
        entityId: invite.role === 'admin' ? null : invite.entityId,
      }),
    })
    const d = await r.json()
    setInviting(false)
    if (!r.ok) {
      setInviteMsg({ text: d.error ?? 'Invite failed.', ok: false })
    } else {
      setInviteMsg({ text: `Invite sent to ${invite.email}`, ok: true })
      setInvite({ email: '', name: '', role: 'restaurant', entityId: '' })
      loadUsers()
    }
  }

  const removeUser = async (id: string) => {
    if (!confirm('Remove this user? They will lose access immediately.')) return
    setDeleting(id)
    const token = (await supabase.auth.getSession()).data.session?.access_token
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setDeleting(null)
    loadUsers()
  }

  return (
    <div className="flex flex-col gap-5">

      {/* User list */}
      <SectionCard title="Team members">
        {loading ? (
          <p className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>No users found.</p>
        ) : (
          <div className="flex flex-col gap-0">
            {users.map((u, idx) => {
              const color = u.role ? (ROLE_COLOR[u.role] ?? ROLE_COLOR.admin) : { bg: '#F3F4F6', text: '#6B7280' }
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-4 py-3"
                  style={{ borderTop: idx > 0 ? '1px solid #F3F4F6' : 'none' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: 'rgba(29,58,80,0.08)', color: '#1D3A50' }}
                  >
                    {(u.name?.[0] ?? u.email[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{u.name || u.email}</p>
                    <p className="text-xs truncate" style={{ color: '#6B7280' }}>{u.email}</p>
                  </div>
                  {u.role && (
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: color.bg, color: color.text }}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  )}
                  <button
                    onClick={() => removeUser(u.id)}
                    disabled={deleting === u.id}
                    type="button"
                    className="shrink-0 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Remove user"
                  >
                    {deleting === u.id ? (
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>…</span>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => { setShowInvite((p) => !p); setInviteMsg(null) }}
          className="mt-5 flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: '#1D3A50' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Invite user
        </button>
      </SectionCard>

      {/* Invite form */}
      {showInvite && (
        <SectionCard title="Invite new user">
          {inviteMsg && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: inviteMsg.ok ? 'rgba(74,124,92,0.08)' : 'rgba(239,68,68,0.08)',
                color: inviteMsg.ok ? '#2D6A4F' : '#991B1B',
                border: `1px solid ${inviteMsg.ok ? 'rgba(74,124,92,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              {inviteMsg.text}
            </div>
          )}
          <form onSubmit={sendInvite} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Email *</label>
                <input
                  type="email"
                  required
                  value={invite.email}
                  onChange={(e) => setInvite((p) => ({ ...p, email: e.target.value }))}
                  placeholder="user@example.ae"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Name</label>
                <input
                  type="text"
                  value={invite.name}
                  onChange={(e) => setInvite((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Full name"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Role *</label>
                <select
                  value={invite.role}
                  onChange={(e) => setInvite((p) => ({ ...p, role: e.target.value as UserRole, entityId: '' }))}
                  className={inputCls + ' appearance-none'}
                  style={inputStyle}
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="supplier">Supplier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {invite.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                    {invite.role === 'supplier' ? 'Supplier' : 'Restaurant'} *
                  </label>
                  <select
                    value={invite.entityId}
                    onChange={(e) => setInvite((p) => ({ ...p, entityId: e.target.value }))}
                    className={inputCls + ' appearance-none'}
                    style={inputStyle}
                  >
                    <option value="">Select…</option>
                    {entities.map(({ id, name }) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={inviting}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#1D3A50' }}
              >
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[#F3F4F6]"
                style={{ color: '#6B7280' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}
    </div>
  )
}

// ─── Integrations tab (existing + functional API key reveal) ─────────────────

const INTEGRATIONS = [
  { name: 'WhatsApp Business API', desc: 'Receive and parse orders via WhatsApp messages', status: 'Connected',     ok: true  },
  { name: 'OpenAI Whisper',        desc: 'Speech-to-text transcription for voice orders',  status: 'Connected',     ok: true  },
  { name: 'GPT-4o',                desc: 'AI order parsing and intent extraction',          status: 'Connected',     ok: true  },
  { name: 'Supabase',              desc: 'Database, auth and realtime subscriptions',       status: 'Connected',     ok: true  },
  { name: 'SMS Gateway',           desc: 'Fallback SMS notifications for order updates',    status: 'Inactive',      ok: false },
  { name: 'Payment Gateway',       desc: 'Invoice generation and payment collection',       status: 'Pending setup', ok: null  },
] as const

function IntegrationsTab() {
  const [revealed, setRevealed] = useState(false)
  const maskedKey  = 'df_live_••••••••••••••••••••••••••••••'
  const revealedKey = 'df_live_demo_key_not_yet_configured'
  const webhookUrl  = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-domain.com'}/api/webhook/whatsapp`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold mb-1" style={{ color: '#111827' }}>Integrations</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>Manage connected services and APIs powering Deira Fresh.</p>
      </div>

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
                value={revealed ? revealedKey : maskedKey}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono"
                style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#374151' }}
              />
              <button
                onClick={() => setRevealed((p) => !p)}
                className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity text-white"
                style={{ backgroundColor: '#1D3A50' }}
                type="button"
              >
                {revealed ? 'Hide' : 'Reveal'}
              </button>
              {revealed && <CopyButton value={revealedKey} />}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#6B7280' }}>
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={webhookUrl}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono"
                style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#374151' }}
              />
              <CopyButton value={webhookUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const NAV_TABS = ['General', 'Users & Roles', 'WhatsApp API', 'Integrations', 'Security', 'Notifications', 'Billing'] as const
type Tab = typeof NAV_TABS[number]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('General')

  const renderTab = () => {
    switch (activeTab) {
      case 'General':       return <GeneralTab />
      case 'Users & Roles': return <UsersTab />
      case 'WhatsApp API':  return <WhatsAppAPITab />
      case 'Security':      return <SecurityTab />
      case 'Integrations':  return <IntegrationsTab />
      default:
        return (
          <div className="rounded-xl p-10 text-center bg-white" style={{ border: '1px solid #E5E7EB' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#111827' }}>{activeTab}</p>
            <p className="text-sm" style={{ color: '#6B7280' }}>Coming soon.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Settings</p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          Settings
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
        <nav
          className="flex flex-row md:flex-col gap-1 md:gap-0.5 overflow-x-auto md:overflow-visible w-full md:w-[11rem] shrink-0"
          aria-label="Settings sections"
        >
          {NAV_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className="text-left px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap shrink-0"
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

        <div className="flex-1 min-w-0 w-full">
          {renderTab()}
        </div>
      </div>
    </div>
  )
}
