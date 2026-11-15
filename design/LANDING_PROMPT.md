# Thambi landing page: prompt and design plan

## 1. Prompt to give the builder (the draft)

Act as a senior product designer and front-end developer at a small studio that builds premium, scroll-led marketing sites for developer and civic products. Build the Thambi landing page.

**Product.** Thambi is a website where people in Tamil Nadu report broken roads, water leaks, sewage and pollution with a few taps. It rates how serious a problem is from the person's own words, joins them with neighbours who report the same thing, sends the report to the office that must act with a ready-to-send complaint, and keeps the problem public until it is fixed. Version one is English only. It is not an app and it does not replace the official helplines.

**Audience.** Three visitors arrive, and each must understand the product within one screen: a commuter who hits the same pothole every week, a parent or elderly resident who wants a simple way to be heard, and a residents' association or ward officer who needs one clear case instead of fifty scattered calls.

**Job of the page.** One primary action: "Report a problem". One secondary action: "See what is being fixed". Every section must earn its place by answering one question a visitor has. No section repeats another.

**Visual direction.**
- Background white. Text near-black. One accent blue used only for links and selected states.
- Typeface: Geist for everything. It is the typeface of Stick It Up, which the client admires for its premium feel. Geist Mono only for code or numbers that must line up.
- Headlines large and tight. Body copy comfortable to read, at least 18px on mobile.
- Feel: calm, confident, a little playful, never noisy. No stock photos. No gradients on backgrounds.
- Motion: sections rise and blur into focus once as they enter the viewport. A tagline section reveals word by word as the reader scrolls. Respect reduced motion. No scroll-jacking.

**Sections, in order.**
1. Hero. Headline "Tell Thambi. It gets taken care of." Subheadline in one sentence that says what Thambi does. Primary button "Report a problem", secondary "See what is being fixed". Proof line taken from real data (see section 4).
2. A live report card that looks like a real report, with the author's own seed reports labelled as such.
3. The problem, stated plainly with the real gaps: complaints closed without a fix, offices passing a road between them, no way to see what happened.
4. "Stick it anywhere" equivalent: the report flow in four taps, with a phone frame showing step 2 of the form.
5. Interactive moment: a text box where a visitor types a sentence and a matching neighbour report appears underneath. This is the duplicate-detection pop-out, shown with seed data.
6. Tagline reveal (large type, scroll-driven word colour change): "Every report stays public until it is fixed."
7. How it works: three steps. Use numbers only because the order matters.
8. Who it is for: three cards, one per visitor type, each in their own words.
9. Honest status: what is live, what is not yet, what is verified and when. Real numbers only.
10. FAQ, six questions, honest answers: does it send reports to government automatically (no), is my name public (yes, on the report, not the email), is it in Tamil (not yet, planned), does AI look at my photos (not in this version).
11. Final call to action, identical to the hero.
12. Footer: privacy, licence, source list, GitHub link, contact.

**Rules for the copy.**
- Plain English, short sentences, active voice.
- No hyphens inside body text. No orphaned single words on the last line.
- No "seamless", "elevate", "unleash", "game changer". No placeholder brands. No round fake numbers.
- Every claim must be true today. If something is planned, say "planned".

**Ship requirements.** Semantic HTML with one main landmark. Skip-to-content link. Visible focus rings. Alt text on every image. Title, meta description and social image. Works at 360px wide with no horizontal scrolling. Under 200 KB of JavaScript on the first screen.

**Deliver** an outline, the copy for each section, then build section by section, reviewing each against the rules before starting the next.

---

## 2. Design plan (how the skills shape it)

Skills used: `landing-page-design` (structure, type scale, spacing, motion, copy), `frontend-design` (concept, restraint, self-critique), `make-interfaces-feel-better` (polish). Stick It Up is the reference for structure and scroll rhythm. Its dark theme is not used, because the client asked for white.

### 2.1 Where the two skills and the brief agree and differ

| Point | Source | Decision |
|---|---|---|
| Typeface | Client loves Stick It Up's Geist. `landing-page-design` allows Geist. | Geist, one family. |
| Background | Client: white. Stick It Up: near-black. | White. Dark mode later if asked. |
| Hero heading colour | `landing-page-design` B5 gradient on heading text, #000 to #666 in light theme. | Use it, on text only. |
| Background gradients | `landing-page-design` B4 forbids them. | None. |
| Borders | Only all-round, never one side. | Hairline rings, not single-side rules. |
| Icons | Phosphor, Solar or Iconamoon. Not Material. | Phosphor. |
| Italics, font weight 900 | Forbidden. | Forbidden. |
| Numbered markers | `frontend-design`: only where order matters. | Only in "How it works". |
| Real numbers | `landing-page-design` B8: no round fake numbers. | Use real facts: "31 of 50 official contacts checked against each office's own website". |
| Fonts: design-dna default | `design-dna` says Instrument Sans. | Overridden by the client's choice of Geist. Stated here. |
| Tagline reveal | `landing-page-design` B11 mandatory. Matches Stick It Up's scroll. | Include. Use IntersectionObserver, not a scroll listener. |

### 2.2 Type scale (Tailwind steps only)

- Hero headline: `text-7xl` (72px), line height 1, tracking tight, max width 680px.
- Section headline: `text-5xl` (48px), line height 1.
- Tagline reveal: `text-6xl` (60px) on desktop, `text-4xl` (36px) on mobile.
- Body: `text-lg` (18px), line height 28px. Mobile body never below `text-base`.
- Captions and labels: `text-sm` (14px).
- Button text: `text-base` semibold (main), `text-sm` semibold (header).

### 2.3 Spacing and radius

- Section padding: 96px (`Spacing-900`) top and bottom on desktop, 64px on mobile.
- Card padding: 24px (`Spacing-300`). Gap between cards: 24px.
- Nested radius: outer card `rounded-2xl` (16px) with 8px padding gives inner `rounded-lg` (8px).
- Main buttons: 8px vertical, 12px horizontal padding plus the text height, so about 48px tall.

### 2.4 Section concepts (one memorable thing)

The signature is the tagline reveal: the large sentence the reader is "reading out loud" as they scroll. It is the one place where the page moves a lot. Everything else stays quiet.

Wireframe sketch (desktop, top to bottom):

```
+--------------------------------------------------------------+
| Thambi                          [See what is being fixed] [Report a problem] |
+--------------------------------------------------------------+
|                  Tell Thambi.                                 |
|            It gets taken care of.                             |
|   One sentence about what it does.                            |
|   [ Report a problem ]   See what is being fixed              |
|   31 of 50 official contacts checked against each office's    |
|   own website.                                                |
+--------------------------------------------------------------+
|  [ live report card ]              [ text: what happens ]    |
+--------------------------------------------------------------+
|  The problem: three gaps, one line each                       |
+--------------------------------------------------------------+
|  Phone frame, step 2 of 8          Four taps, plain words     |
+--------------------------------------------------------------+
|  Type a sentence  -> matching neighbour report appears        |
+--------------------------------------------------------------+
|   Every report stays public until it is fixed.                |
|   (words light up one by one as you scroll)                   |
+--------------------------------------------------------------+
|  1 Report   2 Neighbours join   3 Office gets it              |
+--------------------------------------------------------------+
|  Commuter   |   Resident   |   Residents' association         |
+--------------------------------------------------------------+
|  What is live, what is planned, when each was checked         |
+--------------------------------------------------------------+
|  FAQ (six questions)                                          |
+--------------------------------------------------------------+
|                 Ready to report a problem?                    |
|                 [ Report a problem ]                          |
+--------------------------------------------------------------+
| Privacy   Licence   Sources   GitHub                          |
+--------------------------------------------------------------+
```

### 2.5 Self-critique (before building)

- Generic risk: a white hero, a three-card grid and an FAQ is what every landing page looks like. The signature (word-by-word tagline and the live pop-out) is what makes this one different. Keep those two; cut anything else that does not help a visitor decide.
- Honesty risk: "Stick it anywhere" and "Sponsors" sections on Stick It Up do not apply. Thambi has no sponsors. Replaced by the status section, which is the strongest trust signal available.
- Motion risk: keep one entrance per section. No parallax. No hover effects that move the whole card.

### 2.6 What I need from you before building

1. Confirm white background, Geist, English-only copy for v1.
2. Confirm the real facts to show. Current honest numbers: 46 official contacts extracted, 31 verified against each office's own site, 14 uncertain, 5 not yet checked.
3. Confirm the three seed reports from your own route can be shown publicly, labelled as yours.
4. Say yes to the outline above, or tell me which section to cut or add.

Once you approve, I build section by section in the order `landing-page-design` A6 gives (hero, benefits, how it works, proof, FAQ, final call to action), with the tagline reveal built alongside the hero.
