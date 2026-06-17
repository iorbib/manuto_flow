import "server-only";
import crypto from "node:crypto";
import { PASSWORD_HASH } from "./auth-config";
import { AUTH_USER } from "./public-auth";

export const SESSION_COOKIE = "manuto-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getSessionSecret() {
  return process.env.MANUTO_SESSION_SECRET || PASSWORD_HASH;
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      user: AUTH_USER,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
    })
  ).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = signPayload(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user?: string; exp?: number };
    return session.user === AUTH_USER && typeof session.exp === "number" && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function getSessionMaxAge() {
  return SESSION_TTL_SECONDS;
}
