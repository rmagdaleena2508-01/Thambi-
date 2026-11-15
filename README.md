<div align="center">

# Thambi

### Tell Thambi. It gets taken care of.

**A transparent civic grievance and infrastructure triage platform for Tamil Nadu.**
Citizens report broken roads, water leaks, sewage and pollution with photos and video.
Thambi's AI checks the report, rates how serious it is, joins it with neighbours' reports,
sends it to the office that must fix it, and keeps it public until it is fixed.

![Status](https://img.shields.io/badge/status-planning-orange)
![Hackathon](https://img.shields.io/badge/IDEA%2F%2FFORGE-Track%201%20%C2%B7%20Civic%20Pulse-blue)
![Region](https://img.shields.io/badge/region-Tamil%20Nadu-red)
![Languages](https://img.shields.io/badge/languages-Tamil%20%7C%20English-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

[The idea](#the-idea) ·
[Why Thambi](#why-thambi) ·
[How it works](#how-it-works) ·
[Data](#data) ·
[Security and privacy](#security-and-privacy) ·
[Roadmap](#roadmap) ·
[Documents](#documents)

</div>

---

## Table of contents

1. [The idea](#the-idea)
2. [Why the name](#why-the-name)
3. [Why Thambi](#why-thambi)
   - [What people can't get across today](#what-people-cant-get-across-today)
   - [How Thambi solves it](#how-thambi-solves-it)
   - [Thambi doesn't replace anything. It fills the gap.](#thambi-doesnt-replace-anything-it-fills-the-gap)
   - [A better Tamil Nadu](#a-better-tamil-nadu)
4. [How it works](#how-it-works)
5. [Features](#features)
6. [Data](#data)
   - [6.1 What data Thambi needs](#61-what-data-thambi-needs)
   - [6.2 How we approach each piece](#62-how-we-approach-each-piece)
   - [6.3 How trustworthy each piece must be](#63-how-trustworthy-each-piece-must-be)
   - [6.4 Authority contacts: why, how, and how accurate](#64-authority-contacts-why-how-and-how-accurate)
7. [Security and privacy](#security-and-privacy)
8. [Tech stack](#tech-stack)
9. [Roadmap](#roadmap)
10. [Documents](#documents)
11. [Contributing](#contributing)
12. [Credits and sources](#credits-and-sources)
13. [License](#license)

---

## The idea

Thambi is a website where citizens report civic problems — damaged roads, open pits, water leaks, sewage overflow, garbage, pollution — using photos and short videos. It:

- **rates how serious each problem is**, using the citizen's own judgement, an AI that reads their description, and their neighbours' votes (photos and videos are evidence for people; AI reading of images comes in version 2);
- **finds reports of the same problem nearby** while the citizen is still typing, so they can add their support instead of filing a duplicate;
- **sends it to the right authority** — the Corporation, Metro Water, the Pollution Control Board, Highways, Metro Rail — with a ready-to-send complaint;
- **shows a public dashboard of complaints and fixes**, as simple to scroll as a social media feed, in Tamil and English.

Thambi is being built for the **IDEA//FORGE Online Hackathon**, Track 1 (Civic Pulse: Digital Governance & Public Information), Problem 2: *Transparent Civic Grievance & Infrastructure Triage System.* It starts in Chennai and is designed for all of Tamil Nadu.

## Why the name

*Thambi* means younger brother in Tamil. In a Tamil household, when something breaks — a leaking pipe, a tripped switch — someone says *"tell Thambi, he'll take care of it."* The family trusts him to get it done. That is what this platform should feel like for a city.

---

## Why Thambi

### What people can't get across today

Chennai already has complaint channels: the 1913 helpline, the Namma Chennai app, Metro Water's 1916 and 044-4567 4567, the CM Helpline 1100, and the official handles on X. People use them. Yet news reports and residents' own words show the same problems again and again:

| What people say | What it means |
|---|---|
| **"They closed my complaint, but nothing was fixed."** A water-logging complaint was closed with the reply that a stormwater drain must be built first. | A ticket can be marked done without the problem being done. |
| **"The ward said it's not their area."** Complaints get closed citing jurisdiction — Corporation, neighbouring corporation, Metro Water, Highways. | Citizens can't know which office owns a road. Offices pass the problem around. |
| **"We used to be able to reopen it. Now we can't."** | There is no easy way to say "this is not fixed". |
| **"Only tweeting works."** Tagging the official handle can get a fix in hours. | That works for people with followers and Twitter skills — not for an elderly resident or a daily-wage worker. |
| **"Fifty people complained. Nobody knows."** Each complaint is a separate private ticket with its own reference number. | Shared pain stays invisible. Fifty voices look like one. |
| **"We never see what happened."** Officials see counts of received, resolved and pending complaints. | Citizens never see public proof that *their* pothole was fixed. |

Shouting on social media is loud, but it is scattered, unstructured, and easy to miss. A post doesn't carry an exact location, a category, the responsible department, evidence, or a count of how many people are affected. So it rarely reaches the person who can act — and when it does, nobody can see what happened next.

### How Thambi solves it

| Gap | What Thambi does |
|---|---|
| Closed without a fix | A report can only become **Fixed** with an after-photo at the same spot. Then neighbours are asked: *"Is it really fixed?"* |
| Wrong department | Thambi routes using the **exact map pin**, the problem type and a verified authority table — and shows *why* it chose that office. |
| Can't reopen | If enough neighbours say it isn't fixed, the report **reopens automatically**, in public. |
| Only the loud get heard | One tap **"Me too"** gives every person the same voice. A grandmother's support counts the same as an influencer's. |
| Fifty voices look like one | **Duplicate detection** while typing joins neighbours on one report, with a public support count. |
| No visible outcome | Every report has a **public, tamper-proof status history** and a **Fixed** tab with before-and-after photos. |
| Language | **Tamil and English** everywhere. Write in Tamil, English or Tanglish. |

### Thambi doesn't replace anything. It fills the gap.

Thambi is **not** a new government department, and it does **not** replace 1913, the Namma Chennai app, Metro Water's helpline or the CM Helpline. Those are the official doors, and complaints must still go through them.

Thambi **sits on top of them**. It turns a citizen's report into one clean, evidence-backed, de-duplicated complaint; points it to the right official door; and then stays with the problem **in public until it is fixed**. Think of it as the layer that remembers, counts, and shows — the part the existing systems don't do for citizens.

### A better Tamil Nadu

- **Fewer injuries.** Dangerous problems — open pits, exposed wires, sewage overflow, anything near a school — rise to the top instead of waiting in a queue.
- **Less wasted effort.** Departments get one strong case instead of fifty angry calls. Citizens stop repeating the same complaint.
- **Trust built on proof.** When a road is fixed, everyone sees it. Good work by officials becomes visible too.
- **Everyone counts.** Tamil-first, big text, one tap to support — so elderly residents, students and daily commuters all have the same voice.
- **Better decisions.** Public data on what breaks, where, and how long it takes to fix helps wards and residents' associations plan, not just react.

---

## How it works

```
 Citizen                     Thambi                                  Authority
 ───────                     ──────                                  ─────────
 1. Pick problem type   ──►  knows the category
 2. Drop a map pin      ──►  knows the exact place and ward
 3. Add photos / video  ──►  stored as evidence for people
 4. Describe it         ──►  AI reads it, finds similar reports nearby
                             "23 neighbours reported this. Add your Me too?"
 5. How long? How bad?  ──►  priority score = text severity + citizen severity
    Who is affected?          + support + danger + age
 6. Confirm             ──►  routes to the right office  ─────────►  official channel
                             writes a formal complaint               (portal / helpline / email)
                             public feed + map
 7. Neighbours support  ──►  rank rises, everyone sees it
 8. Fixed?              ──►  after-photo + neighbours confirm  ◄────  work done
```

## Features

| Feature | Status |
|---|---|
| Strategic 8-step report form (one question per screen) | Planned |
| AI reading of the citizen's description (Tamil, English, Tanglish) | Planned |
| Pop-out duplicate detection while typing | Planned |
| "Me too" support button (one per person) | Planned |
| Priority score with a visible "Why this rank?" | Planned |
| Authority routing with a ready-to-send complaint | Planned |
| Public feed, map, and Fixed (before/after) tab | Planned |
| Comments with suggested starters | Planned |
| Tamper-proof status history | Planned |
| Fake report, abuse, false vote and bot detection | Planned |
| Tamil and English interface | Planned |
| Privacy blur for faces and number plates | Later |
| Monsoon mode (extra danger boost in heavy rain) | Later |
| Ward report card | Later |
| AI reading of photos and videos | Version 2 |

---

## Data

This section lists every piece of data Thambi needs, how we will get it, how trustworthy it must be, and — for the most sensitive piece, the authority contacts — exactly why we store them, how we use them, how we collect them and how accurate that will be.

### 6.1 What data Thambi needs

| # | Data | Why Thambi needs it |
|---|---|---|
| 1 | **Authority directory** — office name, what it handles, area covered, official portal, helpline, official email | To send each problem to the office that must fix it |
| 2 | **Problem-to-authority rules** — which office owns which kind of problem | The routing logic (for example, a water main leak goes to Metro Water, a road dug for metro work goes to Metro Rail) |
| 3 | **Jurisdiction boundaries** — Greater Chennai Corporation's 200 wards and 15 zones, Metro Water's 15 area offices, neighbouring corporations | To turn a map pin into "Ward 1xx, Zone x" |
| 4 | **Road ownership** — which roads are Corporation roads, state highways, or under metro works | So a highway pothole isn't sent to the Corporation |
| 5 | **Official service standards** — for example, the time within which a pothole should be filled after a complaint | To show when a report is overdue |
| 6 | **Seed reports** — real photos and videos of real problems on the founder's own routes | For the public feed and the demo |
| 7 | **AI test set** — about 20 labelled descriptions, 10 duplicate pairs, 10 non-duplicate pairs | To check severity and duplicate detection actually work |
| 8 | **Sensitive places** — schools and hospitals | To raise the priority of dangers near them |
| 9 | **Tamil interface text** | For the Tamil/English switch |
| 10 | **Moderation test comments** in Tamil, Tanglish and English | To test the abuse filter |
| 11 | **Problem-size facts** — complaint volumes, documented incidents | For the problem statement and pitch |

### 6.2 How we approach each piece

| # | Data | Source | Approach |
|---|---|---|---|
| 1 | Authority directory | Official Government of Tamil Nadu pages on `tn.gov.in` (Contact Directory, Help line Numbers, District Collectors) and each department's own website | Extract with a script, then verify every row by hand (see [6.4](#64-authority-contacts-why-how-and-how-accurate)) |
| 2 | Problem-to-authority rules | Each department's published responsibilities; reputable news for unclear cases | Written by hand as a small rule table; every rule cites its source |
| 3 | Boundaries | OpenCity's *Chennai GCC Ward Map – 2022* (public domain) | Load into the database; check against the current ward map, since many ward boundaries were redrawn |
| 4 | Road ownership | Official lists where available; otherwise the main arterial roads by name | Start with major roads; handle the rest through moderator review |
| 5 | Service standards | The Corporation's own guidelines or citizen charter | Use only an official document, not a news quote, before showing anything as "overdue" |
| 6 | Seed reports | First-hand, taken by the founder | Labelled clearly as the founder's own reports. No invented reports shown as real |
| 7 | AI test set | Built and labelled by the team | Kept private; used only for testing |
| 8 | Sensitive places | OpenStreetMap; OpenCity datasets | Load as map points with source credit |
| 9 | Tamil text | Written by the team | Reviewed by a native Tamil speaker |
| 10 | Moderation tests | Written by the team | Test data only; never shown in public |
| 11 | Problem-size facts | News and official statements | Every number cited with its source and date |

### 6.3 How trustworthy each piece must be

Not all data needs the same level of proof. What matters is what goes wrong if it is wrong.

| Tier | Meaning | Applies to | Rule |
|---|---|---|---|
| **A — Official and verified** | From an official government source, then checked by hand | Authority directory, routing rules, boundaries, service standards | Stored with its source link and a `verified_on` date. If it can't be verified, it isn't used for routing. |
| **B — Reputable secondary** | From established news or civic organisations, credited | Problem-size facts; unclear routing cases | Always cited. Never presented as official. |
| **C — First-hand** | Taken or written by us, real | Seed reports, AI test set | Real and honestly labelled. No invented events presented as real. |
| **D — Test only** | Made up on purpose for testing | Moderation test comments | Never shown to the public. |

A wrong contact sends a real person's complaint to the wrong place and breaks their trust. That is why routing data must be Tier A.

### 6.4 Authority contacts: why, how, and how accurate

#### Where the contacts come from

During research we found two kinds of contact lists:

- **Official:** `tn.gov.in`, whose footer states *"Content owned and Maintained by: Government of Tamil Nadu"*. Useful pages: **Contact Directory**, **Help line Numbers** (a table including 1913 for the Corporation, 044-4567 4567 for Metro Water, 1912 for electricity, 1077 for disaster management), and **District Collectors** (all 38 districts with office phone and official email).
- **Unofficial:** popular public information sites that compile many government numbers. These can be helpful, but no government office stands behind them. We use them **only as leads**: a number is stored only after it matches an official source.

#### Why we store the contacts

- Routing is the core promise of Thambi — *"sends it to the right authority"*. That needs a reliable table of who handles what, where, and how to reach them.
- We store **office channels only**: helplines, official portals, official email addresses and office landlines.
- We **never** store personal mobile numbers of individual officers.
- Officers get transferred, so we store the **office** ("District Collector, Chennai") as the key, and treat a person's name as extra information that may go out of date.

#### How we use them

- When a report is routed, Thambi shows the office, its official channel, the source link and the date we last checked it.
- Thambi writes a formal complaint (title, exact location link, photos, severity and reason, number of supporters, days open, public report link).
- The citizen or a moderator sends it through the official channel with one tap: open the portal, copy the letter, or open the email.
- **Thambi does not send anything automatically, and never calls, texts or messages officials on its own.** It makes sending easy, then tracks the result in public.

#### How we get them

1. Download each official page **once** and keep a dated copy.
2. A small script reads the page's tables and text blocks **directly** — it does not use AI, so it cannot invent a number. It also restores emails written as `name[at]nic[dot]in` to a normal address.
3. Each row is stored with its source URL, the date we downloaded it, and the page's own "last updated" date.
4. Each row is compared with the department's own website. If they disagree, the row is marked **uncertain** and not used for routing until resolved.
5. The contacts used most (the first 10–15) are checked by hand: open the portal, and, where sensible, make a test call to the public helpline.
6. We stay polite to government servers: a handful of requests, no repeated scraping, and the source is credited.

#### How accurate this will be

| Stage | Expected accuracy | Why |
|---|---|---|
| Copying what the page says | **About 99%** | Plain HTML text read by a script; every row (about 50) is checked against the page. |
| Whether the page itself is still current | **Roughly 70–90% before checking** | The official helpline page was last updated in December 2024, and officer names can change after transfers. |
| After cross-checking and hand verification | **Close to 100% for contacts used in routing** | Anything that can't be confirmed is marked uncertain and kept out of routing. |
| Unofficial lists on their own | **Unknown** | No official source stands behind them, which is why they are leads only. |

Every authority row shows a **"verified on"** date to the public, so anyone can see how fresh it is and report a wrong number.

---

## Security and privacy

Thambi holds two kinds of sensitive things: **people's reports** (photos, places, names) and **the routing data** that decides where those reports go. Both are protected at the database level, not just in the website.

### Security

- **The database is the security boundary.** Every table has row-level security rules. Even someone who bypasses the website and talks to the database directly gets the same answer: no.
- **Only the reporter can edit their own report**, only within 15 minutes, and never its status, priority or AI fields.
- **Status can only change through a checked function** that verifies the caller's role and the allowed step, and writes a history entry in the same transaction.
- **Status history is append-only.** Updates and deletes are blocked. Each entry stores a hash of the previous one, so a silent change is detectable.
- **"Fixed" needs proof** — an after-photo near the original location — and neighbours can reopen it.
- **The authority directory is read-only to the public.** Only admins can change it, and every change is logged with a source.
- **One "Me too" per person per report**, enforced by the database.
- **Bots and spam:** a human check on sign-up and posting, a hidden honeypot field, and daily limits on reports, comments and supports.
- **Secrets stay on the server.** Only the public key is in the browser; the service key and AI key live in server environment variables.
- **Uploads** use short-lived signed links, with size and file-type limits checked on the server.

### Privacy

- **We collect only what a report needs:** a display name, the report, its location, and its photos or video.
- **Email addresses are never public.**
- **Photo GPS and time are removed** from the public copy. The original values are kept privately only to check that a photo was taken where it claims.
- **Faces and number plates** in photos will be blurred before public display (later version).
- **No personal numbers of officials** are stored — only official office channels.
- **AI is a helper, not a judge.** Every automated flag — fake report, abusive comment, suspicious votes — is shown to a person with its reason. A person makes the final call.
- **What people write is treated as data, never as instructions** to the AI, so nobody can talk the system into a higher rating.
- **Your data, your choice:** reporters can delete their account; their reports stay as anonymous public records so the history of a public problem isn't lost.

To report a security issue, see [SECURITY.md](SECURITY.md).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase Postgres with PostGIS (location) and pgvector (meaning search) |
| Sign-in | Supabase Auth (Google sign-in, email magic link) |
| Storage | Supabase Storage |
| AI | A Gemini model on text only in version 1, and a text-embedding model |
| Maps | Leaflet with OpenStreetMap |
| Bot protection | Cloudflare Turnstile |
| Languages | next-intl (Tamil, English) |
| Hosting | Vercel |

The first target is **100 users**, which keeps every service within its free tier.

## Roadmap

- [x] Problem research and idea documents
- [x] Data plan and source research
- [ ] Authority directory extracted and verified
- [ ] Database schema and security rules
- [ ] Report form with AI reading of the description
- [ ] Duplicate detection pop-out and "Me too"
- [ ] Feed, map, priority score
- [ ] Routing and complaint letter
- [ ] Tamper-proof status and Fixed tab
- [ ] Moderation and bot protection
- [ ] Tamil interface
- [ ] Testing with real users
- [ ] Demo video and hackathon submission (deadline 22 November 2026)

## Documents

| Document | What it is |
|---|---|
| [1 — Original Idea](docs/Thambi%20-%201%20-%20Original%20Idea.pdf) | The idea in the founder's own words, next to the organisers' problem statement |
| [2 — The Approach](docs/Thambi%20-%202%20-%20The%20Approach.pdf) | How the idea is developed: judging lens, features, form design, demo plan |
| [3 — Technical Plan](docs/Thambi%20-%203%20-%20Technical%20Plan.pdf) | Architecture, data model, AI pipeline, security, design system, testing |

## Contributing

Thambi is in early development for a hackathon. Ideas, corrections to authority contacts, and reports from Tamil Nadu residents are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits and sources

- Government of Tamil Nadu — [tn.gov.in](https://www.tn.gov.in/): [Contact Directory](https://www.tn.gov.in/contact_directory.php), [Help line Numbers](https://www.tn.gov.in/help_desk.php), [District Collectors](https://www.tn.gov.in/district_collector.php)
- [Tamil Nadu CM Helpline](https://cmhelpline.tnega.org/)
- [Chennai Metropolitan Water Supply and Sewerage Board](https://cmwssb.tn.gov.in/)
- [Tamil Nadu Pollution Control Board](https://tnpcb.gov.in/)
- [OpenCity — Chennai GCC Ward Map 2022](https://data.opencity.in/dataset/gcc-ward-information/resource/chennai-gcc-ward-map---2022)
- Reporting by [DT Next](https://www.dtnext.in/city/2023/04/26/unhelpful-helplines) and [Citizen Matters](https://citizenmatters.in/complaint-against-potholes-in-chennai-grievance-redressal-by-corporation/) on how Chennai's complaint channels work in practice
- OpenStreetMap contributors

## License

[MIT](LICENSE)
