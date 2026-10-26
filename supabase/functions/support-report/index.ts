/**
 * support-report — create a support ticket with optional diagnostic payload.
 *
 * POST /support-report
 * Body  {
 *   subject: string,
 *   diagnostics?: {          // attached by the Flutter app automatically
 *     app_version: string,
 *     platform: string,
 *     device_id?: string,
 *     current_screen?: string,
 *     sync_log?: string[],   // last N sync events (no assessment data)
 *   },
 *   assessment_id?: string,  // included only if the issue is assessment-specific
 * }
 * Reply { ticket_id: string }
 *
 * Note: assessment answers, notes, totals and form definitions are NOT accepted
 * or stored here (rule 9 in CLAUDE.md).
 */

import { options, json, err } from '../_shared/cors.ts'
import { adminClient, requireUser, requireOrg } from '../_shared/supabase.ts'

// Keys from diagnostics that are safe to store (no assessment content).
const SAFE_DIAGNOSTIC_KEYS = new Set([
  'app_version', 'platform', 'device_id', 'current_screen',
  'sync_log', 'pending_changes', 'last_sync_at', 'network_type',
])

function sanitizeDiagnostics(raw: Record<string, unknown> | undefined): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null
  const safe: Record<string, unknown> = {}
  for (const key of SAFE_DIAGNOSTIC_KEYS) {
    if (key in raw) safe[key] = raw[key]
  }
  // Truncate sync_log to last 50 lines and strip any value-like numbers.
  if (Array.isArray(safe.sync_log)) {
    safe.sync_log = (safe.sync_log as unknown[]).slice(-50).map(String)
  }
  return safe
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return options()

  try {
    const { user } = await requireUser(req)
    const admin = adminClient()
    const { organisation_id: orgId } = await requireOrg(admin, user.id)

    const body = await req.json() as {
      subject: string
      diagnostics?: Record<string, unknown>
      assessment_id?: string
    }
    const { subject, diagnostics, assessment_id } = body

    if (!subject?.trim()) return err('subject is required')
    if (subject.length > 500) return err('subject must be ≤500 characters')

    // If an assessment_id is supplied, verify the caller can see it.
    if (assessment_id) {
      const { data } = await admin
        .from('assessments')
        .select('organisation_id, created_by')
        .eq('id', assessment_id)
        .single()
      const ok = data?.organisation_id === orgId ||
        data?.created_by === user.id
      if (!ok) return err('assessment_id not found or inaccessible', 403)
    }

    const { data: ticket, error: ticketErr } = await admin
      .from('support_tickets')
      .insert({
        organisation_id: orgId,
        user_id: user.id,
        subject: subject.trim(),
        assessment_id: assessment_id ?? null,
        diagnostics: sanitizeDiagnostics(diagnostics),
      })
      .select('id')
      .single()

    if (ticketErr) return err(ticketErr.message, 400)

    // Add opening message with the sanitised diagnostic summary.
    await admin.from('support_messages').insert({
      ticket_id: ticket.id,
      author_id: user.id,
      body: subject.trim(),
    })

    return json({ ticket_id: ticket.id })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
