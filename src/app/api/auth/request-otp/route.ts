import { cookies } from "next/headers";
import {
  AuthError,
  MAX_SENDS_PER_IP_PER_HOUR,
  MAX_SENDS_PER_EMAIL_PER_HOUR,
  OTP_COOKIE,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  isDevOtp,
} from "@/lib/auth/config";
import { allow } from "@/lib/auth/limit";
import { issueOtp, readChallenge } from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/auth/mail";
import { cleanEmail, clientIp, fail, isHttps, json, requestHost, sameOrigin } from "@/lib/auth/http";
import { cookieOptions } from "@/lib/auth/session";

const HOUR = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("Request blocked.", 403);
    const body = (await request.json().catch(() => null)) as { email?: unknown; website?: unknown } | null;
    const email = cleanEmail(body?.email);
    if (!email) throw new AuthError("Enter a valid email address.", 400);

    // Bots fill the hidden field: pretend it worked.
    if (typeof body?.website === "string" && body.website.trim()) return json({ ok: true, retryAfter: 30 });

    const jar = await cookies();
    const existing = readChallenge(jar.get(OTP_COOKIE)?.value);
    if (existing && existing.p === email) {
      const wait = existing.s + RESEND_COOLDOWN_MS - Date.now();
      if (wait > 0) {
        throw new AuthError(`Please wait ${Math.ceil(wait / 1000)}s before asking for another code.`, 429, {
          retryAfter: Math.ceil(wait / 1000),
        });
      }
    }
    if (!allow(`otp:email:${email}`, MAX_SENDS_PER_EMAIL_PER_HOUR, HOUR)) {
      throw new AuthError("Too many codes requested for this email. Please try again in an hour.", 429);
    }
    if (!allow(`otp:ip:${clientIp(request)}`, MAX_SENDS_PER_IP_PER_HOUR, HOUR)) {
      throw new AuthError("Too many requests. Please try again later.", 429);
    }

    const dev = isDevOtp(requestHost(request));
    const { code, token } = issueOtp(email);
    await sendOtpEmail(email, code, dev);

    jar.set("hh_otp", token, cookieOptions(isHttps(request), Math.ceil(OTP_TTL_MS / 1000), "/api/auth"));
    return json({ ok: true, retryAfter: RESEND_COOLDOWN_MS / 1000, ...(dev ? { devOtp: code } : {}) });
  } catch (err) {
    return fail(err);
  }
}
