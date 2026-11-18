import "server-only";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export const OTP_TTL_MS = 5 * 60 * 1000; // a code is valid for 5 minutes
export const RESEND_COOLDOWN_MS = 30 * 1000; // one code per 30 seconds per address
export const MAX_ATTEMPTS = 5; // wrong guesses before the code is burned
export const MAX_SENDS_PER_EMAIL_PER_HOUR = 5;
export const MAX_SENDS_PER_IP_PER_HOUR = 20;
export const SESSION_TTL_S = 30 * 24 * 60 * 60; // 30 days

export const OTP_COOKIE = "hh_otp";
export const SESSION_COOKIE = "hh_session";

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/**
 * Dev mode prints the OTP in the server terminal and returns it to the browser so the flow can be
 * tried without an email provider. It is only honoured when AUTH_DEV_MODE=true AND the request is for
 * localhost, so a deployment with the flag left on still behaves like production.
 */
export function isDevOtp(host: string | null): boolean {
  return process.env.AUTH_DEV_MODE === "true" && LOCAL_HOST.test(host ?? "");
}
