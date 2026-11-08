import { NextResponse } from "next/server";

/**
 * Turn whatever an edge function (or the gateway in front of it) sent back into a reply the
 * browser can always read: success bodies pass through, and failures always carry an `error`
 * string saying what went wrong. Gateway errors use `message` or `msg`, and a function that is
 * down or missing may reply with something that isn't JSON at all.
 */
export function failureMessage(status: number, text: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    for (const key of ["error", "message", "msg"]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  if (status === 404) return "The server function isn’t available. Ask your administrator to deploy it.";
  if (status === 401 || status === 403) return "You’re not allowed to do that. Sign in again and retry.";
  if (status >= 500) return `The server had a problem (${status}). Please try again in a moment.`;
  return `The request failed (${status}).`;
}

/** Call an edge function as the signed-in user and relay the result. */
export async function callFunction(
  name: string,
  method: "POST" | "PUT",
  accessToken: string,
  body: unknown,
): Promise<NextResponse> {
  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn’t reach the server. Check the connection and try again." },
      { status: 502 },
    );
  }

  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: failureMessage(res.status, text) }, { status: res.status });
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return NextResponse.json({}, { status: res.status });
  }
}
