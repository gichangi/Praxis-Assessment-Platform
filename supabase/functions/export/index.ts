/**
 * export — generate an XLSX report for a submitted/approved assessment.
 *
 * GET /export?assessment_id=<uuid>&format=xlsx   (default)
 * GET /export?assessment_id=<uuid>&format=json   (raw totals + responses)
 *
 * Reply: file download (application/vnd.openxmlformats…) or JSON.
 *
 * Requires: caller can read the assessment (same org, or created_by).
 */

import { options, err } from '../_shared/cors.ts'
import { adminClient, requireUser } from '../_shared/supabase.ts'
// deno-lint-ignore no-explicit-any
import * as XLSX from 'npm:xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { user } = await requireUser(req)
    const admin = adminClient()

    const url = new URL(req.url)
    const assessmentId = url.searchParams.get('assessment_id')
    const format = url.searchParams.get('format') ?? 'xlsx'
    if (!assessmentId) return err('assessment_id required')

    // Load assessment + form version + responses in parallel.
    const [asmntRes, responsesRes] = await Promise.all([
      admin
        .from('assessments')
        .select('*, form_versions(id, version, definition), locations(name), profiles!created_by(full_name)')
        .eq('id', assessmentId)
        .single(),
      admin
        .from('responses')
        .select('*')
        .eq('assessment_id', assessmentId),
    ])

    if (asmntRes.error || !asmntRes.data) return err('Assessment not found', 404)
    const asmnt = asmntRes.data as Record<string, unknown>

    // Authorisation: caller must belong to the same org or be the assessor.
    const { data: mem } = await admin
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organisation_id', asmnt.organisation_id as string)
      .limit(1)
      .single()
    const isOwner = asmnt.created_by === user.id ||
      (Array.isArray(asmnt.assessors) && (asmnt.assessors as string[]).includes(user.id))
    if (!mem && !isOwner) return err('Access denied', 403)

    // Compute totals via SQL (the authoritative scoring function).
    const { data: totals, error: totErr } = await admin.rpc('compute_totals', { p_assessment_id: assessmentId })
    if (totErr) return err(totErr.message)

    if (format === 'json') {
      return new Response(JSON.stringify({ assessment: asmnt, totals, responses: responsesRes.data ?? [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Build XLSX ─────────────────────────────────────────────────────────────
    const def = (asmnt.form_versions as Record<string, unknown>)?.definition as Record<string, unknown>
    const responses = (responsesRes.data ?? []) as Array<Record<string, unknown>>
    const lang = (asmnt.language as string) ?? 'en'
    const t = (i18n: unknown) => {
      const m = i18n as Record<string, string> | null
      return m?.[lang] ?? m?.['en'] ?? ''
    }
    const districtName = t((asmnt.locations as Record<string, unknown>)?.name)
    const assessorName = (asmnt.profiles as Record<string, unknown>)?.full_name ?? ''

    const wb = XLSX.utils.book_new()

    // ── Summary sheet ──────────────────────────────────────────────────────────
    const summaryRows: unknown[][] = [
      ['Field', 'Value'],
      ['Assessment ID', assessmentId],
      ['Location', districtName],
      ['Assessor', assessorName],
      ['Form version', (asmnt.form_versions as Record<string, unknown>)?.version],
      ['Language', lang],
      ['Status', asmnt.status],
      ['Assessed on', asmnt.assessed_on],
      ['Submitted at', asmnt.submitted_at ?? '—'],
      [],
      ['Overall score', (totals as Record<string, unknown>)?.score],
      ['Overall max', (totals as Record<string, unknown>)?.max],
      ['Overall %', (totals as Record<string, unknown>)?.pct],
    ]

    // Section totals
    const sections = (totals as Record<string, unknown>)?.sections as Record<string, Record<string, unknown>> ?? {}
    summaryRows.push([], ['Section', 'Score', 'Max', '%'])
    for (const [key, sec] of Object.entries(sections)) {
      summaryRows.push([key, sec.score, sec.max, sec.pct])
    }

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary')

    // ── Responses sheet ────────────────────────────────────────────────────────
    const responseMap = new Map(responses.map((r) => [r.item_key as string, r]))
    const responseRows: unknown[][] = [
      ['Section', 'Group', 'Item key', 'Title', 'Value', 'Not assessed', 'Note'],
    ]
    for (const sec of (def?.sections ?? []) as Array<Record<string, unknown>>) {
      for (const it of (sec.items ?? []) as Array<Record<string, unknown>>) {
        const r = responseMap.get(it.key as string)
        responseRows.push([
          String(sec.key),
          String(it.group ?? ''),
          String(it.key),
          t(it.title),
          r?.value ?? '',
          r?.not_assessed ? 'Yes' : 'No',
          r?.note ?? '',
        ])
      }
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(responseRows), 'Responses')

    const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Uint8Array

    return new Response(xlsxBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="assessment-${assessmentId.slice(0, 8)}.xlsx"`,
      },
    })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
