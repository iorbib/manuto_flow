"use client";

import { AUTH_USER } from "./public-auth";

const AUTH_STORAGE_KEY = "manuto-flow-auth";

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

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: cleanUsername, password })
  });

  if (!response.ok) {
    return false;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: AUTH_USER, signedInAt: new Date().toISOString() }));
  window.dispatchEvent(new Event("manuto-auth-change"));
  return true;
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  window.dispatchEvent(new Event("manuto-auth-change"));
}
