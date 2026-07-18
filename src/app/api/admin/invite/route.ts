import { withSupabase } from '@supabase/server'

export const POST = withSupabase({ auth: 'user' }, async (req, ctx) => {
  const { email, role, entityId, name } = await req.json()

  if (!email || !role || !entityId) {
    return Response.json({ error: 'email, role, and entityId are required' }, { status: 400 })
  }

  const { error } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { role, entity_id: entityId, name: name ?? email },
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
})
