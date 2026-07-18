// Reports whether each WhatsApp/AI env var is configured — booleans only, never the secrets themselves.
export async function GET() {
  return Response.json({
    webhookConfigured: !!process.env.META_VERIFY_TOKEN && !!process.env.META_APP_SECRET,
    phoneNumberConfigured: !!process.env.META_PHONE_NUMBER_ID && !!process.env.META_WHATSAPP_TOKEN,
    openaiConfigured: !!process.env.OPENAI_API_KEY,
  })
}
