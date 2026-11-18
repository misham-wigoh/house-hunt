import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { AuthError } from "./config";

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new AuthError("Login isn't switched on yet. Please try again later.", 503);
  }
  return s;
}

const mac = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

/** Keyed hash of the given parts (used to bind an OTP to its number and expiry without storing the code). */
export const hmac = (...parts: string[]) => mac(parts.join("|"));

/** `payload.signature`, both base64url. The payload is readable but cannot be changed without the secret. */
export function sign(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(body)}`;
}

export function verify<T extends { t: string }>(token: string | undefined, purpose: T["t"]): T | null {
  if (!token) return null;
  const [body, sig, ...rest] = token.split(".");
  if (!body || !sig || rest.length) return null;
  const expected = Buffer.from(mac(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return payload.t === purpose ? payload : null;
  } catch {
    return null;
  }
}
