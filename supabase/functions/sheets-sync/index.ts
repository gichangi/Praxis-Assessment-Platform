/**
 * sheets-sync — daily job: push approved assessments to Google Sheets.
 *
 * Invoked by a Supabase scheduled cron (configured in supabase/config.toml).
 * Can also be triggered manually: POST /sheets-sync { organisation_id? }
 *
 * Required app_config rows (per organisation):
 *   key = 'sheets_spreadsheet_id'   value = "<spreadsheet-id>"
 *   key = 'sheets_last_synced_at'   value = "<ISO timestamp>"   (written back)
 *   key = 'google_service_account'  value = { ... service-account JSON ... }
 *
 * Each approved assessment is appended as one row to the sheet named after the
 * form key. The sheet is created if it does not exist.
 *
 * Assessment answers, notes, and definition JSON are NOT exported; only totals
 * and metadata (district, assessor, date, score, max, pct per section) go out.
 */

import { options, json, err } from '../_shared/cors.ts'
import { adminClient } from '../_shared/supabase.ts'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

/** Minimal JWT-based Google OAuth2 for service accounts (no external library). */
async function getGoogleAccessToken(serviceAccount: {
  client_email: string
  private_key: string
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const signingInput = `${header}.${payload}`

  // Import the RSA private key.
  const pem = serviceAccount.private_key.replace(/\\n/g, '\n')
  const pemBody = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '')
  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))
  const privateKey = await crypto.subtle.importKey(
    'pkcs8', keyData.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', privateKey,
    new TextEncoder().encode(signingInput),
  )
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
  const jwt = `${signingInput}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(`Google OAuth failed: ${data.error}`)
  return data.access_token
}

async function appendToSheet(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  rows: unknown[][],
) {
  const range = encodeURIComponent(`${sheetName}!A1`)
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    },
  )
  if (!res.ok) {
    const body = await res.text()
    // Sheet doesn't exist — create it then retry.
    if (res.status === 400 && body.includes('Unable to parse range')) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: sheetName } } }],
          }),
        },
      )
      await appendToSheet(token, spreadsheetId, sheetName, rows)
    } else {
      throw new Error(`Sheets API error ${res.status}: ${body}`)
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return options()

  try {
    const admin = adminClient()

    // Accept an optional organisation_id filter (useful for manual triggers).
    let targetOrgId: string | undefined
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({})) as { organisation_id?: string }
      targetOrgId = body.organisation_id
    }

    // Load all orgs that have sheets configured.
    const configQuery = admin
      .from('app_config')
      .select('organisation_id, key, value')
      .in('key', ['sheets_spreadsheet_id', 'sheets_last_synced_at', 'google_service_account'])
    if (targetOrgId) configQuery.eq('organisation_id', targetOrgId)
    const { data: configs = [] } = await configQuery

    // Group config rows by org.
    const byOrg = new Map<string, Record<string, unknown>>()
    for (const row of configs as Array<{ organisation_id: string; key: string; value: unknown }>) {
      if (!byOrg.has(row.organisation_id)) byOrg.set(row.organisation_id, {})
      byOrg.get(row.organisation_id)![row.key] = row.value
    }

    const results: Array<{ org: string; rows_exported: number; error?: string }> = []

    for (const [orgId, cfg] of byOrg.entries()) {
      if (!cfg['sheets_spreadsheet_id'] || !cfg['google_service_account']) continue

      try {
        const spreadsheetId = cfg['sheets_spreadsheet_id'] as string
        const sa = cfg['google_service_account'] as { client_email: string; private_key: string }
        const since = (cfg['sheets_last_synced_at'] as string | undefined) ?? new Date(0).toISOString()

        const token = await getGoogleAccessToken(sa)

        // Load approved assessments updated since last sync.
        const { data: assessments = [] } = await admin
          .from('assessments')
          .select(`
            id, location_id, assessed_on, language, totals,
            locations(name),
            profiles!created_by(full_name),
            form_versions(version, forms(key))
          `)
          .eq('organisation_id', orgId)
          .eq('status', 'approved')
          .gt('updated_at', since)

        // Group by form key → one sheet per form.
        const byForm = new Map<string, unknown[][]>()
        for (const a of assessments as Array<Record<string, unknown>>) {
          const totals = a.totals as Record<string, unknown>
          if (!totals) continue
          const formKey = (((a.form_versions as Record<string, unknown>)?.forms as Record<string, unknown>)?.key ?? 'unknown') as string
          const distName = ((a.locations as Record<string, unknown>)?.name as Record<string, string>)?.['en'] ?? ''
          const assessorName = (a.profiles as Record<string, unknown>)?.full_name ?? ''
          const sections = totals.sections as Record<string, Record<string, unknown>> ?? {}
          const sectionCols = Object.entries(sections).flatMap(([k, v]) => [
            `${k}_score`, String(v.score ?? ''),
            `${k}_max`, String(v.max ?? ''),
            `${k}_pct`, String(v.pct ?? ''),
          ])

          const row = [
            String(a.id),
            String(distName),
            String(assessorName),
            String(a.assessed_on ?? ''),
            String(a.language ?? 'en'),
            String((a.form_versions as Record<string, unknown>)?.version ?? ''),
            String(totals.score ?? ''),
            String(totals.max ?? ''),
            String(totals.pct ?? ''),
            ...sectionCols,
          ]
          if (!byForm.has(formKey)) byForm.set(formKey, [])
          byForm.get(formKey)!.push(row)
        }

        let rowsExported = 0
        for (const [formKey, rows] of byForm.entries()) {
          await appendToSheet(token, spreadsheetId, formKey, rows)
          rowsExported += rows.length
        }

        // Update last synced timestamp.
        await admin.from('app_config').upsert({
          organisation_id: orgId,
          key: 'sheets_last_synced_at',
          value: new Date().toISOString(),
        }, { onConflict: 'organisation_id,key' })

        results.push({ org: orgId, rows_exported: rowsExported })
      } catch (e) {
        results.push({ org: orgId, rows_exported: 0, error: (e as Error).message })
      }
    }

    return json({ results })
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500
    return err((e as Error).message ?? 'Internal error', status)
  }
})
