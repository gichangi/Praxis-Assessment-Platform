/**
 * _main — edge-runtime request router.
 *
 * The edge-runtime container is started with --main-service _main.
 * Kong strips the /functions/v1 prefix, so requests arrive as /<function-name>/…
 * This handler spins up an isolate per function and proxies the request.
 */

declare const EdgeRuntime: {
  userWorkers: {
    create(opts: {
      servicePath: string
      memoryLimitMb: number
      workerTimeoutMs: number
      noModuleCache: boolean
      envVars: Record<string, string>
    }): Promise<{ fetch(req: Request): Promise<Response> }>
  }
}

const FUNCTIONS = new Set([
  'sync',
  'publish-form',
  'invite-user',
  'export',
  'support-report',
  'sheets-sync',
  'update-member',
])

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  // Path after stripping leading slash: "sync", "invite-user", etc.
  const fnName = url.pathname.replace(/^\/+/, '').split('/')[0] ?? ''

  if (!FUNCTIONS.has(fnName)) {
    return new Response(JSON.stringify({ error: `Unknown function: ${fnName}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath: `${Deno.cwd()}/${fnName}`,
      memoryLimitMb: 150,
      workerTimeoutMs: 30_000,
      noModuleCache: false,
      envVars: Object.fromEntries(Deno.env.toObject()),
    })
    return await worker.fetch(req)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
