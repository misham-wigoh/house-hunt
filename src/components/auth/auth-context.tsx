"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LoginModal } from "./login-modal";

export interface AuthMember {
  name: string;
  email: string;
}

interface AuthContextValue {
  member: AuthMember | null;
  /** False until the first "who am I" check has finished. */
  ready: boolean;
  shortlist: string[];
  /** False while a logged in member's saved list is still loading. */
  shortlistReady: boolean;
  isShortlisted: (slug: string) => boolean;
  /** Saves or removes a property; asks the visitor to log in first when needed. */
  toggleShortlist: (slug: string) => void;
  openLogin: (onSuccess?: () => void) => void;
  logout: () => Promise<void>;
  /** Called by the login box once the code is verified or the name is saved. */
  setMember: (m: AuthMember | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return { ok: res.ok, data: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMemberState] = useState<AuthMember | null>(null);
  const [ready, setReady] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [shortlistReady, setShortlistReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const afterLogin = useRef<(() => void) | null>(null);

  const loadShortlist = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/shortlist", { cache: "no-store" });
      const data = (await res.json()) as { shortlist?: string[] };
      setShortlist(Array.isArray(data.shortlist) ? data.shortlist : []);
    } catch {
      /* the heart icons just stay empty */
    } finally {
      setShortlistReady(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as { member?: AuthMember | null };
        if (!alive) return;
        setMemberState(data.member ?? null);
        if (data.member) loadShortlist();
      } catch {
        /* stay logged out */
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadShortlist]);

  const setMember = useCallback(
    (m: AuthMember | null) => {
      setMemberState(m);
      if (m) {
        setShortlistReady(false);
        loadShortlist();
      } else setShortlist([]);
    },
    [loadShortlist],
  );

  const openLogin = useCallback((onSuccess?: () => void) => {
    afterLogin.current = onSuccess ?? null;
    setLoginOpen(true);
  }, []);

  const logout = useCallback(async () => {
    await post("/api/auth/logout");
    setMemberState(null);
    setShortlist([]);
  }, []);

  const toggleShortlist = useCallback(
    (slug: string) => {
      if (!member) {
        openLogin(() => toggleRef.current?.(slug));
        return;
      }
      const on = !shortlist.includes(slug);
      setShortlist((prev) => (on ? [slug, ...prev] : prev.filter((s) => s !== slug))); // optimistic
      post("/api/auth/shortlist", { slug, on }).then(({ ok, data }) => {
        if (ok && Array.isArray(data.shortlist)) setShortlist(data.shortlist as string[]);
        else setShortlist((prev) => (on ? prev.filter((s) => s !== slug) : [slug, ...prev])); // roll back
      });
    },
    [member, shortlist, openLogin],
  );

  // Lets the "after login" callback call the latest toggle (the member is set by then).
  const toggleRef = useRef<((slug: string) => void) | null>(null);
  useEffect(() => {
    toggleRef.current = toggleShortlist;
  }, [toggleShortlist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      member,
      ready,
      shortlist,
      shortlistReady,
      isShortlisted: (slug) => shortlist.includes(slug),
      toggleShortlist,
      openLogin,
      logout,
      setMember,
    }),
    [member, ready, shortlist, shortlistReady, toggleShortlist, openLogin, logout, setMember],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onDone={(m) => {
            setMember(m);
            setLoginOpen(false);
            const cb = afterLogin.current;
            afterLogin.current = null;
            // Wait a tick so the new session cookie and member are in place.
            if (cb) setTimeout(cb, 50);
          }}
        />
      )}
    </AuthContext.Provider>
  );
}
