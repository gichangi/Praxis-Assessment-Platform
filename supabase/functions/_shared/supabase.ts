import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** Service-role client. Use only inside edge functions, never expose key to clients. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

/** Verify a Bearer JWT and return the authenticated user, or throw. */
export async function requireUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (!token) throw Object.assign(new Error('Missing Authorization header'), { status: 401 })
  const admin = adminClient()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) throw Object.assign(new Error('Invalid or expired token'), { status: 401 })
  return { user, token }
}

/** Return the first organisation_id the user belongs to, or throw. */
export async function requireOrg(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from('memberships')
    .select('organisation_id, role')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1)
    .single()
  if (error || !data) throw Object.assign(new Error('User has no organisation membership'), { status: 403 })
  return data
}
