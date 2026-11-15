export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Coming soon · விரைவில்</p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Thambi</h1>
      <p lang="ta" className="mt-2 text-2xl text-neutral-700 [font-family:var(--font-tamil)]">
        தம்பி கிட்ட சொல்லுங்க
      </p>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-600">
        Tell Thambi. It gets taken care of. Report broken roads, water leaks and sewage in Tamil Nadu,
        and see them tracked in public until they are fixed.
      </p>
    </main>
  );
}
