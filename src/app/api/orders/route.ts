import { withSupabase } from '@supabase/server'

// GET /api/orders — list orders (filtered by role via RLS)
export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const supplierId = searchParams.get('supplier_id')
  const restaurantId = searchParams.get('restaurant_id')

  let q = ctx.supabase.from('orders').select('*')
  if (status) q = q.eq('status', status)
  if (supplierId) q = q.eq('supplier_id', supplierId)
  if (restaurantId) q = q.eq('restaurant_id', restaurantId)

  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
})

// POST /api/orders — restaurant places a portal order
export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const body = await req.json()
  const { restaurant_id, restaurant_name, supplier_id, supplier_name, items, notes } = body

  if (!restaurant_id || !supplier_id || !items?.length) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const id = `DF-${Date.now().toString().slice(-4)}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (ctx.supabase as any).from('orders').insert({
    id,
    restaurant_id,
    restaurant_name,
    supplier_id,
    supplier_name,
    items,
    source: 'Portal',
    status: 'Pending',
    raw_transcript: notes ?? null,
  }).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
})
