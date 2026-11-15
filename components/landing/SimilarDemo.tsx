"use client";

import { useState } from "react";
import { Users } from "@phosphor-icons/react";

// Interactive demo of the pop-out. Matches on a few keywords so it works without a server.
// The matched report below is example data, labelled as such.
const KEYWORDS = ["pit", "pothole", "hole", "dug", "crater"];

export default function SimilarDemo() {
  const [text, setText] = useState("");
  const matched = KEYWORDS.some((k) => text.toLowerCase().includes(k)) && text.trim().length > 12;

  return (
    <div className="surface rounded-[20px] p-6 sm:p-8">
      <label htmlFor="demo-text" className="text-[16px] font-medium text-ink-72">
        Describe what you see
      </label>
      <textarea
        id="demo-text"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="For example: a deep pit near the signal, rain water fills it"
        className="field mt-2 min-h-[120px] resize-none leading-relaxed"
      />
      <div aria-live="polite" className="mt-4 min-h-[1px]">
        {matched && (
          <div className="popout rounded-[16px] border border-[var(--accent)] bg-[var(--accent-tint)] p-5">
            <p className="flex items-center gap-2 text-[17px] font-semibold">
              <Users size={20} weight="bold" aria-hidden /> Similar problems nearby
            </p>
            <p className="mt-1 text-[16px] text-ink-72">
              Is it one of these? Add your Me too so your voice joins theirs.
            </p>
            <div className="mt-4 rounded-[12px] bg-[var(--surface)] p-4">
              <p className="font-medium">Deep pit near the signal</p>
              <p className="tabular mt-1 text-[15px] text-ink-64">8 m away · 23 people · open 41 days</p>
              <p className="mt-1 text-[13px] text-ink-50">Example data for this demo, not a real report.</p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn btn-primary">Yes, add my Me too</button>
              <button type="button" className="btn btn-secondary">No, mine is different</button>
            </div>
          </div>
        )}
        {!matched && text.trim().length > 0 && (
          <p className="text-[16px] text-ink-64">Keep typing. Thambi looks for matching reports as you describe the problem.</p>
        )}
      </div>
    </div>
  );
}
