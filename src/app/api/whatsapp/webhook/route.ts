import { withSupabase } from '@supabase/server'
import {
  verifyWebhookSignature,
  verifyWebhookHandshake,
  getMediaUrl,
  downloadMedia,
  sendWhatsAppMessage,
} from '@/lib/whatsapp/meta'
import { transcribeAudio, parseOrderText, type ParsedOrder, type ParsedOrderItem } from '@/lib/whatsapp/ai'
import { normalizePhone, matchInventoryItem } from '@/lib/whatsapp/matching'

const VAT_RATE = 0.05
const round2 = (n: number) => Math.round(n * 100) / 100

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any

interface InventoryRow {
  id: string
  name: string
  sell_price: number | null
  unit: string
}

// ─── Meta webhook verification handshake ──────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (verifyWebhookHandshake(mode, token) && challenge) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// ─── Incoming messages ─────────────────────────────────────────────────────────

export const POST = withSupabase({ auth: 'none' }, async (req, ctx) => {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')
  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = JSON.parse(rawBody) as any
  const db: DB = ctx.supabaseAdmin

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? []
      for (const msg of messages) {
        try {
          await handleMessage(db, msg)
        } catch (err) {
          console.error('WhatsApp message handling failed', err)
        }
      }
    }
  }

  // Always 200 — Meta retries on non-2xx, and we've already logged/handled failures internally
  return Response.json({ ok: true })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleMessage(db: DB, msg: any) {
  const messageId: string = msg.id
  const from: string = msg.from

  const { data: existingLog } = await db.from('whatsapp_log').select('id').eq('message_id', messageId).maybeSingle()
  if (existingLog) return // Meta redelivered a message we've already processed

  const { data: restaurants } = await db.from('restaurants').select('id, name, whatsapp, primary_supplier_id')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restaurant = (restaurants ?? []).find((r: any) => normalizePhone(r.whatsapp) === normalizePhone(from))

  if (!restaurant) {
    await sendWhatsAppMessage(from, "You're not registered yet. Please contact your supplier to get set up.")
    return
  }

  const textBody: string | null = msg.type === 'text' ? (msg.text?.body ?? null) : null
  const command = textBody?.trim().toLowerCase()

  if (command === 'confirm' || command === 'cancel') {
    await handleConfirmOrCancel(db, restaurant, command === 'confirm')
    return
  }

  let transcript: string
  let type: 'Voice' | 'Text'
  try {
    if (msg.type === 'audio') {
      type = 'Voice'
      const mediaUrl = await getMediaUrl(msg.audio.id)
      const audioBytes = await downloadMedia(mediaUrl)
      transcript = await transcribeAudio(audioBytes)
    } else if (msg.type === 'text') {
      type = 'Text'
      transcript = textBody ?? ''
    } else {
      await sendWhatsAppMessage(from, "Sorry, I can only understand voice notes or typed orders.")
      return
    }
  } catch (err) {
    console.error('Media download/transcription failed', err)
    await sendWhatsAppMessage(from, "Couldn't access your voice note. Please resend, or type your order.")
    return
  }

  if (!transcript.trim()) {
    await sendWhatsAppMessage(from, "Sorry, I couldn't understand that. Please type your order.")
    await db.from('whatsapp_log').insert({
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      type,
      transcript: transcript || '(empty)',
      parsed: false,
      status: 'Failed',
      message_id: messageId,
    })
    return
  }

  let parsedOrder: ParsedOrder
  try {
    parsedOrder = await parseOrderText(transcript)
    if (parsedOrder.items.length === 0) throw new Error('No items parsed')
  } catch (err) {
    console.error('Order parsing failed', err)
    await sendWhatsAppMessage(from, "Couldn't parse your order. Please try again, or type it clearly.")
    await db.from('whatsapp_log').insert({
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      type,
      transcript,
      parsed: false,
      status: 'Failed',
      message_id: messageId,
    })
    return
  }

  await db.from('whatsapp_log').insert({
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
    type,
    transcript,
    parsed: true,
    status: 'Pending',
    parsed_items: parsedOrder.items,
    message_id: messageId,
  })

  await sendWhatsAppMessage(from, formatConfirmationMessage(parsedOrder))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleConfirmOrCancel(db: DB, restaurant: any, confirm: boolean) {
  const replyTo = normalizePhone(restaurant.whatsapp)

  const { data: pending } = await db
    .from('whatsapp_log')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('status', 'Pending')
    .is('order_id', null)
    .order('received_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!pending) {
    await sendWhatsAppMessage(replyTo, confirm ? 'No pending order to confirm.' : 'No pending order to cancel.')
    return
  }

  if (!confirm) {
    await db.from('whatsapp_log').update({ status: 'Cancelled' }).eq('id', pending.id)
    await sendWhatsAppMessage(replyTo, 'Order discarded.')
    return
  }

  const supplierId = restaurant.primary_supplier_id
  if (!supplierId) {
    await sendWhatsAppMessage(replyTo, "You're not linked to a supplier yet. Please contact support.")
    return
  }

  const { data: supplier } = await db.from('suppliers').select('id, business_name, whatsapp').eq('id', supplierId).single()
  const { data: inventory } = await db.from('inventory').select('id, name, sell_price, unit').eq('supplier_id', supplierId)

  const parsedItems = (pending.parsed_items ?? []) as ParsedOrderItem[]
  const orderItems = parsedItems.map((item, i) => {
    const match = matchInventoryItem<InventoryRow>(inventory ?? [], item.name)
    const qty = item.quantity ?? 1
    return {
      id: `item-${i}`,
      name: item.name,
      qty,
      unit: match?.unit ?? item.unit,
      notes: item.notes ?? undefined,
      itemId: match?.id,
      unitPrice: match?.sell_price ?? null,
    }
  })

  const subtotal = orderItems.reduce((s, i) => s + (i.unitPrice ?? 0) * i.qty, 0)
  const taxAmount = round2(subtotal * VAT_RATE)
  const amount = round2(subtotal + taxAmount)

  const { data: defaultAddress } = await db
    .from('restaurant_addresses')
    .select('label, address_line')
    .eq('restaurant_id', restaurant.id)
    .eq('is_default', true)
    .maybeSingle()

  const orderId = `DF-${Date.now().toString().slice(-5)}`
  const { error: orderErr } = await db.from('orders').insert({
    id: orderId,
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
    supplier_id: supplierId,
    supplier_name: supplier?.business_name ?? '',
    status: 'Pending',
    source: 'WhatsApp',
    amount,
    tax_amount: taxAmount,
    delivery_address: defaultAddress ? `${defaultAddress.label} — ${defaultAddress.address_line}` : null,
    items: orderItems,
    raw_transcript: pending.transcript,
    message_id: pending.message_id,
  })

  if (orderErr) {
    console.error('Failed to create order from WhatsApp confirm', orderErr)
    await sendWhatsAppMessage(replyTo, 'Something went wrong creating your order. Please try again or use the portal.')
    return
  }

  await db.from('whatsapp_log').update({ status: 'Confirmed', order_id: orderId }).eq('id', pending.id)

  await sendWhatsAppMessage(replyTo, `Order #${orderId} sent to ${supplier?.business_name ?? 'your supplier'}! You'll be notified once they confirm.`)

  if (supplier?.whatsapp) {
    await sendWhatsAppMessage(normalizePhone(supplier.whatsapp), formatSupplierMessage(orderId, restaurant.name, orderItems))
  }
}

function formatConfirmationMessage(parsed: ParsedOrder): string {
  const lines = ['✅ Order received:\n']
  for (const item of parsed.items) {
    const qty = item.quantity ?? '?'
    lines.push(`• ${item.name} — ${qty} ${item.unit}`)
  }
  if (parsed.deliveryNote) lines.push(`\n📅 ${parsed.deliveryNote}`)
  lines.push('\nReply CONFIRM to send, or CANCEL to discard.')
  return lines.join('\n')
}

function formatSupplierMessage(orderId: string, restaurantName: string, items: { name: string; qty: number; unit: string; notes?: string }[]): string {
  const lines = [`📦 New order #${orderId} from ${restaurantName}:\n`]
  for (const item of items) {
    const notes = item.notes ? ` (${item.notes})` : ''
    lines.push(`• ${item.name} — ${item.qty} ${item.unit}${notes}`)
  }
  return lines.join('\n')
}
