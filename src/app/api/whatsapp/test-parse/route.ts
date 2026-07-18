import { parseOrderText } from '@/lib/whatsapp/ai'

// DEV-ONLY: exercises the GPT-4o order parser directly, without needing the WhatsApp webhook.
// Unauthenticated and calls a paid OpenAI endpoint — remove or auth-gate before deploying publicly.
export async function POST(req: Request) {
  const { text } = await req.json()
  if (!text) return Response.json({ error: 'Missing "text" in request body' }, { status: 400 })

  try {
    const parsed = await parseOrderText(text)
    return Response.json(parsed)
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
