# Thambi UI and UX: design brief and build prompt

Status: draft for approval. Build only after the owner says go.

## 1. Research that shapes the design

Sources are Chennai news reports, residents' accounts, and public app listings (see the project README, section "Data cautions" and the links there).

| What citizens say | What it means for the design |
|---|---|
| "They closed my complaint, but nothing was fixed." | Show the full status history on every report. A "Fixed" status needs proof. |
| "Which office is this? It's not our area." | Show the office and why it was chosen, before sending. |
| "The address can't be edited after I submit." | Let people fix the pin and the road before they send. Edit is not a support ticket. |
| "Fields were hidden below the screen, but Submit still worked." | One question per screen. Nothing hidden. Validate before the next step, not after the last one. |
| "The app was English only." | Tamil in the first release is a goal. For the demo it is planned (see README). The design must allow it: no fixed-width labels, room for longer text. |
| "No message when a complaint was closed." | Notify on every status change. Empty and error states must say what to do next. |
| Residents use WhatsApp and X because they get answers there. | Make sharing a report one tap. |
| Older residents and people in bright sunlight struggle with small type and low contrast. | Large type, strong contrast, big touch targets, no colour-only meaning. |

Design principle that follows: the citizen should always know **where their report is, what happens next, and who is responsible**.

## 2. Colour: the brief asks for life without noise

The current site is grey and white and reads as lifeless. Colour should carry meaning (status, severity, action) and add warmth, never decoration for its own sake.

### Palette (all text pairs meet WCAG AA 4.5:1 on white)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0F172A` | Headings and body text |
| `--ink-soft` | `#475569` | Secondary text (contrast 7.5:1) |
| `--surface` | `#FFFFFF` | Page background |
| `--surface-tint` | `#EEF7F6` | Section bands: a calm teal tint |
| `--brand` | `#0E7C7B` | Primary accent: links, selected state, step numbers (contrast 5.0:1 on white) |
| `--brand-deep` | `#0B5C5B` | Colour blocks such as the final call to action |
| `--brand-tint` | `#E3F4F2` | Selected tiles and chips |
| `--warm` | `#F2A900` | Small highlights only: dots, underlines. Never text on white |
| `--ink-on-warm` | `#1F1400` | Text on warm surfaces |

### Status colours (every status also has an icon and a word)

| Status | Text colour | Background | Icon |
|---|---|---|---|
| Reported | `#334155` | `#E2E8F0` | Circle |
| Verified | `#4338CA` | `#E0E7FF` | Seal check |
| Sent to office | `#1D4ED8` | `#DBEAFE` | Paper plane |
| In progress | `#92400E` | `#FEF3C7` | Clock |
| Fixed | `#166534` | `#DCFCE7` | Check circle |
| Reopened | `#B42318` | `#FEE4E2` | Arrow counter clockwise |

### Severity scale (1 to 5, always with the word)

| Level | Colour | Word |
|---|---|---|
| 1 | `#475569` | Annoying |
| 2 | `#0E7C7B` | Slows people down |
| 3 | `#B45309` | Damages vehicles |
| 4 | `#C2410C` | People could get hurt |
| 5 | `#B42318` | Danger right now |

Rules for colour:
- Maximum two accent hues on one screen: teal for action, and the status or severity colour.
- Never use red for anything except danger and reopened.
- Never rely on colour alone. Pair with icon and word.
- Tints for backgrounds, full colour for text and icons.

## 3. Typography

- Keep **Geist** for everything (the typeface the owner admires on Stick It Up). Tabular numbers for counts and times.
- Body 18px on mobile, line height 1.55. Headings tight, weight 600.
- Use sentence case. No italics. Max line length about 66 characters.

## 4. Layout and motion

- Mobile first. Bottom sticky action bar on the form. Content width 680px for reading.
- Section bands alternate white and teal tint so the page has rhythm.
- Motion: one rise-and-unblur per section (existing), word-by-word tagline (existing). Button press scale 0.96. Respect reduced motion. Nothing moves on hover that moves layout.

## 5. Components to colour

- **Report form:** selected tiles use teal tint and an accent ring. Progress bar in teal. Danger step shows the emergency numbers in a red tint.
- **Report card (feed):** a status chip at the top, a severity chip, support count with the "Me too" button in teal.
- **Status timeline:** dots coloured by status, the current step labelled "Now".
- **Map pins:** coloured by severity (scale above), with the number inside.
- **Landing:** teal section band for "What is live", warm highlight on the tagline words when lit, a deep teal final call-to-action block with white text.

## 6. Quality bar (from ui-ux-pro-max pre-delivery checklist)

- No emoji as icons. Phosphor icons only, one stroke weight.
- Contrast: body 4.5:1, secondary 3:1 minimum, focus rings 2px in brand colour.
- Touch targets at least 44 by 44px. Visible focus. Skip link. Alt text on every image.
- Test at 375px, 768px and 1440px, and with reduced motion on.
- No horizontal scroll at 360px.

## 7. Conflicts with the skill defaults, and the decision

| Skill default | Decision for Thambi |
|---|---|
| ui-ux-pro-max suggests Lexend / Source Sans 3 | Keep Geist (owner's choice) |
| Accessible & Ethical style suggests a navy primary | Use teal (warmer, reads as Tamil Nadu coast, still passes contrast) |
| Dark mode | Off for now. Owner asked for white |

## 8. Build order

1. Tokens: colour variables, status and severity variables.
2. Landing page colour pass: teal bands, status pills, severity chips, final call-to-action block.
3. Report form colour pass: selected states, progress, danger step.
4. Check contrast in the browser at 375px and 1440px. Report any pair under 4.5:1.

## 9. The prompt to paste into the builder

> Redesign the Thambi landing page and report form to feel alive but calm. Keep Geist and the white background. Use the palette in design/UI_UX_PROMPT.md: teal `#0E7C7B` for actions and selected states, teal tint `#EEF7F6` for section bands, a deep teal `#0B5C5B` block for the final call to action, and status and severity colours exactly as listed. Every status and severity has an icon and a word. Keep the existing copy and structure. Do not add decoration that carries no meaning. Check every text pair against WCAG AA. Build the colour pass first on the landing page, then the report form. Report the contrast of each pair you used.
