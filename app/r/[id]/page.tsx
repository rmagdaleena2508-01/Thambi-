import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Warning } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { STATUS, SEVERITY_VISUAL, type StatusKey } from "@/lib/report/visual";
import { CATEGORIES, DANGER_LABELS, OPEN_SINCE } from "@/lib/report/options";
import SupportButton from "@/components/report/SupportButton";

// Public report page. Anyone can read an approved report. Signing in is only needed to act.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

type Report = {
  id: string;
  title: string | null;
  description: string;
  category: string;
  status: string;
  citizen_severity: number;
  text_severity: number | null;
  severity_reason: string | null;
  danger_flags: string[];
  summary_en: string | null;
  road_name: string | null;
  locality: string | null;
  landmark: string | null;
  open_since: string;
  support_count: number;
  priority: number;
  priority_reason: string | null;
  created_at: string;
};

const days = (iso: string) => Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));

async function ReportBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("id,title,description,category,status,citizen_severity,text_severity,severity_reason,danger_flags,summary_en,road_name,locality,landmark,open_since,support_count,priority,priority_reason,created_at")
    .eq("id", id)
    .maybeSingle<Report>();
  if (!report) notFound();

  const [{ data: history }, { data: media }, { data: claims }] = await Promise.all([
    supabase.from("status_events").select("id,from_status,to_status,note,created_at").eq("report_id", id).order("id", { ascending: true }),
    supabase.from("report_media").select("id,kind,path_public").eq("report_id", id).not("path_public", "is", null),
    supabase.auth.getClaims(),
  ]);

  const category = CATEGORIES.find((c) => c.value === report.category)?.label.en ?? "Civic problem";
  const openLabel = OPEN_SINCE.find((o) => o.value === report.open_since)?.label.en ?? report.open_since;
  const current = STATUS[report.status as StatusKey];
  const CurrentIcon = current?.icon;
  const sev = report.citizen_severity as 1 | 2 | 3 | 4 | 5;
  const thambiSev = report.text_severity as 1 | 2 | 3 | 4 | 5 | null;
  const signedIn = Boolean(claims?.claims?.sub);
  const mediaUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/media-public/${path}`;

  return (
    <main className="mx-auto w-full max-w-[860px] px-5 pb-24 pt-8">
      <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4">
        <Link href="/" className="btn btn-quiet min-h-[44px] px-0 text-[16px]">
          <ArrowLeft size={18} aria-hidden /> Thambi
        </Link>
        <span className="tabular text-[14px] text-ink-64">THB-{report.id.slice(0, 8).toUpperCase()}</span>
      </nav>

      <article className="mt-6">
        <p className="text-[15px] font-medium text-ink-64">{category}</p>
        <h1 className="mt-2 text-[clamp(30px,5vw,44px)] font-semibold leading-[1.08] tracking-[-0.02em]">
          {report.title ?? category}
        </h1>
        <p className="mt-3 text-[16px] text-ink-64">
          {[report.road_name, report.locality].filter(Boolean).join(", ") || "Location shared on the map"}
          {" · "}
          Reported {days(report.created_at)} {days(report.created_at) === 1 ? "day" : "days"} ago
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {current && CurrentIcon && (
            <span className={`chip ${current.chip}`} aria-label={`Status: ${current.word}`}>
              <CurrentIcon size={16} weight="bold" aria-hidden />
              {current.word}
            </span>
          )}
          <span className={`chip ${SEVERITY_VISUAL[sev].chip}`}>
            {(() => { const I = SEVERITY_VISUAL[sev].icon; return <I size={16} weight="bold" aria-hidden />; })()}
            Citizen rating {sev} · {SEVERITY_VISUAL[sev].word}
          </span>
          {thambiSev && (
            <span className={`chip ${SEVERITY_VISUAL[thambiSev].chip}`}>
              {(() => { const I = SEVERITY_VISUAL[thambiSev].icon; return <I size={16} weight="bold" aria-hidden />; })()}
              Thambi reads {thambiSev} · {SEVERITY_VISUAL[thambiSev].word}
            </span>
          )}
        </div>

        {report.danger_flags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Dangers noticed">
            {report.danger_flags.map((f) => (
              <li key={f} className="chip chip-reopened">
                <Warning size={16} weight="bold" aria-hidden />
                {DANGER_LABELS[f]?.en ?? f.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        )}

        {media && media.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Photos of the problem">
            {media.map((m, i) => (
              <li key={m.id} className="overflow-hidden rounded-[14px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(m.path_public as string)}
                  alt={`Photo ${i + 1} of the reported problem`}
                  loading="lazy"
                  className="photo-outline aspect-square w-full object-cover"
                />
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby="what-title" className="mt-10">
          <h2 id="what-title" className="text-[22px] font-semibold">What was reported</h2>
          <p className="mt-3 text-[18px] leading-[1.6] text-ink-72">{report.description}</p>
          {report.summary_en && <p className="mt-3 text-[17px] leading-[1.6] text-ink-64">{report.summary_en}</p>}
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[14px] text-ink-64">How long</dt>
              <dd className="mt-1 font-medium">{openLabel}</dd>
            </div>
            {report.landmark && (
              <div>
                <dt className="text-[14px] text-ink-64">Nearest landmark</dt>
                <dd className="mt-1 font-medium">{report.landmark}</dd>
              </div>
            )}
          </dl>
          {report.severity_reason && (
            <p className="mt-4 text-[16px] text-ink-64">Why Thambi reads it this way: {report.severity_reason}</p>
          )}
        </section>

        <section aria-labelledby="rank-title" className="surface mt-10 rounded-[18px] p-6">
          <h2 id="rank-title" className="text-[18px] font-semibold">Why this rank</h2>
          <p className="tabular mt-2 text-[17px] text-ink-72">
            Priority {report.priority.toFixed(1)} out of 100
            {report.priority_reason ? `. ${report.priority_reason}.` : "."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <SupportButton reportId={report.id} initialCount={report.support_count} signedIn={signedIn} />
          </div>
        </section>

        <section aria-labelledby="history-title" className="mt-10">
          <h2 id="history-title" className="text-[22px] font-semibold">What has happened</h2>
          <p className="mt-2 text-[16px] text-ink-64">Every change is recorded and cannot be edited.</p>
          <ol className="mt-6 space-y-5 border-l-2 border-[var(--ring-strong)] pl-6">
            <li className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
              <p className="font-medium">Reported</p>
              <p className="tabular text-[15px] text-ink-64">{new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </li>
            {(history ?? []).map((e) => {
              const s = STATUS[e.to_status as StatusKey];
              const I = s?.icon;
              return (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[var(--accent)]" aria-hidden />
                  <p className="flex items-center gap-2 font-medium">
                    {s && I && (
                      <span className={`chip ${s.chip}`}>
                        <I size={16} weight="bold" aria-hidden />
                        {s.word}
                      </span>
                    )}
                  </p>
                  {e.note && <p className="mt-1 text-[16px] text-ink-72">{e.note}</p>}
                  <p className="tabular text-[15px] text-ink-64">{new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </li>
              );
            })}
          </ol>
        </section>
      </article>
    </main>
  );
}

// The page reads the request (params, session), so it renders at request time inside Suspense.
export default function ReportPage({ params }: PageProps<"/r/[id]">) {
  return (
    <Suspense fallback={<main className="mx-auto h-[70vh] w-full max-w-[860px] px-5" />}>
      <ReportBody params={params} />
    </Suspense>
  );
}
