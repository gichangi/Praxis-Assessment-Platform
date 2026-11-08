import { NextRequest, NextResponse } from "next/server";
import { callFunction } from "@/lib/function-proxy";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  const sb = createClient();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  return callFunction("update-member", "PUT", session.access_token, body);
}
