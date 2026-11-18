import "server-only";
import { randomInt } from "node:crypto";
import { MAX_ATTEMPTS, OTP_TTL_MS } from "./config";
import { hmac, sign, verify } from "./token";

interface OtpChallenge {
  t: "otp";
  p: string; // email address
  e: number; // expires at (ms)
  s: number; // sent at (ms)
  a: number; // wrong attempts so far
  h: string; // keyed hash of email + code + expiry
}

/** Makes a random 6 digit code. Only a keyed hash of it goes into the signed challenge cookie. */
export function issueOtp(email: string) {
  const code = String(randomInt(100000, 1000000));
  const now = Date.now();
  const e = now + OTP_TTL_MS;
  const token = sign({ t: "otp", p: email, e, s: now, a: 0, h: hmac("otp", email, code, String(e)) } satisfies OtpChallenge);
  return { code, token };
}

export function readChallenge(token: string | undefined): OtpChallenge | null {
  return verify<OtpChallenge>(token, "otp");
}

export type OtpCheck =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "locked" | "wrong"; token?: string; left?: number };

export function checkOtp(token: string | undefined, email: string, code: string): OtpCheck {
  const c = readChallenge(token);
  if (!c || c.p !== email) return { ok: false, reason: "missing" };
  if (Date.now() > c.e) return { ok: false, reason: "expired" };
  if (c.a >= MAX_ATTEMPTS) return { ok: false, reason: "locked" };

  const expected = hmac("otp", email, code, String(c.e));
  // Constant-time comparison of two equal length strings.
  let diff = expected.length ^ c.h.length;
  for (let i = 0; i < Math.min(expected.length, c.h.length); i++) diff |= expected.charCodeAt(i) ^ c.h.charCodeAt(i);
  if (diff === 0) return { ok: true };

  const attempts = c.a + 1;
  return {
    ok: false,
    reason: attempts >= MAX_ATTEMPTS ? "locked" : "wrong",
    left: MAX_ATTEMPTS - attempts,
    token: sign({ ...c, a: attempts }),
  };
}
