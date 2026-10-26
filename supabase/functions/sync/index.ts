/**
 * sync — offline-first sync endpoint for the Flutter mobile app.
 *
 * POST /sync
 * Body  { device_id?, push: PushRow[], cursor: string | null }
 * Reply { pull: {...}, cursor: string, pushed: number, rejected: RejectedRow[] }
 *
 * Push tables: assessments, responses (read-only from server: status, totals)
 * Pull tables: assessments, responses, form_versions, help_articles
 * Conflict rule: newer updated_at wins; server row beats client row on tie.
 */

import { corsHeaders, options, json, err } from '../_shared/cors.ts'
import { adminClient, requireUser, requireOrg } from '../_shared/supabase.ts'

type PushRow = { table: string; record: Record<string, unknown> }
type Rejected = { table: string; id: string; reason: string }

const PUSH_TABLES = new Set(['assessments', 'responses'])

// Fields the server owns — never overwritten by a client push.
const ASSESSMENT_PROTECTED = new Set(['status', 'totals', 'submitted_at', 'review_note', 'deleted_at'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return options()

  try {
    const { user } = await requireUser(req)
    const admin = adminClient()
    const { organisation_id: orgId } = await requireOrg(admin, user.id)

    // Check device is not revoked.
    const body = await req.json() as { device_id?: string; push?: PushRow[]; cursor?: string | null }
    const { device_id, push = [], cursor } = body

    if (device_id) {
      const { data: dev } = await admin.from('devices').select('revoked').eq('id', device_id).single()
      if (dev?.revoked) return err('Device has been revoked', 403)
    }

    // ── PUSH ──────────────────────────────────────────────────────────────────
    const rejected: Rejected[] = []
    let pushed = 0

    for (const row of push) {
      if (!PUSH_TABLES.has(row.table)) {
        rejected.push({ table: row.table, id: String(row.record?.id ?? '?'), reason: 'table not writeable' })
        continue
      }

      try {
        if (row.table === 'assessments') {
          const rec = row.record
          if (rec.organisation_id !== orgId) {
            rejected.push({ table: 'assessments', id: String(rec.id), reason: 'wrong organisation' })
            continue
          }
          if (rec.created_by !== user.id) {
            rejected.push({ table: 'assessments', id: String(rec.id), reason: 'not owner' })
            continue
          }

          // Fetch existing row to check conflict and preserve server-owned fields.
          const { data: existing } = await admin
            .from('assessments')
            .select('updated_at, status, totals, submitted_at, review_note, deleted_at')
            .eq('id', rec.id)
            .single()

          if (existing) {
            const serverTs = new Date(existing.updated_at as string).getTime()
            const clientTs = rec.updated_at ? new Date(rec.updated_at as string).getTime() : 0
            if (serverTs >= clientTs) {
              rejected.push({ table: 'assessments', id: String(rec.id), reason: 'conflict:server_newer' })
              continue
            }
          }

          // Strip protected fields; restore from server if the row already exists.
          const safe: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(rec)) {
            if (!ASSESSMENT_PROTECTED.has(k)) safe[k] = v
          }
          if (existing) {
            for (const k of ASSESSMENT_PROTECTED) safe[k] = (existing as Record<string, unknown>)[k]
          }

          const { error } = await admin.from('assessments').upsert(safe, { onConflict: 'id' })
          if (error) throw error
          pushed++

        } else if (row.table === 'responses') {
          const rec = row.record
          const assessmentId = rec.assessment_id as string
          const itemKey = rec.item_key as string

          const { data: asmnt } = await admin
            .from('assessments')
            .select('created_by, organisation_id, status, assessors')
            .eq('id', assessmentId)
            .single()

          if (!asmnt || asmnt.organisation_id !== orgId) {
            rejected.push({ table: 'responses', id: `${assessmentId}/${itemKey}`, reason: 'assessment not found' })
            continue
          }
          const isOwner = asmnt.created_by === user.id ||
            (Array.isArray(asmnt.assessors) && asmnt.assessors.includes(user.id))
          if (!isOwner) {
            rejected.push({ table: 'responses', id: `${assessmentId}/${itemKey}`, reason: 'not owner' })
            continue
          }
          if (asmnt.status !== 'draft' && asmnt.status !== 'returned') {
            rejected.push({ table: 'responses', id: `${assessmentId}/${itemKey}`, reason: `assessment_${asmnt.status}` })
            continue
          }

          const { data: existing } = await admin
            .from('responses')
            .select('updated_at')
            .eq('assessment_id', assessmentId)
            .eq('item_key', itemKey)
            .single()

          if (existing) {
            const serverTs = new Date(existing.updated_at as string).getTime()
            const clientTs = rec.updated_at ? new Date(rec.updated_at as string).getTime() : 0
            if (serverTs >= clientTs) {
              rejected.push({ table: 'responses', id: `${assessmentId}/${itemKey}`, reason: 'conflict:server_newer' })
              continue
            }
          }

          const safe = { ...rec, updated_by: user.id }
          const { error } = await admin.from('responses').upsert(safe, { onConflict: 'assessment_id,item_key' })
          if (error) throw error
          pushed++
        }
      } catch (e) {
        const id = String(row.record?.id ?? row.record?.assessment_id ?? '?')
        rejected.push({ table: row.table, id, reason: String((e as Error).message ?? e) })
      }
    }

    // ── PULL ──────────────────────────────────────────────────────────────────
    const since = cursor ? new Date(cursor).toISOString() : new Date(0).toISOString()

    const [asmntRes, fvRes, helpRes, locationRes, memberRes] = await Promise.all([
      admin
        .from('assessments')
        .select('*')
        .eq('organisation_id', orgId)
        .or(`created_by.eq.${user.id},assessors.cs.{${user.id}}`)
        .gt('updated_at', since)
        .is('deleted_at', null),

      admin
        .from('form_versions')
        .select('id, form_id, version, status, definition, updated_at, forms!inner(organisation_id)')
        .eq('forms.organisation_id', orgId)
        .eq('status', 'published')
        .gt('updated_at', since),

      admin
        .from('help_articles')
        .select('id, slug, title, body, updated_at')
        .eq('organisation_id', orgId)
        .eq('published', true)
        .gt('updated_at', since),

      // Always pull all active locations so the picker is fully populated.
      admin
        .from('locations')
        .select('id, parent_id, code, name, level, active')
        .eq('organisation_id', orgId)
        .eq('active', true),

      // Always pull all org members for the co-assessor picker.
      admin
        .from('memberships')
        .select('user_id, profiles!inner(full_name)')
        .eq('organisation_id', orgId),
    ])

    const assessments = asmntRes.data ?? []
    const formVersions = (fvRes.data ?? []).map(({ forms: _f, ...rest }) => rest)
    const locations = locationRes.data ?? []
    const members = (memberRes.data ?? []).map((m) => ({
      id: m.user_id,
      full_name: (m.profiles as { full_name?: string })?.full_name ?? '',
    }))

    let responses: unknown[] = []
    if (assessments.length > 0) {
      const ids = assessments.map((a) => a.id)
      const { data } = await admin
        .from('responses')
        .select('*')
        .in('assessment_id', ids)
        .gt('updated_at', since)
      responses = data ?? []
    }

    // Update device record.
    const now = new Date().toISOString()
    if (device_id) {
      await admin.from('devices').upsert(
        { id: device_id, user_id: user.id, last_sync_at: now, pending_changes: push.length - pushed },
        { onConflict: 'id' },
      )
      await admin.from('sync_events').insert({
        device_id,
        pushed,
        pulled: assessments.length + responses.length + formVersions.length +
          (helpRes.data?.length ?? 0) + locations.length + members.length,
      })
    }

    return json({
      pull: {
        assessments,
        responses,
        form_versions: formVersions,
        help_articles: helpRes.data ?? [],
        locations,
        members,
      },
      cursor: now,
      pushed,
      rejected,
    })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
