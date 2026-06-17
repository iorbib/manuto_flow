import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const valid = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ authenticated: valid }, { status: valid ? 200 : 401 });
}
