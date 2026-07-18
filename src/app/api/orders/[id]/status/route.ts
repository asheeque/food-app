import { withSupabase } from '@supabase/server'

// PATCH /api/orders/[id]/status — supplier or admin updates order status
export const PATCH = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const id = req.url.split('/api/orders/')[1]?.split('/status')[0]
  if (!id) return Response.json({ error: 'Missing order id' }, { status: 400 })

  const { status } = await req.json()
  const allowed = ['Pending', 'Confirmed', 'Delivered', 'Cancelled']
  if (!allowed.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (ctx.supabase as any)
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
})
