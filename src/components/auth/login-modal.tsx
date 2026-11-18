"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { HouseHuntLogo } from "@/components/sites/house-hunt/icons";

type Step = "email" | "code" | "name";

interface Props {
  onClose: () => void;
  onDone: (member: { name: string; email: string }) => void;
}

async function api(url: string, body: unknown) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok && data.ok === true, data };
  } catch {
    return { ok: false, data: { error: "Couldn't reach the server. Check your connection and try again." } as Record<string, unknown> };
  }
}

const primary =
  "w-full py-2.5 px-4 rounded-full font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] transition-all shadow-[0_4px_16px_rgba(0,138,232,0.35)] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

/** Email address, then the 6 digit code, then (first time only) the member's name. */
export function LoginModal({ onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [website, setWebsite] = useState(""); // honeypot
  const [member, setMember] = useState<{ name: string; email: string } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    const { ok, data } = await api("/api/auth/request-otp", { email, website });
    setBusy(false);
    if (!ok) {
      if (typeof data.retryAfter === "number") setCooldown(data.retryAfter);
      // Still on the code step with a live cooldown: keep the step, show the message.
      if (data.retryAfter && step === "email") setStep("code");
      setError(String(data.error ?? "Couldn't send the code."));
      return;
    }
    setDevOtp(typeof data.devOtp === "string" ? data.devOtp : null);
    setCooldown(typeof data.retryAfter === "number" ? data.retryAfter : 30);
    setCode("");
    setStep("code");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { ok, data } = await api("/api/auth/verify-otp", { email, code });
    setBusy(false);
    if (!ok) {
      setError(String(data.error ?? "That code didn't work."));
      if (data.reason && data.reason !== "wrong") setCode("");
      return;
    }
    const m = data.member as { name: string; email: string };
    if (m.name) onDone(m);
    else {
      setMember(m);
      setStep("name");
    }
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { ok, data } = await api("/api/auth/profile", { name });
    setBusy(false);
    if (!ok) {
      setError(String(data.error ?? "Couldn't save your name."));
      return;
    }
    onDone(data.member as { name: string; email: string });
  };

  const title = step === "email" ? "Login or Sign up" : step === "code" ? "Enter the code" : "One last thing";
  const sub =
    step === "email"
      ? "Enter your email to save properties and post your own listings."
      : step === "code"
        ? `We emailed a 6 digit code to ${email}. Check your spam folder if it doesn't arrive.`
        : "What should we call you?";

  return (
    <div
      data-ui="modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-7 relative border border-[#aeaeaf]/40 text-[#262626] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#757577] hover:text-[#262626] bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <HouseHuntLogo light={false} className="h-8 mb-4" />
          <h3 id="login-title" className="text-xl font-bold text-[#262626] tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#757577] mt-1">{sub}</p>
        </div>

        {step === "email" && (
          <form onSubmit={sendCode} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[#262626] mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                required
                maxLength={120}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#aeaeaf]/40 focus:outline-hidden focus:border-[#008ae8] focus:ring-2 focus:ring-[#008ae8]/20 bg-[#fafafa] text-[#262626] placeholder:text-[#757577]"
              />
            </div>
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            {error && (
              <p role="alert" className="text-xs font-medium text-[#c2410c]">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy || !/^\S+@\S+\.\S{2,}$/.test(email.trim())} className={primary}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? "Sending…" : "Email me a code"}
            </button>
            <p className="text-[11px] text-[#757577] text-center leading-relaxed">
              By continuing, you agree to House Hunt&apos;s{" "}
              <a href="/terms" className="text-[#008ae8] hover:underline">
                Terms &amp; Conditions
              </a>{" "}
              and Privacy Policy.
            </p>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verify} className="space-y-4">
            <div>
              <label htmlFor="login-code" className="block text-xs font-semibold text-[#262626] mb-1.5">
                6 digit code
              </label>
              <input
                id="login-code"
                ref={codeRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="• • • • • •"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] font-semibold rounded-xl border border-[#aeaeaf]/40 focus:outline-hidden focus:border-[#008ae8] focus:ring-2 focus:ring-[#008ae8]/20 bg-[#fafafa]"
              />
            </div>

            {devOtp && (
              <p className="text-[11px] rounded-lg bg-[#fff7ed] border border-[#fdba74]/60 text-[#9a3412] px-3 py-2">
                Dev mode: no email is sent on localhost. Your code is <strong className="tracking-widest">{devOtp}</strong>{" "}
                (it is also printed in the server terminal).
              </p>
            )}
            {error && (
              <p role="alert" className="text-xs font-medium text-[#c2410c]">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy || code.length !== 6} className={primary}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? "Verifying…" : "Verify & Continue"}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError(null);
                  setDevOtp(null);
                }}
                className="text-[#757577] hover:text-[#262626]"
              >
                Change email
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || busy}
                onClick={() => sendCode()}
                className="text-[#008ae8] hover:underline disabled:text-[#757577] disabled:no-underline disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {step === "name" && member && (
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label htmlFor="login-name" className="block text-xs font-semibold text-[#262626] mb-1.5">
                Your name
              </label>
              <input
                id="login-name"
                type="text"
                autoFocus
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                placeholder="e.g. Rajesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#aeaeaf]/40 focus:outline-hidden focus:border-[#008ae8] focus:ring-2 focus:ring-[#008ae8]/20 bg-[#fafafa]"
              />
            </div>
            {error && (
              <p role="alert" className="text-xs font-medium text-[#c2410c]">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy || name.trim().length < 2} className={primary}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? "Saving…" : "Finish"}
            </button>
            <button type="button" onClick={() => onDone(member)} className="w-full text-xs text-[#757577] hover:text-[#262626]">
              Skip for now
            </button>
          </form>
        )}

        <p className="mt-5 text-[11px] text-[#757577] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#008ae8]" />
          Your email is never shown on the site.
        </p>
      </div>
    </div>
  );
}
