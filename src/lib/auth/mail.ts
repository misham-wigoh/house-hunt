import "server-only";
import { AuthError } from "./config";

/**
 * Delivers the login code by email. This is the single place that sends it.
 *
 * - Local dev mode (AUTH_DEV_MODE=true on localhost): nothing is sent; the code is printed in the
 *   server terminal and shown in the login box.
 * - EMAIL_PROVIDER=wordpress (default): sent through your WordPress site's mail (wp_mail) by the
 *   submissions plugin (`acres-submit`). Free, and nothing extra to sign up for.
 * - EMAIL_PROVIDER=brevo: sent through Brevo's transactional email API (free tier). Needs BREVO_API_KEY
 *   and EMAIL_FROM, which must be a sender address (or domain) you have verified in Brevo.
 * - EMAIL_PROVIDER=resend: sent through Resend (needs RESEND_API_KEY and EMAIL_FROM on a domain
 *   you have verified there). Better inbox delivery than a shared web host.
 */
export async function sendOtpEmail(email: string, code: string, dev: boolean): Promise<void> {
  if (dev) {
    console.log(`\n=== Login code for ${email}: ${code}  (dev mode, valid for 5 minutes) ===\n`);
    return;
  }

  const unavailable = () => new AuthError("We couldn't send the email right now. Please try again later.", 503);
  const provider = (process.env.EMAIL_PROVIDER ?? "wordpress").toLowerCase();

  if (provider === "wordpress") return sendViaWordPress(email, code, unavailable);
  if (provider === "brevo") return sendViaBrevo(email, code, unavailable);
  if (provider === "resend") return sendViaResend(email, code, unavailable);

  console.error(`EMAIL_PROVIDER="${provider}" is not supported (use "brevo", "wordpress" or "resend")`);
  throw unavailable();
}

async function sendViaWordPress(email: string, code: string, unavailable: () => AuthError): Promise<void> {
  const graphql = process.env.WORDPRESS_GRAPHQL_URL;
  const secret = process.env.WORDPRESS_SUBMIT_SECRET;
  if (!graphql || !secret) {
    console.error("WORDPRESS_GRAPHQL_URL and WORDPRESS_SUBMIT_SECRET are required to send mail through WordPress");
    throw unavailable();
  }
  let res: Response;
  try {
    res = await fetch(`${new URL(graphql).origin}/wp-json/acres/v1/member/otp-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Acres-Key": secret },
      body: JSON.stringify({ email, code }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Could not reach WordPress to send the login email", err);
    throw unavailable();
  }
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; message?: string };
  if (!res.ok || !body.ok) {
    console.error("WordPress could not send the login email", res.status, body.code, body.message);
    throw unavailable();
  }
}

async function sendViaBrevo(email: string, code: string, unavailable: () => AuthError): Promise<void> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.error("BREVO_API_KEY and EMAIL_FROM must both be set");
    throw unavailable();
  }
  let res: Response;
  try {
    res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { email: from, name: process.env.EMAIL_FROM_NAME || "House Hunt" },
        to: [{ email }],
        subject: `${code} is your House Hunt login code`,
        textContent: `Your House Hunt login code is ${code}.\n\nIt works for 5 minutes. If you didn't ask for it, you can ignore this email.`,
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Could not reach Brevo", err);
    throw unavailable();
  }
  if (!res.ok) {
    // Brevo's message names the problem (bad key, sender not verified, daily limit reached, ...).
    console.error("Brevo rejected the email", res.status, await res.text().catch(() => ""));
    throw unavailable();
  }
}

async function sendViaResend(email: string, code: string, unavailable: () => AuthError): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.error("RESEND_API_KEY and EMAIL_FROM must both be set");
    throw unavailable();
  }
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `${code} is your House Hunt login code`,
        text: `Your House Hunt login code is ${code}.\n\nIt works for 5 minutes. If you didn't ask for it, you can ignore this email.`,
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Could not reach Resend", err);
    throw unavailable();
  }
  if (!res.ok) {
    console.error("Resend rejected the email", res.status, await res.text().catch(() => ""));
    throw unavailable();
  }
}
