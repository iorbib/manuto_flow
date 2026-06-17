import { NextRequest, NextResponse } from "next/server";
import { PASSWORD_HASH } from "@/lib/auth-config";
import { AUTH_USER } from "@/lib/public-auth";
import { createSessionToken, getSessionMaxAge, hashPassword, SESSION_COOKIE } from "@/lib/server-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = body?.username?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  if (username !== AUTH_USER || hashPassword(password) !== PASSWORD_HASH) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: createSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAge()
  });

  return response;
}
