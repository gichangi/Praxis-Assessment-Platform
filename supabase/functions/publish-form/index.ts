/**
 * publish-form — validate a draft form version and publish it.
 *
 * POST /publish-form
 * Body  { version_id: string, change_note?: string }
 * Reply { form_version: FormVersionRow }
 *
 * Validates the definition structure, computes a SHA-256 checksum, then calls
 * the publish_form_version() SQL function which freezes the definition and
 * records published_by / published_at.
 */

import { options, json, err } from '../_shared/cors.ts'
import { adminClient, requireUser } from '../_shared/supabase.ts'

/** SHA-256 hex of a string. */
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

type DefinitionIssue = { path: string; message: string }

/** Lightweight structural validation — not a full Zod pass, but catches the
 *  invariants the SQL function and mobile app depend on. */
function validateDefinition(def: unknown): DefinitionIssue[] {
  const issues: DefinitionIssue[] = []
  if (typeof def !== 'object' || def === null) {
    return [{ path: '', message: 'definition must be a JSON object' }]
  }
  const d = def as Record<string, unknown>
  if (d.schema_version !== 1) issues.push({ path: 'schema_version', message: 'must be 1' })
  if (typeof d.form_key !== 'string' || !d.form_key)
    issues.push({ path: 'form_key', message: 'required string' })
  if (typeof d.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(d.version))
    issues.push({ path: 'version', message: 'must be semver (e.g. 1.0.0)' })
  if (typeof d.default_language !== 'string' || !d.default_language)
    issues.push({ path: 'default_language', message: 'required' })
  if (!Array.isArray(d.languages) || d.languages.length === 0)
    issues.push({ path: 'languages', message: 'must be a non-empty array' })
  if (!Array.isArray(d.scales) || d.scales.length === 0)
    issues.push({ path: 'scales', message: 'must be a non-empty array' })
  if (!Array.isArray(d.sections) || d.sections.length === 0)
    issues.push({ path: 'sections', message: 'must be a non-empty array' })

  const scaleKeys = new Set<string>()
  const itemKeys = new Set<string>()
  const dl = d.default_language as string

  for (const [si, sec] of ((d.scales ?? []) as Record<string, unknown>[]).entries()) {
    if (typeof sec.key !== 'string' || !sec.key)
      issues.push({ path: `scales[${si}].key`, message: 'required' })
    else scaleKeys.add(sec.key)
    if (!Array.isArray(sec.levels) || sec.levels.length < 2)
      issues.push({ path: `scales[${si}].levels`, message: 'at least 2 levels required' })
  }

  for (const [si, sec] of ((d.sections ?? []) as Record<string, unknown>[]).entries()) {
    if (typeof sec.key !== 'string' || !sec.key)
      issues.push({ path: `sections[${si}].key`, message: 'required' })
    if (!Array.isArray(sec.items) || sec.items.length === 0)
      issues.push({ path: `sections[${si}].items`, message: 'must be non-empty' })

    for (const [ii, it] of ((sec.items ?? []) as Record<string, unknown>[]).entries()) {
      const path = `sections[${si}].items[${ii}]`
      if (typeof it.key !== 'string' || !it.key)
        issues.push({ path: `${path}.key`, message: 'required' })
      else if (itemKeys.has(it.key))
        issues.push({ path: `${path}.key`, message: `duplicate key: ${it.key}` })
      else
        itemKeys.add(it.key)

      if (!['scale', 'yes_no', 'single_choice', 'text', 'date', 'number'].includes(it.type as string))
        issues.push({ path: `${path}.type`, message: `unknown type: ${it.type}` })

      if (it.type === 'scale' && !scaleKeys.has(it.scale as string))
        issues.push({ path: `${path}.scale`, message: `unknown scale: ${it.scale}` })

      const title = it.title as Record<string, string> | undefined
      if (!title?.[dl])
        issues.push({ path: `${path}.title.${dl}`, message: 'default-language title required' })
    }
  }

  return issues
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return options()

  try {
    const { user } = await requireUser(req)
    const admin = adminClient()

    const { version_id, change_note = '' } = await req.json() as {
      version_id: string
      change_note?: string
    }
    if (!version_id) return err('version_id required')

    // Load the draft version.
    const { data: fv, error: fvErr } = await admin
      .from('form_versions')
      .select('id, status, definition, form_id')
      .eq('id', version_id)
      .single()
    if (fvErr || !fv) return err('Form version not found', 404)
    if (fv.status !== 'draft') return err(`Cannot publish: version is already ${fv.status}`)

    // Check caller has form_editor or super_admin in this org.
    const { data: form } = await admin.from('forms').select('organisation_id').eq('id', fv.form_id).single()
    if (!form) return err('Form not found', 404)
    const { data: mem } = await admin
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organisation_id', form.organisation_id)
      .in('role', ['super_admin', 'form_editor'])
      .limit(1)
      .single()
    if (!mem) return err('Insufficient permissions', 403)

    // Validate the definition.
    const issues = validateDefinition(fv.definition)
    if (issues.length > 0) return json({ issues }, 422)

    // Compute checksum of the canonical JSON.
    const canonical = JSON.stringify(fv.definition, Object.keys(fv.definition as object).sort())
    const checksum = await sha256(canonical)

    // Call the SQL workflow function (sets status, published_by, published_at).
    const { data: result, error: pubErr } = await admin.rpc('publish_form_version', {
      p_version_id: version_id,
      p_checksum: checksum,
      p_note: change_note,
    })
    if (pubErr) return err(pubErr.message, 400)

    return json({ form_version: result })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
