/**
 * update-member — edit a team member's name, sign-in email, password, role, locations or status.
 *
 * PUT /update-member
 * Body  { membership_id, full_name?, email?, password?, role?, location_ids?, active? }
 *         location_ids: undefined = leave as is, null = every location, [ids] = just those.
 *         active: false deactivates (bans sign-in), true reactivates.
 * Reply { updated: true }
 *
 * A person with several locations has one membership row per location, all with the same
 * role. membership_id can be any one of them; the whole group is edited together.
 * Requires caller to have super_admin in the target organisation.
 */

import { options, json, err } from '../_shared/cors.ts'
import { adminClient, requireUser } from '../_shared/supabase.ts'
import { planMembershipChange } from '../_shared/membership_plan.ts'

const VALID_ROLES = new Set(['super_admin', 'form_editor', 'translator', 'manager', 'assessor', 'viewer'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return options()

  try {
    const { user } = await requireUser(req)
    const admin = adminClient()

    const body = await req.json() as {
      membership_id: string
      full_name?: string
      email?: string
      password?: string
      role?: string
      location_ids?: string[] | null
      active?: boolean
    }
    const { membership_id, full_name, email, password, role, location_ids, active } = body

    if (!membership_id) return err('membership_id is required')
    if (role !== undefined && !VALID_ROLES.has(role)) return err(`Unknown role: ${role}`)
    if (Array.isArray(location_ids) && location_ids.length === 0) return err('Choose at least one location')
    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return err('Enter a valid email address')
    if (password !== undefined && password.length < 8) return err('The password needs at least 8 characters')

    // Fetch the target membership to verify org and get user_id.
    const { data: mem } = await admin
      .from('memberships')
      .select('user_id, organisation_id, role')
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

    const oldRole = mem.role as string
    const newRole = role ?? oldRole

    // Never leave the organisation without an active super admin.
    const otherActiveSuperAdmins = async () => {
      const { count } = await admin
        .from('memberships')
        .select('id, profiles!inner(active)', { count: 'exact', head: true })
        .eq('organisation_id', mem.organisation_id)
        .eq('role', 'super_admin')
        .neq('user_id', mem.user_id)
        .eq('profiles.active', true)
      return count ?? 0
    }
    if (oldRole === 'super_admin' && newRole !== 'super_admin' && !(await otherActiveSuperAdmins())) {
      return err('Keep at least one super admin. Make someone else a super admin first.', 400)
    }
    if (active === false) {
      if (mem.user_id === user.id) return err('You can’t deactivate your own account', 400)
      const { data: theirAdmin } = await admin
        .from('memberships')
        .select('id')
        .eq('user_id', mem.user_id)
        .eq('organisation_id', mem.organisation_id)
        .eq('role', 'super_admin')
        .limit(1)
      if ((theirAdmin ?? []).length > 0 && !(await otherActiveSuperAdmins())) {
        return err('Keep at least one active super admin. Make someone else a super admin first.', 400)
      }
    }

    // Locations must belong to the same organisation.
    const wantedLocations = Array.isArray(location_ids) ? [...new Set(location_ids)] : []
    if (wantedLocations.length > 0) {
      const { data: found } = await admin
        .from('locations')
        .select('id')
        .eq('organisation_id', mem.organisation_id)
        .in('id', wantedLocations)
      if ((found ?? []).length !== wantedLocations.length) {
        return err('A location does not belong to this organisation', 400)
      }
    }

    // Sign-in details live on the auth user: email, password and the sign-in ban.
    const authUpdate: Record<string, unknown> = {}
    if (email !== undefined) {
      authUpdate.email = email.trim()
      authUpdate.email_confirm = true
    }
    if (password !== undefined) authUpdate.password = password
    if (active !== undefined) authUpdate.ban_duration = active ? 'none' : '876000h'
    if (Object.keys(authUpdate).length > 0) {
      const { error } = await admin.auth.admin.updateUserById(mem.user_id, authUpdate)
      if (error) return err(error.message, 400)
    }

    // Name and status on the profile.
    const profilePatch: Record<string, unknown> = {}
    if (full_name !== undefined) profilePatch.full_name = full_name.trim()
    if (active !== undefined) profilePatch.active = active
    if (Object.keys(profilePatch).length > 0) {
      const { error } = await admin.from('profiles').update(profilePatch).eq('id', mem.user_id)
      if (error) return err(error.message, 400)
    }

    // Role and locations.
    if (role !== undefined || location_ids !== undefined) {
      const { data: group } = await admin
        .from('memberships')
        .select('id, location_id')
        .eq('user_id', mem.user_id)
        .eq('organisation_id', mem.organisation_id)
        .eq('role', oldRole)

      const plan = planMembershipChange({
        current: group ?? [],
        oldRole,
        newRole,
        desired: location_ids === undefined ? undefined : location_ids === null ? [null] : wantedLocations,
      })

      if (plan.insert.length > 0) {
        const { error } = await admin.from('memberships').upsert(
          plan.insert.map((location_id) => ({
            user_id: mem.user_id,
            organisation_id: mem.organisation_id,
            role: newRole,
            location_id,
          })),
          { onConflict: 'user_id,organisation_id,role,location_id', ignoreDuplicates: true },
        )
        if (error) return err(error.message, 400)
      }
      if (plan.deleteIds.length > 0) {
        const { error } = await admin.from('memberships').delete().in('id', plan.deleteIds)
        if (error) return err(error.message, 400)
      }
    }

    return json({ updated: true })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
