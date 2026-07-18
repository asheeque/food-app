import { withSupabase } from '@supabase/server'

export const GET = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const id         = searchParams.get('id')
  const activeOnly = searchParams.get('active') === 'true'
  const suppId     = searchParams.get('supplier_id')

  // Single record lookup
  if (id) {
    const { data, error } = await ctx.supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json(data)
  }

  // List — use admin to bypass RLS so restaurant users can see all suppliers
  let q = ctx.supabaseAdmin.from('suppliers').select('*')
  if (activeOnly) q = q.eq('active', true)
  if (suppId)     q = q.eq('id', suppId)

  const { data, error } = await q.order('business_name')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
})

export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const body = await req.json()
  const { data, error } = await ctx.supabaseAdmin.from('suppliers').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
})
