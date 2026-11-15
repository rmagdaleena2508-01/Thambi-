import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in — Thambi" };

// Reads ?next= and ?error= at request time; the rest of the page is static.
async function LoginBody({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const raw = typeof params.next === "string" ? params.next : "/report/new";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/report/new";
  return <LoginForm next={next} linkError={params.error === "link"} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-5 py-10">
      <Link href="/" className="text-[20px] font-semibold tracking-[-0.02em]">
        Thambi
      </Link>
      <section className="rise surface mt-6 rounded-[20px] p-6">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em]">Sign in</h1>
        <p lang="ta" className="mt-1 text-ink-64">உள்நுழையவும்</p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-[260px]" />}>
            <LoginBody searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
