/**
 * update-member — edit a team member's name, role, or location scope.
 *
 * PUT /update-member
 * Body  { membership_id, full_name?, role?, location_id? }
 * Reply { updated: true }
 *
 * Requires caller to have super_admin in the target organisation.
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
      membership_id: string
      full_name?: string
      role?: string
      location_id?: string | null
    }
    const { membership_id, full_name, role, location_id } = body

    if (!membership_id) return err('membership_id is required')
    if (role !== undefined && !VALID_ROLES.has(role)) return err(`Unknown role: ${role}`)

    // Fetch the target membership to verify org and get user_id.
    const { data: mem } = await admin
      .from('memberships')
      .select('user_id, organisation_id')
      .eq('id', membership_id)
      .single()
    if (!mem) return err('Membership not found', 404)

    // Caller must be super_admin of the same org.
    const { data: callerMem } = await admin
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organisation_id', mem.organisation_id)
      .eq('role', 'super_admin')
      .limit(1)
      .single()
    if (!callerMem) return err('Only super_admin can edit members', 403)

    // Update profile full_name if provided (requires service-role — anon key cannot update others).
    if (full_name !== undefined) {
      const { error } = await admin
        .from('profiles')
        .update({ full_name: full_name.trim() })
        .eq('id', mem.user_id)
      if (error) return err(error.message, 400)
    }

    // Update membership fields if any were supplied.
    const memPatch: Record<string, unknown> = {}
    if (role !== undefined) memPatch.role = role
    if (location_id !== undefined) memPatch.location_id = location_id ?? null

    if (Object.keys(memPatch).length > 0) {
      const { error } = await admin
        .from('memberships')
        .update(memPatch)
        .eq('id', membership_id)
      if (error) return err(error.message, 400)
    }

    return json({ updated: true })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
