"use client";

import { useState } from "react";
import Link from "next/link";

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "aftercare2026";
const AUTH_KEY = "aftercare_admin_authed";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    window.setTimeout(() => {
      if (username.trim() === DEMO_USERNAME && password === DEMO_PASSWORD) {
        window.localStorage.setItem(AUTH_KEY, "true");
        window.location.href = "/dashboard";
        return;
      }
      setError("Incorrect administrator username or password.");
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-[17px] font-bold tracking-tight text-[var(--ink)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--forest)] text-white">A</span>
          Aftercare
        </Link>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--line)] bg-white p-7 shadow-[0_20px_40px_rgba(24,36,33,.06)]">
          <h1 className="text-[20px] font-bold text-[var(--ink)]">Administrator login</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Sign in to the Aftercare clinician workspace.</p>

          <label className="mt-6 block text-[12px] font-semibold text-[var(--ink)]">
            Username
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-[14px] font-normal outline-none focus:border-[var(--forest)]"
            />
          </label>

          <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-[14px] font-normal outline-none focus:border-[var(--forest)]"
            />
          </label>

          {error && <p className="mt-3 text-[12px] font-medium text-[var(--coral)]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-[var(--forest)] py-3 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Log in"}
          </button>

          <div className="mt-5 rounded-xl bg-[var(--canvas)] px-3.5 py-2.5 text-[11px] text-[var(--muted)]">
            <strong className="text-[var(--ink)]">Workspace access</strong> — username <code className="font-semibold text-[var(--ink)]">admin</code>, password{" "}
            <code className="font-semibold text-[var(--ink)]">aftercare2026</code>. Local access only; connect your identity provider before deployment.
          </div>
        </form>
      </div>
    </div>
  );
}
