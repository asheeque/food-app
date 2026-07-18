import { withSupabase } from '@supabase/server'

// GET /api/profile — returns the authenticated user's profile row
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
