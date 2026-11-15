"use client";

import { Users, X } from "lucide-react";
import type { Lang } from "@/lib/report/options";
import { t } from "@/lib/report/strings";

export type Match = {
  id: string;
  title: string | null;
  distance_m: number;
  similarity: number | null;
  support_count: number;
  status: string;
  created_at: string;
  days_open?: number;
};

// The pop-out agent. It never steals focus and never blocks typing.
export default function SimilarPanel({
  lang,
  matches,
  busyId,
  onMeToo,
  onDismiss,
}: {
  lang: Lang;
  matches: Match[];
  busyId: string | null;
  onMeToo: (id: string) => void;
  onDismiss: () => void;
}) {
  if (matches.length === 0) return null;
  return (
    <section className="popout surface mt-3 rounded-[16px] p-4" aria-labelledby="similar-title">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
          <Users size={18} strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="similar-title" className="text-[17px] font-medium leading-snug">
            {t("similarTitle", lang)}
          </h3>
          <p className="mt-1 font-serif text-[16px] text-ink-64">{t("similarBody", lang)}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="relative -mr-1 -mt-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-50 transition-colors duration-150 hover:text-ink"
          aria-label={t("different", lang)}
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {matches.map((m) => {
          const days = m.days_open ?? 1;
          return (
            <li key={m.id} className="flex flex-col gap-3 rounded-[12px] bg-surface-2 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{m.title ?? "—"}</p>
                <p className="tabular mt-0.5 text-[15px] text-ink-64">
                  {Math.round(m.distance_m)} {t("metersAway", lang)} · {m.support_count} {t("people", lang)} · {days}{" "}
                  {days === 1 ? t("dayOpen", lang) : t("daysOpen", lang)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary shrink-0"
                disabled={busyId !== null}
                onClick={() => onMeToo(m.id)}
              >
                {busyId === m.id ? "…" : t("meToo", lang)}
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" className="btn btn-quiet mt-1 w-full" onClick={onDismiss}>
        {t("different", lang)}
      </button>
    </section>
  );
}
