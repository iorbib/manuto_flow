"use client";

const AUTH_STORAGE_KEY = "manuto-flow-auth";
const AUTH_USER = "doralona";
const PASSWORD_HASH = "a5455a3ed5b60f87a23e8209a72546f95e4cbc3543fbe54c03d5415e46b26c45";

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;

  try {
    const session = JSON.parse(window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "null") as { user?: string; signedInAt?: string } | null;
    return session?.user === AUTH_USER && Boolean(session.signedInAt);
  } catch {
    return false;
  }
}

export async function signIn(username: string, password: string) {
  const cleanUsername = username.trim().toLowerCase();
  const passwordHash = await sha256(password);

  if (cleanUsername !== AUTH_USER || passwordHash !== PASSWORD_HASH) {
    return false;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: AUTH_USER, signedInAt: new Date().toISOString() }));
  window.dispatchEvent(new Event("manuto-auth-change"));
  return true;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("manuto-auth-change"));
}
