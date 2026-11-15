"use client";

import Link from "next/link";
import { useState } from "react";
import { ThumbsUp, Check } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

// "Me too". One per person per report (database primary key). Signing in is required to act.
export default function SupportButton({ reportId, initialCount, signedIn }: { reportId: string; initialCount: number; signedIn: boolean }) {
  const [count, setCount] = useState(initialCount);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/login?next=/r/${reportId}`} className="btn btn-primary">
          Sign in to add Me too
        </Link>
        <span className="tabular text-[16px] text-ink-72">{count} people say the same</span>
      </div>
    );
  }

  const add = async () => {
    setBusy(true);
    setError(null);
    const { error: e } = await createClient().from("supports").insert({ report_id: reportId, frequency: "rarely" });
    setBusy(false);
    if (!e || e.code === "23505") {
      setDone(true);
      if (!e) setCount((c) => c + 1);
    } else {
      setError("Could not add Me too. Please try again.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={add} disabled={busy || done} className="btn btn-primary">
        {done ? <Check size={18} weight="bold" aria-hidden /> : <ThumbsUp size={18} weight="bold" aria-hidden />}
        {done ? "You said Me too" : busy ? "Adding" : "Me too"}
      </button>
      <span className="tabular text-[16px] text-ink-72">{count} people say the same</span>
      {error && <p role="alert" className="w-full text-[15px] text-[var(--danger)]">{error}</p>}
    </div>
  );
}
