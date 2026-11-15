"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Check, CircleHelp, CloudRain, Construction, Crosshair, Droplets, Factory,
  ImagePlus, Lamp, Loader2, ShieldAlert, Trash2, Video, Waves, X, Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AFFECTED, CATEGORIES, DANGER_LABELS, OPEN_SINCE, SEVERITY, pick,
  type Category, type Lang, type OpenSince,
} from "@/lib/report/options";
import { t } from "@/lib/report/strings";
import { SEVERITY_VISUAL } from "@/lib/report/visual";
import { compressPhoto, videoDuration, MAX_PHOTOS, MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS } from "@/lib/report/media";
import SimilarPanel, { type Match } from "./SimilarPanel";
import type { LatLng } from "./MapPicker";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse rounded-[14px] bg-surface-2" />,
});

const ICONS = {
  construction: Construction, droplets: Droplets, waves: Waves, "cloud-rain": CloudRain, "trash-2": Trash2,
  lamp: Lamp, zap: Zap, factory: Factory, "circle-help": CircleHelp,
} as const;

const TOTAL = 8;
const DRAFT_KEY = "thambi:draft:v1";

type Draft = {
  category: Category | null;
  pos: LatLng | null;
  road: string;
  locality: string;
  landmark: string;
  description: string;
  openSince: OpenSince | null;
  severity: number | null;
  affected: string[];
  title: string;
  step: number;
};
const EMPTY: Draft = {
  category: null, pos: null, road: "", locality: "", landmark: "", description: "",
  openSince: null, severity: null, affected: [], title: "", step: 1,
};

type Reading = {
  source: "ai" | "keywords";
  title_en: string | null;
  summary_en: string | null;
  text_severity: number | null;
  severity_reason: string | null;
  danger_flags: string[];
};

type Phase = "form" | "signin" | "sending" | "done" | "joined";

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode: the form still works, the draft just isn't kept */
  }
}

export default function ReportForm() {
  const supabase = useMemo(() => createClient(), []);
  const lang: Lang = "en";
  const [d, setD] = useState<Draft>(() => ({ ...EMPTY, ...readStorage<Partial<Draft>>(DRAFT_KEY, {}) }));
  const hydrated = true;
  const [userId, setUserId] = useState<string | null>(null);

  const [photos, setPhotos] = useState<{ blob: Blob; url: string }[]>([]);
  const [video, setVideo] = useState<{ file: File; url: string } | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const [flyTo, setFlyTo] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [busyMatch, setBusyMatch] = useState<string | null>(null);
  const [pendingMeToo, setPendingMeToo] = useState<string | null>(null);

  const [reading, setReading] = useState<Reading | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);

  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; state: string } | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore draft and language; follow sign-in state (also from other tabs).
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (hydrated) writeStorage(DRAFT_KEY, d);
  }, [d, hydrated]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang, hydrated]);

  // Move focus to each new question, for keyboard and screen-reader users.
  useEffect(() => {
    if (hydrated) headingRef.current?.focus({ preventScroll: false });
  }, [d.step, phase, hydrated]);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    if (key === "description" || key === "category") setReading(null);
    setD((p) => ({ ...p, [key]: value }));
  }, []);

  // ---------------- Step 2: location ----------------
  const onMapMove = useCallback(
    async (p: LatLng) => {
      set("pos", p);
      try {
        const res = await fetch(`/api/geocode?lat=${p.lat}&lng=${p.lng}`);
        const g = await res.json();
        setD((prev) => ({
          ...prev,
          road: prev.road || g.road || "",
          locality: prev.locality || g.locality || "",
        }));
      } catch {
        /* typing the road by hand still works */
      }
    },
    [set],
  );

  const locate = () => {
    if (!("geolocation" in navigator)) return setLocError(true);
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const p = { lat: Number(pos.coords.latitude.toFixed(6)), lng: Number(pos.coords.longitude.toFixed(6)) };
        setFlyTo(p);
        onMapMove(p);
      },
      () => {
        setLocating(false);
        setLocError(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ---------------- Step 3: media ----------------
  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setMediaError(null);
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
    const added = await Promise.all(
      picked.map(async (f) => {
        try {
          const blob = await compressPhoto(f);
          return { blob, url: URL.createObjectURL(blob) };
        } catch {
          return null;
        }
      }),
    );
    setPhotos((p) => [...p, ...(added.filter(Boolean) as { blob: Blob; url: string }[])]);
  };

  const addVideo = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setMediaError(null);
    const seconds = await videoDuration(f);
    if (seconds > MAX_VIDEO_SECONDS + 0.5 || f.size > MAX_VIDEO_BYTES) return setMediaError(t("videoTooLong", lang));
    setVideo({ file: f, url: URL.createObjectURL(f) });
  };

  // ---------------- Step 4: the pop-out agent ----------------
  const similarKey = `${d.category}|${d.pos?.lat}|${d.pos?.lng}`;
  useEffect(() => {
    if (d.step !== 4 || !d.category || !d.pos || words(d.description) < 15 || dismissedFor === similarKey) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/similar", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ category: d.category, text: d.description, lat: d.pos!.lat, lng: d.pos!.lng }),
          signal: controller.signal,
        });
        const data = await res.json();
        const now = Date.now();
        setMatches(
          (Array.isArray(data.matches) ? data.matches : []).map((m: Match) => ({
            ...m,
            days_open: Math.max(1, Math.round((now - new Date(m.created_at).getTime()) / 86400000)),
          })),
        );
      } catch {
        /* the form goes on without the pop-out */
      }
    }, 800);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [d.step, d.category, d.pos, d.description, dismissedFor, similarKey]);

  const meToo = async (reportId: string) => {
    if (!userId) {
      setPendingMeToo(reportId);
      setPhase("signin");
      return;
    }
    setBusyMatch(reportId);
    const { error: e } = await supabase.from("supports").insert({ report_id: reportId, frequency: "daily" });
    setBusyMatch(null);
    // Already supported counts as joined, too.
    if (!e || e.code === "23505") {
      setPhase("joined");
      writeStorage(DRAFT_KEY, EMPTY);
    } else setError(t("error", lang));
  };

  // ---------------- Step 8: what Thambi understood ----------------
  const payload = useMemo(
    () => ({
      category: d.category,
      description: d.description,
      road_name: d.road,
      locality: d.locality,
      landmark: d.landmark,
      open_since: d.openSince,
      affected_groups: d.affected,
      citizen_severity: d.severity,
    }),
    [d],
  );

  const loadReading = useCallback(() => {
    if (readingLoading) return;
    setReadingLoading(true);
    fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then((r) => (r.ok ? r.json() : null))
      .then((r: Reading | null) => {
        setReading(r);
        // A plain title even without the AI: "Road or pothole · Raja Muthiah Road".
        setD((p) => {
          if (p.title) return p;
          const cat = CATEGORIES.find((c) => c.value === p.category);
          const fallback = [cat ? cat.label.en : "", p.road || p.locality].filter(Boolean).join(" · ");
          return { ...p, title: (r?.title_en || fallback).slice(0, 140) };
        });
      })
      .catch(() => setReading(null))
      .finally(() => setReadingLoading(false));
  }, [payload, readingLoading]);


  const go = (step: number) => {
    const target = Math.min(TOTAL, Math.max(1, step));
    setD((p) => ({ ...p, step: target }));
    if (target === TOTAL && userId && !reading) loadReading();
  };

  // ---------------- Send ----------------
  const send = async () => {
    if (!userId) return setPhase("signin");
    setError(null);
    setPhase("sending");
    try {
      setProgress(t("sending", lang));
      const { data: report, error: insertError } = await supabase
        .from("reports")
        .insert({
          category: d.category,
          title: d.title.trim() || null,
          description: d.description.trim(),
          location: `SRID=4326;POINT(${d.pos!.lng} ${d.pos!.lat})`,
          road_name: d.road.trim() || null,
          locality: d.locality.trim() || null,
          landmark: d.landmark.trim() || null,
          citizen_severity: d.severity,
          affected_groups: d.affected,
          open_since: d.openSince,
        })
        .select("id")
        .single();
      if (insertError || !report) throw insertError ?? new Error("insert");

      if (photos.length || video) setProgress(t("uploading", lang));
      const uploads = [
        ...photos.map((p, i) => ({ path: `${userId}/${report.id}/photo-${i + 1}.webp`, body: p.blob, type: "image/webp", kind: "photo" })),
        ...(video ? [{ path: `${userId}/${report.id}/video.${video.file.name.split(".").pop()?.toLowerCase() || "mp4"}`, body: video.file, type: video.file.type || "video/mp4", kind: "video" }] : []),
      ];
      for (const u of uploads) {
        const { error: upErr } = await supabase.storage.from("media-private").upload(u.path, u.body, { contentType: u.type, upsert: false });
        if (upErr) throw upErr;
        const { error: rowErr } = await supabase.from("report_media").insert({ report_id: report.id, kind: u.kind, path_private: u.path });
        if (rowErr) throw rowErr;
      }

      const fin = await fetch(`/api/reports/${report.id}/finalize`, { method: "POST" }).then((r) => r.json()).catch(() => ({ state: "pending" }));
      setResult({ id: report.id, state: fin.state ?? "pending" });
      setPhase("done");
      writeStorage(DRAFT_KEY, EMPTY);
    } catch {
      setError(t("error", lang));
      setPhase("form");
    }
  };

  // ---------------- Validation per step ----------------
  const canNext =
    (d.step === 1 && !!d.category) ||
    (d.step === 2 && !!d.pos) ||
    d.step === 3 ||
    (d.step === 4 && d.description.trim().length >= 10) ||
    (d.step === 5 && !!d.openSince) ||
    (d.step === 6 && !!d.severity) ||
    d.step === 7;

  const reset = () => {
    setD(EMPTY);
    setPhotos([]);
    setVideo(null);
    setReading(null);
    setMatches([]);
    setResult(null);
    setPhase("form");
  };

  if (!hydrated) return <div className="mx-auto h-[60vh] w-full max-w-[640px]" />;

  // ---------------- Screens ----------------
  const Header = (
    <header className="mb-6 flex items-center justify-between gap-3">
      <Link href="/" className="text-[20px] font-semibold tracking-[-0.02em]">
        Thambi
      </Link>
    </header>
  );

  if (phase === "signin") {
    return (
      <main className="mx-auto w-full max-w-[640px] px-5 py-6">
        {Header}
        <section className="rise surface rounded-[20px] p-6">
          <h1 ref={headingRef} tabIndex={-1} className="text-[28px] leading-tight tracking-[-0.02em] outline-none">
            {t("signInTitle", lang)}
          </h1>
          <p className="mt-2 font-serif text-ink-64">{t("signInBody", lang)}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary" href={`/login?next=/report/new`} target="_blank" rel="opener">
              {t("signIn", lang)}
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                const { data } = await supabase.auth.getUser();
                if (!data.user) return;
                setUserId(data.user.id);
                setPhase("form");
                if (pendingMeToo) meToo(pendingMeToo);
                else if (d.step === TOTAL && !reading) loadReading();
              }}
            >
              <Check size={18} aria-hidden /> {"I've signed in"}
            </button>
          </div>
          <button type="button" className="btn btn-quiet mt-2" onClick={() => setPhase("form")}>
            <ArrowLeft size={18} aria-hidden /> {t("back", lang)}
          </button>
        </section>
      </main>
    );
  }

  if (phase === "joined" || phase === "done") {
    const live = result?.state === "ok";
    return (
      <main className="mx-auto w-full max-w-[640px] px-5 py-6">
        {Header}
        <section className="rise surface rounded-[20px] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-accent">
            <Check size={24} strokeWidth={2.25} aria-hidden />
          </div>
          <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-[30px] leading-tight tracking-[-0.02em] outline-none">
            {phase === "joined" ? t("joined", lang) : t("doneTitle", lang)}
          </h1>
          <p className="mt-2 font-serif text-[18px] text-ink-64">
            {phase === "joined" ? t("joinedNote", lang) : live ? t("doneLive", lang) : t("doneReview", lang)}
          </p>
          {result && (
            <p className="tabular mt-4 text-[15px] text-ink-50">
              {t("reference", lang)}: THB-{result.id.slice(0, 8).toUpperCase()}
            </p>
          )}
          <button type="button" className="btn btn-secondary mt-6" onClick={reset}>
            {t("another", lang)}
          </button>
        </section>
      </main>
    );
  }

  const sending = phase === "sending";

  return (
    <main className="mx-auto w-full max-w-[640px] px-5 pb-32 pt-6">
      {Header}

      {/* Progress */}
      <div className="mb-6" aria-hidden>
        <div className="flex justify-between text-[14px] text-ink-50">
          <span className="tabular">
            {t("step", lang)} {d.step} {t("of", lang)} {TOTAL}
          </span>
          <span>{t("draftSaved", lang)}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ring-strong)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-transform duration-300 ease-out"
            style={{ width: "100%", transform: `translateX(-${100 - (d.step / TOTAL) * 100}%)` }}
          />
        </div>
      </div>

      <section key={d.step} className="rise">
        {d.step === 1 && (
          <>
            <Question refEl={headingRef} title={t("q1", lang)} hint={t("q1Hint", lang)} />
            <div role="radiogroup" aria-label={t("q1", lang)} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CATEGORIES.map((c) => {
                const Icon = ICONS[c.icon];
                const on = d.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      set("category", c.value);
                      setDismissedFor(null);
                    }}
                    className="choice flex min-h-[104px] flex-col items-start justify-between gap-3 p-4"
                  >
                    <Icon size={26} strokeWidth={1.75} className={on ? "text-accent" : "text-ink-72"} aria-hidden />
                    <span className="text-[17px] font-medium leading-snug">{pick(c.label, lang)}</span>
                    {on && <Check size={16} strokeWidth={2.5} className="absolute right-3 top-3 text-accent" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {d.step === 2 && (
          <>
            <Question refEl={headingRef} title={t("q2", lang)} hint={t("q2Hint", lang)} />
            <MapPicker value={d.pos} flyTo={flyTo} onMove={onMapMove} label={t("q2", lang)} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-secondary" onClick={locate} disabled={locating}>
                {locating ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Crosshair size={18} aria-hidden />}
                {locating ? t("locating", lang) : t("useLocation", lang)}
              </button>
              {d.pos && (
                <span className="tabular text-[14px] text-ink-50">
                  {d.pos.lat.toFixed(5)}, {d.pos.lng.toFixed(5)}
                </span>
              )}
            </div>
            {locError && <p className="mt-2 text-[15px] text-danger">{t("locationDenied", lang)}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("road", lang)} value={d.road} onChange={(v) => set("road", v)} max={120} />
              <Field label={t("locality", lang)} value={d.locality} onChange={(v) => set("locality", v)} max={120} />
              <div className="sm:col-span-2">
                <Field
                  label={t("landmark", lang)}
                  value={d.landmark}
                  onChange={(v) => set("landmark", v)}
                  placeholder={t("landmarkPlaceholder", lang)}
                  max={120}
                />
              </div>
            </div>
          </>
        )}

        {d.step === 3 && (
          <>
            <Question refEl={headingRef} title={t("q3", lang)} hint={t("q3Hint", lang)} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((p, i) => (
                <div key={p.url} className="relative aspect-square overflow-hidden rounded-[12px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`${t("addPhoto", lang)} ${i + 1}`} className="photo-outline h-full w-full rounded-[12px] object-cover" />
                  <button
                    type="button"
                    aria-label={`${t("remove", lang)} ${i + 1}`}
                    onClick={() => setPhotos((all) => all.filter((x) => x.url !== p.url))}
                    className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"
                  >
                    <X size={18} aria-hidden />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="choice flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 text-ink-72">
                  <ImagePlus size={26} strokeWidth={1.75} aria-hidden />
                  <span className="text-[15px] font-medium">{t("addPhoto", lang)}</span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
                </label>
              )}
            </div>
            <div className="mt-4">
              {video ? (
                <div className="relative overflow-hidden rounded-[12px]">
                  <video src={video.url} controls playsInline className="photo-outline max-h-[260px] w-full rounded-[12px] bg-black" />
                  <button
                    type="button"
                    aria-label={`${t("remove", lang)} video`}
                    onClick={() => setVideo(null)}
                    className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"
                  >
                    <X size={18} aria-hidden />
                  </button>
                </div>
              ) : (
                <label className="btn btn-secondary cursor-pointer">
                  <Video size={18} aria-hidden /> {t("addVideo", lang)}
                  <input type="file" accept="video/*" className="sr-only" onChange={(e) => addVideo(e.target.files)} />
                </label>
              )}
            </div>
            {mediaError && <p className="mt-2 text-[15px] text-danger">{mediaError}</p>}
          </>
        )}

        {d.step === 4 && (
          <>
            <Question refEl={headingRef} title={t("q4", lang)} hint={t("q4Hint", lang)} />
            <label className="sr-only" htmlFor="desc">
              {t("q4", lang)}
            </label>
            <textarea
              id="desc"
              rows={6}
              maxLength={2000}
              value={d.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("q4Placeholder", lang)}
              className="field min-h-[180px] resize-y leading-relaxed"
            />
            <div className="mt-1 flex justify-between text-[14px] text-ink-50">
              <span>{d.description.trim().length > 0 && d.description.trim().length < 10 ? t("minChars", lang) : ""}</span>
              <span className="tabular">{d.description.length}/2000</span>
            </div>
            <div aria-live="polite">
              {dismissedFor !== similarKey && (
                <SimilarPanel
                  lang={lang}
                  matches={matches}
                  busyId={busyMatch}
                  onMeToo={meToo}
                  onDismiss={() => {
                    setDismissedFor(similarKey);
                    setMatches([]);
                  }}
                />
              )}
            </div>
          </>
        )}

        {d.step === 5 && (
          <>
            <Question refEl={headingRef} title={t("q5", lang)} />
            <div role="radiogroup" aria-label={t("q5", lang)} className="grid gap-3 sm:grid-cols-2">
              {OPEN_SINCE.map((o) => (
                <Choice key={o.value} on={d.openSince === o.value} onClick={() => set("openSince", o.value)} label={pick(o.label, lang)} />
              ))}
            </div>
          </>
        )}

        {d.step === 6 && (
          <>
            <Question refEl={headingRef} title={t("q6", lang)} />
            <div role="radiogroup" aria-label={t("q6", lang)} className="flex flex-col gap-3">
              {SEVERITY.map((s) => (
                <Choice
                  key={s.value}
                  on={d.severity === s.value}
                  onClick={() => set("severity", s.value)}
                  label={`${s.value} · ${pick(s.label, lang)}`}
                  hint={pick(s.hint, lang)}
                  danger={s.value === 5}
                  sev={s.value as 1 | 2 | 3 | 4 | 5}
                />
              ))}
            </div>
            {d.severity === 5 && (
              <p className="rise mt-4 flex gap-3 rounded-[14px] bg-danger-tint p-4 text-[16px] text-danger" role="note">
                <ShieldAlert size={22} className="shrink-0" aria-hidden />
                {t("emergency", lang)}
              </p>
            )}
          </>
        )}

        {d.step === 7 && (
          <>
            <Question refEl={headingRef} title={t("q7", lang)} hint={t("q7Hint", lang)} />
            <div className="grid grid-cols-2 gap-3">
              {AFFECTED.map((a) => {
                const on = d.affected.includes(a.value);
                return (
                  <button
                    key={a.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set("affected", on ? d.affected.filter((x) => x !== a.value) : [...d.affected, a.value])}
                    className="choice flex min-h-[64px] items-center gap-3 px-4 py-3"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] ${
                        on ? "bg-accent text-white" : "pill bg-surface"
                      }`}
                      aria-hidden
                    >
                      {on && <Check size={16} strokeWidth={2.5} />}
                    </span>
                    <span className="text-[17px] font-medium leading-snug">{pick(a.label, lang)}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {d.step === 8 && (
          <>
            <Question refEl={headingRef} title={t("q8", lang)} hint={t("q8Hint", lang)} />
            {!userId ? (
              <div className="surface rounded-[16px] p-5">
                <p className="font-medium">{t("signInTitle", lang)}</p>
                <p className="mt-1 font-serif text-ink-64">{t("signInBody", lang)}</p>
                <button type="button" className="btn btn-primary mt-4" onClick={() => setPhase("signin")}>
                  {t("signIn", lang)}
                </button>
              </div>
            ) : readingLoading ? (
              <div className="surface flex items-center gap-3 rounded-[16px] p-5 text-ink-64" role="status">
                <Loader2 size={20} className="animate-spin" aria-hidden /> {t("reading", lang)}
              </div>
            ) : !reading ? (
              <div className="surface rounded-[16px] p-5">
                <button type="button" className="btn btn-secondary" onClick={loadReading}>
                  {t("q8", lang)}
                </button>
              </div>
            ) : (
              <div className="surface rounded-[16px] p-5">
                <Field label={t("titleLabel", lang)} value={d.title} onChange={(v) => set("title", v)} max={140} />
                {reading.summary_en && (
                  <p className="mt-4 font-serif text-[17px] text-ink-72">{reading.summary_en}</p>
                )}
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[14px] text-ink-50">{t("yourSeverity", lang)}</dt>
                    <dd className="mt-1 font-medium">
                      {d.severity && (
                        <span className={`chip ${SEVERITY_VISUAL[d.severity as 1 | 2 | 3 | 4 | 5].chip}`}>
                          {(() => { const V = SEVERITY_VISUAL[d.severity as 1 | 2 | 3 | 4 | 5].icon; return <V size={16} weight="bold" aria-hidden />; })()}
                          {d.severity} · {SEVERITY_VISUAL[d.severity as 1 | 2 | 3 | 4 | 5].word}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[14px] text-ink-50">{t("thambiSeverity", lang)}</dt>
                    <dd className="mt-1 font-medium">
                      {reading.text_severity ? (
                        <span className={`chip ${SEVERITY_VISUAL[reading.text_severity as 1 | 2 | 3 | 4 | 5].chip}`}>
                          {(() => { const V = SEVERITY_VISUAL[reading.text_severity as 1 | 2 | 3 | 4 | 5].icon; return <V size={16} weight="bold" aria-hidden />; })()}
                          {reading.text_severity} · {SEVERITY_VISUAL[reading.text_severity as 1 | 2 | 3 | 4 | 5].word}
                        </span>
                      ) : "—"}
                    </dd>
                    {reading.severity_reason && <dd className="mt-1 font-serif text-[15px] text-ink-64">{reading.severity_reason}</dd>}
                  </div>
                </dl>
                {reading.danger_flags.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[14px] text-ink-50">{t("dangers", lang)}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {reading.danger_flags.map((f) => (
                        <li key={f} className="rounded-full bg-danger-tint px-3 py-1 text-[15px] font-medium text-danger">
                          {DANGER_LABELS[f] ? pick(DANGER_LABELS[f], lang) : f.replace(/_/g, " ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-5 text-[14px] text-ink-50">
                  {reading.source === "keywords" ? t("keywordsOnly", lang) : t("aiNote", lang)}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {error && (
        <p className="mt-4 rounded-[12px] bg-danger-tint p-3 text-[16px] text-danger" role="alert">
          {error}
        </p>
      )}

      {/* Sticky actions within thumb reach */}
      <nav className="fixed inset-x-0 bottom-0 z-[600] border-t border-[var(--ring)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[640px] items-center justify-between gap-3 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <button type="button" className="btn btn-quiet" onClick={() => go(d.step - 1)} disabled={d.step === 1 || sending}>
            <ArrowLeft size={18} aria-hidden /> {t("back", lang)}
          </button>
          <div className="flex items-center gap-2">
            {(d.step === 3 || d.step === 7) && (
              <button type="button" className="btn btn-quiet" onClick={() => go(d.step + 1)}>
                {t("skip", lang)}
              </button>
            )}
            {d.step < TOTAL ? (
              <button type="button" className="btn btn-primary min-w-[132px]" onClick={() => go(d.step + 1)} disabled={!canNext}>
                {t("next", lang)}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary min-w-[160px]"
                onClick={send}
                disabled={sending || !userId || readingLoading || !reading || !d.category || !d.pos || !d.severity || !d.openSince}
              >
                {sending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden /> {progress}
                  </>
                ) : (
                  t("send", lang)
                )}
              </button>
            )}
          </div>
        </div>
      </nav>
    </main>
  );
}

function Question({ title, hint, refEl }: { title: string; hint?: string; refEl: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="mb-5">
      <h1 ref={refEl} tabIndex={-1} className="text-[clamp(28px,6vw,36px)] leading-[1.08] tracking-[-0.02em] outline-none">
        {title}
      </h1>
      {hint && <p className="mt-2 font-serif text-[18px] text-ink-64">{hint}</p>}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, max,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; max: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[15px] font-medium text-ink-72">{label}</span>
      <input className="field" value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Choice({
  on, onClick, label, hint, danger, sev,
}: { on: boolean; onClick: () => void; label: string; hint?: string; danger?: boolean; sev?: 1 | 2 | 3 | 4 | 5 }) {
  const SevIcon = sev ? SEVERITY_VISUAL[sev].icon : null;
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className="choice flex min-h-[64px] items-center gap-4 px-4 py-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${on ? "bg-accent text-white" : "pill bg-surface"}`}
        aria-hidden
      >
        {on && <Check size={15} strokeWidth={2.75} />}
      </span>
      <span className="flex flex-col">
        <span className="flex items-center gap-2">
          {sev && SevIcon && (
            <span className={`chip ${SEVERITY_VISUAL[sev].chip}`}>
              <SevIcon size={16} weight="bold" aria-hidden />
              {sev}
            </span>
          )}
          <span className={`text-[17px] font-medium leading-snug ${danger ? "text-danger" : ""}`}>{label}</span>
        </span>
        {hint && <span className="font-serif text-[15px] text-ink-64">{hint}</span>}
      </span>
    </button>
  );
}
