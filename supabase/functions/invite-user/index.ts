/**
 * invite-user — create an auth user and assign them an org role.
 *
 * POST /invite-user
 * Body  { email, full_name, organisation_id, role, location_id? }
 * Reply { user_id, invited: true }
 *
 * Requires caller to have super_admin in the target organisation.
 * Uses inviteUserByEmail so Supabase sends the magic-link invite email.
 */

import { options, json, err } from '../_shared/cors.ts'
import { adminClient, requireUser } from '../_shared/supabase.ts'

const VALID_ROLES = new Set(['super_admin', 'form_editor', 'translator', 'manager', 'assessor', 'viewer'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return options()

  try {
    const { user } = await requireUser(req)
    const admin = adminClient()

    const body = await req.json() as {
      email: string
      full_name: string
      organisation_id: string
      role: string
      location_id?: string
      password?: string
    }
    const { email, full_name, organisation_id, role, location_id, password } = body

    if (!email || !organisation_id || !role)
      return err('email, organisation_id, and role are required')
    if (!VALID_ROLES.has(role)) return err(`Unknown role: ${role}`)
    if (password !== undefined && password.length < 8)
      return err('Password must be at least 8 characters')

    // Caller must be super_admin of the target org.
    const { data: callerMem } = await admin
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organisation_id', organisation_id)
      .eq('role', 'super_admin')
      .limit(1)
      .single()
    if (!callerMem) return err('Only super_admin can invite users', 403)

    // Validate location_id belongs to the org if provided.
    if (location_id) {
      const { data: loc } = await admin
        .from('locations')
        .select('id')
        .eq('id', location_id)
        .eq('organisation_id', organisation_id)
        .single()
      if (!loc) return err('location_id does not belong to this organisation', 400)
    }

    // Create the auth user — either with a set password or via magic-link invite.
    let userId: string
    if (password) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name ?? '' },
      })
      if (createErr) return err(createErr.message, 400)
      userId = created.user.id
    } else {
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: full_name ?? '' },
      })
      if (inviteErr) return err(inviteErr.message, 400)
      userId = invited.user.id
    }

    // Ensure the profile row exists (handle_new_user trigger may race).
    await admin.from('profiles').upsert(
      { id: userId, full_name: full_name ?? '' },
      { onConflict: 'id', ignoreDuplicates: true },
    )

    // Assign the membership.
    const { error: memErr } = await admin.from('memberships').insert({
      user_id: userId,
      organisation_id,
      role,
      location_id: location_id ?? null,
    })
    if (memErr) {
      // Roll back by deleting the auth user so we don't leave an orphan.
      await admin.auth.admin.deleteUser(userId)
      return err(memErr.message, 400)
    }

    return json({ user_id: userId, invited: !password, created: !!password })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
