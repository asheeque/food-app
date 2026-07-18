import { createClient } from '@supabase/supabase-js'

// Public endpoint — no withSupabase wrapper (user is not yet logged in)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  const body = await req.json()
  const { role, email, password, name, ...rest } = body as {
    role: 'supplier' | 'restaurant'
    email: string
    password: string
    name: string
    [key: string]: unknown
  }

  if (!email || !password || !role || !name) {
    return Response.json({ error: 'email, password, role, and name are required' }, { status: 400 })
  }

  // 1. Create the entity record first so we have an ID
  let entityId: string
  if (role === 'supplier') {
    const { data, error } = await supabaseAdmin.from('suppliers').insert({
      business_name:     name,
      email,
      whatsapp:          (rest.whatsapp as string) ?? '',
      warehouse_address: (rest.warehouseAddress as string) ?? '',
      categories:        (rest.categories as string[]) ?? [],
      trade_license:     (rest.tradeLicense as string) ?? null,
      trn:               (rest.trn as string) ?? null,
      active:            true,
    }).select('id').single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    entityId = (data as { id: string }).id
  } else {
    const { data, error } = await supabaseAdmin.from('restaurants').insert({
      name,
      email,
      contact:           (rest.contact as string) ?? name,
      whatsapp:          (rest.whatsapp as string) ?? '',
      zone:              (rest.zone as string) ?? 'Deira',
      cuisine_type:      (rest.cuisineType as string) ?? '',
      preferred_time:    (rest.preferredTime as string) ?? '',
      brand_group:       (rest.brandGroup as string) ?? null,
      active:            true,
    }).select('id').single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    entityId = (data as { id: string }).id
  }

  // 2. Create the auth user (auto-confirmed — no email verification step)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, entity_id: entityId, name },
  })

  if (authError) {
    // Roll back entity row on auth failure
    if (role === 'supplier') {
      await supabaseAdmin.from('suppliers').delete().eq('id', entityId)
    } else {
      await supabaseAdmin.from('restaurants').delete().eq('id', entityId)
    }
    return Response.json({ error: authError.message }, { status: 500 })
  }

  // 3. Create profile row immediately (don't rely on DB trigger being in place)
  if (authData?.user) {
    await supabaseAdmin.from('profiles').insert({
      id:        authData.user.id,
      role,
      entity_id: entityId,
      name,
    })
    // Ignore insert errors — trigger may have already created the row
  }

  return Response.json({ ok: true })
}
