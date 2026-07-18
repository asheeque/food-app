import { withSupabase } from '@supabase/server'

export const GET = withSupabase({ auth: 'user' }, async (_req, ctx) => {
  const userId = ctx.userClaims?.id
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await ctx.supabase
    .from('profiles')
    .select('role, entity_id, name')
    .eq('id', userId)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
})

export const PATCH = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const userId = ctx.userClaims?.id
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (ctx.supabase as any)
    .from('profiles')
    .update({ name: name.trim() })
    .eq('id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
})
