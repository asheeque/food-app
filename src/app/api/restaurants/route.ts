import { withSupabase } from '@supabase/server'

export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const id         = searchParams.get('id')
  const supplierId = searchParams.get('supplier_id')
  const activeOnly = searchParams.get('active') === 'true'

  // Single record lookup
  if (id) {
    const { data, error } = await ctx.supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  }

  // List — use admin to bypass RLS so supplier/admin users can see all restaurants
  let q = ctx.supabaseAdmin.from('restaurants').select('*')
  if (supplierId) q = q.eq('primary_supplier_id', supplierId)
  if (activeOnly) q = q.eq('active', true)

  const { data, error } = await q.order('name')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
})

export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const body = await req.json()
  const { data, error } = await ctx.supabaseAdmin.from('restaurants').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
})
