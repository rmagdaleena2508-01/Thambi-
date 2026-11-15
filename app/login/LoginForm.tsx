"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next, linkError }: { next: string; linkError: boolean }) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(linkError ? "error" : "idle");

  const callback = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callback(), shouldCreateUser: true },
    });
    setState(error ? "error" : "sent");
  };

  const google = () => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });

  if (state === "sent") {
    return (
      <div className="rise" role="status">
        <p className="text-[20px] font-medium">Check your email.</p>
        <p className="mt-2 font-serif text-ink-64">
          We sent a sign-in link to <span className="text-ink">{email}</span>. Open it on this device, then come back to
          your report — your draft is saved.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <button type="button" className="btn btn-secondary w-full" onClick={google}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-[14px] text-ink-50">
        <span className="h-px flex-1 bg-[var(--ring-strong)]" />
        or
        <span className="h-px flex-1 bg-[var(--ring-strong)]" />
      </div>

      <form onSubmit={sendLink} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-medium text-ink-72">Email</span>
          <input
            className="field"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={state === "sending" || !email.includes("@")}>
          {state === "sending" ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Mail size={18} aria-hidden />}
          Email me a sign-in link
        </button>
      </form>

      {state === "error" && (
        <p className="rounded-[12px] bg-danger-tint p-3 text-[16px] text-danger" role="alert">
          That didn&apos;t work. Please try again in a minute.
        </p>
      )}
      <p className="font-serif text-[15px] text-ink-50">
        No password. We never show your email publicly. Your name appears on reports so fake reports can&apos;t drown out
        real ones.
      </p>
    </div>
  );
}
