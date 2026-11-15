import Link from "next/link";
import {
  ArrowRight, CheckCircle, Camera, MapPin, Users, WarningCircle, Circle, SealCheck, PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import Reveal from "@/components/landing/Reveal";
import WordReveal from "@/components/landing/WordReveal";
import SimilarDemo from "@/components/landing/SimilarDemo";

const GITHUB = "https://github.com/rmagdaleena2508-01/thambi";
const CONTACT_ISSUE = `${GITHUB}/issues/new?template=wrong-authority-contact.md`;

const problems = [
  {
    title: "Closed without a fix",
    body: "A water complaint was closed with a note that a drain must be built first. The road was never checked.",
  },
  {
    title: "Passed between offices",
    body: "A road can sit between the Corporation, Metro Water and Metro Rail. Nobody says whose it is.",
  },
  {
    title: "No way to see what happened",
    body: "Citizens rarely see whether their pothole was fixed. Only the office knows.",
  },
];

const steps = [
  { title: "Report", body: "Pick the problem, drop a pin on the map, describe it in plain words, and send." },
  { title: "Neighbours join", body: "Thambi finds reports of the same problem nearby, so people add their voice instead of filing a copy." },
  { title: "The office gets it", body: "A formal complaint goes to the office that must act, with the public link and the count of who is affected." },
];

const visitors = [
  {
    title: "Commuters",
    body: "Hit the same pothole every week? Report it once, then tap Me too each time you pass it.",
  },
  {
    title: "Parents and older residents",
    body: "Describe it in your own words. Your display name appears on the report, never your email address.",
  },
  {
    title: "Residents' associations and ward officers",
    body: "One clear case with a count of who is affected, instead of fifty scattered calls.",
  },
];

const faqs = [
  {
    q: "Does Thambi send my report to the government?",
    a: "No. Thambi writes a formal complaint and shows you the official channel to send it through. Nothing is sent automatically.",
  },
  {
    q: "Is my name public?",
    a: "Your display name appears on the report you file. Your email address never does.",
  },
  {
    q: "Does the AI look at my photos?",
    a: "Not in this version. The AI reads the words you write. Photos and videos are evidence for neighbours and officials.",
  },
  {
    q: "Is it available in Tamil?",
    a: "Not yet. The first version is in English. A Tamil interface is planned for a later version.",
  },
  {
    q: "What if a report is wrong?",
    a: "A person checks reports before they go public. If an office contact is wrong, anyone can report it with a link to the official page.",
  },
  {
    q: "Is it free?",
    a: "Yes. The code is open source under the MIT licence, and you can read how every contact was checked.",
  },
];

export default function Home() {
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>

      <header className="sticky top-0 z-50 border-b border-[var(--ring)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md">
        <nav aria-label="Main" className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-[20px] font-semibold tracking-[-0.02em]">Thambi</Link>
          <div className="flex items-center gap-2">
            <a href="#status" className="btn btn-quiet hidden sm:inline-flex">Status</a>
            <Link href="/report/new" className="btn btn-primary min-h-[44px] whitespace-nowrap px-4 text-[15px]"><span className="sm:hidden">Report</span><span className="hidden sm:inline">Report a problem</span></Link>
          </div>
        </nav>
      </header>

      <main id="main" className="flex-1">
        {/* 1. Hero */}
        <section className="mx-auto w-full max-w-[1120px] px-5 pb-20 pt-20 sm:pt-28">
          <Reveal>
            <p className="text-[15px] font-medium text-ink-64">Tamil Nadu · Civic problems, kept public</p>
            <h1 className="heading-grad mt-4 max-w-[680px] text-[clamp(44px,8vw,72px)] font-semibold leading-[1.0] tracking-[-0.03em]">
              Tell Thambi. It gets taken care of.
            </h1>
            <p className="mt-6 max-w-[680px] text-[clamp(18px,2.2vw,20px)] leading-[1.6] text-ink-72">
              Report a broken road, a water leak or sewage in a few taps. Thambi reads how serious it is, joins your
              neighbours who report the same thing, and keeps it public until it is fixed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/report/new" className="btn btn-primary">
                Report a problem <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
              <a href="#status" className="btn btn-secondary">See what is being fixed</a>
            </div>
            <p className="tabular mt-8 max-w-[680px] text-[15px] text-ink-64">
              31 of 50 official contacts checked against each office&apos;s own website. Last checked 15 November 2026.
            </p>
          </Reveal>
        </section>

        {/* 2. A report, in plain words */}
        <section aria-labelledby="example-title" className="border-t border-[var(--ring)] bg-[var(--surface-tint)]">
          <div className="mx-auto grid w-full max-w-[1120px] gap-12 px-5 py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Reveal>
              <h2 id="example-title" className="text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
                A report, in plain words.
              </h2>
              <p className="mt-5 max-w-[520px] text-[18px] leading-[1.6] text-ink-72">
                Every report shows what the citizen said, how serious Thambi reads it, and where it has been sent.
                Nothing is hidden, and every change is recorded.
              </p>
            </Reveal>
            <Reveal>
              <article className="surface rounded-[20px] p-6 sm:p-8" aria-label="Example report">
                <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-50">Example, not a real report</p>
                <h3 className="mt-2 text-[24px] font-semibold leading-tight">Deep pit near the signal, Raja Muthiah Road</h3>
                <dl className="mt-6 grid grid-cols-2 gap-5">
                  <div>
                    <dt className="text-[14px] text-ink-64">Your rating</dt>
                    <dd className="mt-1"><span className="chip sev-4">4 · People could get hurt</span></dd>
                  </div>
                  <div>
                    <dt className="text-[14px] text-ink-64">Thambi reads your words</dt>
                    <dd className="mt-1"><span className="chip sev-3">3 · Damages vehicles</span></dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[14px] text-ink-64">Dangers noticed</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[var(--danger-tint)] px-3 py-1 text-[15px] font-medium text-[var(--danger)]">Open pit</span>
                      <span className="rounded-full bg-[var(--danger-tint)] px-3 py-1 text-[15px] font-medium text-[var(--danger)]">No barricade</span>
                    </dd>
                  </div>
                </dl>
                <ol className="mt-8 flex flex-wrap gap-2 border-t border-[var(--ring-strong)] pt-6" aria-label="Status history">
                  <li className="chip chip-reported"><Circle size={16} weight="bold" aria-hidden />Reported</li>
                  <li className="chip chip-verified"><SealCheck size={16} weight="bold" aria-hidden />Verified</li>
                  <li className="chip chip-sent"><PaperPlaneTilt size={16} weight="bold" aria-hidden />Sent to office</li>
                  <li className="chip chip-fixed"><CheckCircle size={16} weight="bold" aria-hidden />Fixed, confirmed by neighbours</li>
                </ol>
              </article>
            </Reveal>
          </div>
        </section>

        {/* 3. The problem */}
        <section aria-labelledby="problem-title" className="mx-auto w-full max-w-[1120px] px-5 py-24">
          <Reveal>
            <h2 id="problem-title" className="max-w-[680px] text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Complaints go in. Nothing comes back.
            </h2>
            <p className="mt-4 max-w-[600px] text-[18px] leading-[1.6] text-ink-72">
              These gaps come from Chennai news reports and residents&apos; accounts from 2023 and 2024.
            </p>
          </Reveal>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {problems.map((p) => (
              <li key={p.title}><Reveal className="surface rounded-[18px] p-6">
                <WarningCircle size={26} weight="duotone" className="text-[var(--danger)]" aria-hidden />
                <h3 className="mt-4 text-[20px] font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-ink-72">{p.body}</p>
              </Reveal></li>
            ))}
          </ul>
        </section>

        {/* 4. Four taps */}
        <section aria-labelledby="flow-title" className="border-t border-[var(--ring)] bg-[var(--surface-tint)]">
          <div className="mx-auto grid w-full max-w-[1120px] gap-12 px-5 py-24 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="surface mx-auto w-full max-w-[300px] rounded-[36px] p-4">
                <div className="flex h-[520px] flex-col rounded-[26px] bg-[var(--bg)] p-5">
                  <p className="text-[13px] font-medium text-ink-50">Step 2 of 8</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ring-strong)]">
                    <div className="h-full w-1/4 rounded-full bg-[var(--btn-dark)]" />
                  </div>
                  <p className="mt-5 text-[22px] font-semibold leading-tight">Where is it?</p>
                  <div className="relative mt-4 flex-1 rounded-[16px] bg-[var(--surface-2)]" aria-hidden>
                    <MapPin size={36} weight="fill" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-[var(--danger)]" />
                  </div>
                  <div className="mt-4 rounded-[12px] bg-[var(--surface)] p-3 text-[15px] text-ink-72 shadow-[var(--shadow-pill)]">Raja Muthiah Road</div>
                  <div className="mt-3 flex justify-end">
                    <span className="btn btn-primary min-h-[44px] px-5 text-[15px]">Next</span>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <h2 id="flow-title" className="text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Report in a few taps, in plain words.
              </h2>
              <ul className="mt-8 space-y-5">
                {[
                  { icon: Circle, text: "Pick the problem from nine clear choices." },
                  { icon: MapPin, text: "Move the map so the pin sits on the exact spot." },
                  { icon: Camera, text: "Add up to four photos or one short video. Both are optional." },
                  { icon: Users, text: "Describe it. Thambi shows matching reports before you send." },
                ].map((item) => (
                  <li key={item.text} className="flex gap-4 text-[18px] leading-[1.55]">
                    <item.icon size={24} weight="regular" className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/report/new" className="btn btn-primary mt-10">
                Start a report <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* 5. Interactive: the pop-out */}
        <section aria-labelledby="demo-title" className="mx-auto w-full max-w-[1120px] px-5 py-24">
          <Reveal>
            <h2 id="demo-title" className="max-w-[680px] text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Someone already reported it? Add your voice instead.
            </h2>
            <p className="mt-4 max-w-[600px] text-[18px] leading-[1.6] text-ink-72">
              Try it. Type what you see. Thambi looks for matching reports nearby before you send a second one.
            </p>
          </Reveal>
          <Reveal className="mt-10 max-w-[720px]">
            <SimilarDemo />
          </Reveal>
        </section>

        {/* 6. Tagline reveal */}
        <section aria-label="Our promise" className="border-y border-[var(--ring)] py-28">
          <div className="mx-auto w-full max-w-[1000px] px-5">
            <WordReveal
              text="Every report stays public until it is fixed."
              className="text-[clamp(36px,6vw,60px)] font-semibold leading-[1.1] tracking-[-0.025em]"
            />
          </div>
        </section>

        {/* 7. How it works */}
        <section aria-labelledby="how-title" className="mx-auto w-full max-w-[1120px] px-5 py-24">
          <Reveal>
            <h2 id="how-title" className="max-w-[680px] text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Three steps, in order.
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}><Reveal className="surface rounded-[18px] p-6">
                <span className="tabular flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[15px] font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-[20px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-ink-72">{s.body}</p>
              </Reveal></li>
            ))}
          </ol>
        </section>

        {/* 8. Who it is for */}
        <section aria-labelledby="who-title" className="border-t border-[var(--ring)] bg-[var(--surface-tint)]">
          <div className="mx-auto w-full max-w-[1120px] px-5 py-24">
            <Reveal>
              <h2 id="who-title" className="max-w-[680px] text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
                Built for the person who has to live with it.
              </h2>
            </Reveal>
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {visitors.map((v) => (
                <li key={v.title}><Reveal className="surface rounded-[18px] p-6">
                  <h3 className="text-[20px] font-semibold leading-snug">{v.title}</h3>
                  <p className="mt-3 text-[16px] leading-[1.6] text-ink-72">{v.body}</p>
                </Reveal></li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9. Honest status */}
        <section id="status" aria-labelledby="status-title" className="mx-auto w-full max-w-[1120px] px-5 py-24">
          <Reveal>
            <h2 id="status-title" className="max-w-[680px] text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
              What is live, and what is not yet.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Reveal className="surface rounded-[18px] p-6">
              <span className="chip chip-fixed">Built and tested</span>
              <p className="mt-3 text-[16px] leading-[1.6] text-ink-72">
                The eight-step report form, the duplicate check, Me too, and the locked status history. Tested in a
                browser with test accounts.
              </p>
            </Reveal>
            <Reveal className="surface rounded-[18px] p-6">
              <span className="chip chip-verified">Contacts checked</span>
              <p className="tabular mt-3 text-[16px] leading-[1.6] text-ink-72">
                31 verified against each office&apos;s own website. 14 uncertain and not used for routing. 5 not checked yet.
              </p>
              <a href={`${GITHUB}#65-data-cautions-and-known-gaps`} className="mt-4 inline-block text-[15px] font-medium text-[var(--accent)] underline underline-offset-4">
                See every uncertain contact
              </a>
            </Reveal>
            <Reveal className="surface rounded-[18px] p-6">
              <span className="chip chip-progress">Planned</span>
              <ul className="mt-3 space-y-2 text-[16px] text-ink-72">
                <li>A Tamil interface</li>
                <li>AI reading of photos and videos</li>
                <li>Blur for faces and number plates</li>
                <li>Monsoon mode and ward report cards</li>
              </ul>
            </Reveal>
          </div>
        </section>

        {/* 10. FAQ */}
        <section aria-labelledby="faq-title" className="mx-auto w-full max-w-[860px] px-5 py-24">
          <Reveal>
            <h2 id="faq-title" className="text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Questions people ask first.
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-[var(--ring-strong)] border-y border-[var(--ring-strong)]">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-medium">
                  {f.q}
                  <span aria-hidden className="text-[22px] text-ink-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-[680px] text-[17px] leading-[1.6] text-ink-72">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 11. Final call to action */}
        <section aria-labelledby="final-title" className="bg-[var(--brand-deep)] text-white">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start gap-8 px-5 py-24 md:flex-row md:items-center md:justify-between">
            <Reveal>
              <h2 id="final-title" className="text-[clamp(32px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                Ready to report a problem?
              </h2>
              <p className="mt-4 max-w-[520px] text-[18px] leading-[1.6] text-white/90">
                It takes a few minutes. You can keep your draft on this device until you send.
              </p>
            </Reveal>
            <Reveal>
              <Link href="/report/new" className="btn bg-white text-[var(--brand-deep)]">
                Report a problem <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--ring)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 py-10 text-[15px] text-ink-64 md:flex-row md:items-center md:justify-between">
          <p>Thambi is an open project under the MIT licence.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            <a href={GITHUB} className="underline underline-offset-4 hover:text-ink">GitHub</a>
            <a href={`${GITHUB}#credits-and-sources`} className="underline underline-offset-4 hover:text-ink">Sources</a>
            <a href={`${GITHUB}#65-data-cautions-and-known-gaps`} className="underline underline-offset-4 hover:text-ink">Data cautions</a>
            <a href={CONTACT_ISSUE} className="underline underline-offset-4 hover:text-ink">Report a wrong contact</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
