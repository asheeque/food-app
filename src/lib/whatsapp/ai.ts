import OpenAI, { toFile } from 'openai'

let client: OpenAI | null = null
function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('Missing environment variable: OPENAI_API_KEY')
    client = new OpenAI({ apiKey })
  }
  return client
}

/** Transcribes a voice note (any of Arabic, English, Hindi, Malayalam — auto-detected) to text. */
export async function transcribeAudio(audio: Buffer, filename = 'audio.ogg'): Promise<string> {
  const file = await toFile(audio, filename)
  const transcript = await getClient().audio.transcriptions.create({
    model: 'whisper-1',
    file,
  })
  return transcript.text.trim()
}

export interface ParsedOrderItem {
  name: string
  quantity: number | null
  unit: string
  notes: string | null
}

export interface ParsedOrder {
  items: ParsedOrderItem[]
  deliveryNote: string | null
  rawLanguage: string | null
}

const SYSTEM_PROMPT = `You are an order parsing assistant for a restaurant supply ordering system in Dubai.

Extract the ordered items from the message below. The message may be in Arabic, English, Hindi, Malayalam, or a mix.

Return JSON only, in this exact format:
{
  "items": [
    {"name": "item name in English", "quantity": <number or null>, "unit": "kg/box/piece/litre/bag/etc", "notes": "optional string or null"}
  ],
  "delivery_note": "any delivery time or date mentioned, or null",
  "raw_language": "detected language(s), or null"
}

Rules:
- Always normalize item names to English.
- If quantity is unclear, set quantity to null and mention it in notes.
- If unit is unclear, use the most common unit for that item.
- Do not invent items not mentioned.
- Return ONLY the JSON object, no other text.`

/** Parses a raw transcript (any language/mix) into a structured order via GPT-4o. */
export async function parseOrderText(transcript: string): Promise<ParsedOrder> {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: transcript },
    ],
  })

  const raw = response.choices[0]?.message?.content
  if (!raw) throw new Error('Empty response from order parser')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(raw) as any
  if (!Array.isArray(parsed.items)) throw new Error('Parser response missing items array')

  return {
    items: parsed.items.map((i: { name: string; quantity: number | null; unit: string; notes?: string | null }) => ({
      name: i.name,
      quantity: i.quantity ?? null,
      unit: i.unit,
      notes: i.notes ?? null,
    })),
    deliveryNote: parsed.delivery_note ?? null,
    rawLanguage: parsed.raw_language ?? null,
  }
}
