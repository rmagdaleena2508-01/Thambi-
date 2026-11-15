import Link from "next/link";

// Branded 404. Says what happened and gives the one next step.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-start justify-center px-5 py-24">
      <p className="text-sm font-medium text-ink-64">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-[-0.02em] md:text-5xl">This page is not here.</h1>
      <p className="mt-4 text-lg leading-[1.6] text-ink-72">
        The link may be old, or the report may have been hidden for review. You can start a new report or go back to the start.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/report/new" className="btn btn-primary">Report a problem</Link>
        <Link href="/" className="btn btn-secondary">Back to the start</Link>
      </div>
    </main>
  );
}
