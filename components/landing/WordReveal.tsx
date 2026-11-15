"use client";

import { useEffect, useRef } from "react";

// Tagline reveal: every word starts muted and lights up in reading order as it
// crosses a trigger line in the lower part of the screen. One observer, no scroll listener.
export default function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean) as HTMLSpanElement[];
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("on"));
      return;
    }
    let lit = 0;
    const io = new IntersectionObserver(
      (entries) => {
        // Light words in order: a word lights only after every word before it.
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = nodes.indexOf(e.target as HTMLSpanElement);
          if (idx === lit) {
            nodes[idx].classList.add("on");
            lit += 1;
            while (lit < nodes.length && nodes[lit].getBoundingClientRect().top < window.innerHeight * 0.65) {
              nodes[lit].classList.add("on");
              lit += 1;
            }
          }
        }
        if (lit >= nodes.length) io.disconnect();
      },
      { rootMargin: "0px 0px -35% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [text]);

  return (
    <p className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} ref={(el) => { refs.current[i] = el; }} className="word" aria-hidden="true">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
