import { withSupabase } from '@supabase/server'

type Profile = { id: string; role: string; entity_id: string | null; name: string }

export const GET = withSupabase({ auth: 'user' }, async (_req, ctx) => {
  const { data: { users }, error } = await ctx.supabaseAdmin.auth.admin.listUsers()
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: profiles } = await ctx.supabase
    .from('profiles')
    .select('id, role, entity_id, name')

  const profileMap = new Map<string, Profile>((profiles ?? []).map((p: Profile) => [p.id, p]))

  const result = users.map((u) => {
    const p = profileMap.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      name: p?.name ?? u.email ?? '',
      role: p?.role ?? null,
      entityId: p?.entity_id ?? null,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
    }
  })

  return Response.json(result)
})

export const DELETE = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
})
