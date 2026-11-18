import "server-only";
import { NextResponse } from "next/server";
import { AuthError } from "./config";

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export const requestHost = (request: Request) =>
  request.headers.get("x-forwarded-host") ?? request.headers.get("host");

export const isHttps = (request: Request) =>
  (request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "")) === "https";

/** Blocks cross-site form posts: a browser-sent Origin must match this site. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === requestHost(request);
  } catch {
    return false;
  }
}

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(err: unknown) {
  if (err instanceof AuthError) return json({ ok: false, error: err.message, ...err.extra }, err.status);
  console.error("auth route failed", err);
  return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
}

/** Lower-cased, trimmed address, or "" when it doesn't look like an email. */
export const cleanEmail = (v: unknown) => {
  const s = String(v ?? "").trim().toLowerCase().slice(0, 120);
  return /^[^\s@<>"']{1,64}@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(s) ? s : "";
};
export const cleanName = (v: unknown) =>
  String(v ?? "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
