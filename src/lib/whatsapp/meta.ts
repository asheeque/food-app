import crypto from 'crypto'

const GRAPH_API_VERSION = 'v21.0'

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

/** Verifies Meta's X-Hub-Signature-256 header against the raw request body. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  const expected = crypto.createHmac('sha256', env('META_APP_SECRET')).update(rawBody, 'utf8').digest('hex')
  const expectedHeader = `sha256=${expected}`
  const a = Buffer.from(expectedHeader)
  const b = Buffer.from(signatureHeader)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

/** Meta's verify-token handshake for GET /webhook. */
export function verifyWebhookHandshake(mode: string | null, token: string | null): boolean {
  return mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN
}

/** Resolves a WhatsApp media id to its short-lived download URL. */
export async function getMediaUrl(mediaId: string): Promise<string> {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${mediaId}`, {
    headers: { Authorization: `Bearer ${env('META_WHATSAPP_TOKEN')}` },
  })
  if (!res.ok) throw new Error(`Failed to resolve media url (${res.status})`)
  const data = (await res.json()) as { url?: string }
  if (!data.url) throw new Error('Media url missing from Meta response')
  return data.url
}

/** Downloads media bytes from a Meta-provided URL (requires the same bearer token). */
export async function downloadMedia(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env('META_WHATSAPP_TOKEN')}` } })
  if (!res.ok) throw new Error(`Failed to download media (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

/** Sends a plain-text WhatsApp message to a phone number via the Cloud API. */
export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${env('META_PHONE_NUMBER_ID')}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('META_WHATSAPP_TOKEN')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to send WhatsApp message (${res.status}): ${body}`)
  }
}
