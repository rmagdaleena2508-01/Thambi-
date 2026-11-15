import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="text-[14px] uppercase tracking-[0.2em] text-ink-50">Tamil Nadu</p>
      <h1 className="rise mt-4 text-[clamp(44px,9vw,72px)] leading-[0.98] tracking-[-0.03em]">Thambi</h1>
      <p className="rise mt-6 max-w-[520px] font-serif text-[19px] leading-relaxed text-ink-64" style={{ animationDelay: "160ms" }}>
        Tell Thambi. It gets taken care of. Report broken roads, water leaks and sewage, and see them tracked in public
        until they are fixed.
      </p>
      <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
        <Link href="/report/new" className="btn btn-primary">
          Report a problem
        </Link>
      </div>
    </main>
  );
}
