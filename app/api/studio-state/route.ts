import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/server-supabase";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server-auth";
import type { StudioData } from "@/lib/types";

const REMOTE_STATE_ID = "main";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server Supabase is not configured" }, { status: 503 });
  }

  const { data, error } = await supabase.from("studio_state").select("data, updated_at").eq("id", REMOTE_STATE_ID).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.data) {
    return NextResponse.json({ status: "missing" });
  }

  return NextResponse.json({
    status: "found",
    data: data.data,
    updatedAt: data.updated_at ?? null
  });
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Server Supabase is not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { data?: StudioData } | null;
  if (!body?.data) {
    return NextResponse.json({ error: "Missing studio data" }, { status: 400 });
  }

  const { error } = await supabase.from("studio_state").upsert({
    id: REMOTE_STATE_ID,
    data: body.data,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
