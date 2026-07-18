import { withSupabase } from '@supabase/server'

export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const supplierId = searchParams.get('supplier_id')

  let q = ctx.supabase.from('inventory').select('*')
  if (supplierId) q = q.eq('supplier_id', supplierId)

  const { data, error } = await q.order('name')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
})

export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const body = await req.json()
  const { data, error } = await ctx.supabase.from('inventory').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
})

// PATCH /api/inventory?id=... — update stock quantity
export const PATCH = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  const body = await req.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (ctx.supabase as any)
    .from('inventory')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
})
