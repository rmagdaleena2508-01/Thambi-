# Thambi graphics: brief and prompt

Status: first pass drawn, sheet at `design/stickers/sheet.html`. Placed on the landing page only where they carry meaning.

## 1. What the graphics must say

Thambi's promise: "Tell Thambi. It gets taken care of." The graphics say three things, in this order:
1. **Someone is listening.** The citizen is not shouting into the void.
2. **Neighbours are with you.** A problem shared is a problem counted.
3. **It stays visible until fixed.** Status is a seal, not a promise.

Civic tone: warm and local, Tamil Nadu coast and streets, never corporate, never alarmist. The stickers are small, friendly and objective. They should look like they belong on a bus-stop notice board and on a phone.

## 2. Research behind the direction

- App Store Discover (reference screenshot supplied by the owner): isometric flat illustrations sit on soft pastel circles, with one bold scene per card and generous white space. This is the strongest pattern for a civic product: a small, legible scene that explains one idea.
- Isometric works on marketing surfaces, and a diagonal grid behind a flat frame reads as "the city" (see the search note in the session log). Use the grid as texture, not as a hero illustration.
- Pastel circles plus one saturated accent is the calm-but-alive balance asked for in the colour brief.
- Icons should be one visual language: same radius, same stroke logic, colour and word together (WCAG AA, already checked for the palette).
- Illustrations need an alt text decision: decorative graphics get `alt=""`, meaningful ones a short label.

## 3. The system

**Grid.** A faint isometric-ish square grid (1px, teal at 10% opacity, 48px cell) as a background texture behind the hero and section bands. It reads as streets, and as the civic map. It never sits behind body text at full strength.

**Stickers.** Circle badge, 200 by 200 in the source. Pastel disc (teal `#BFE7E4` or warm `#FCE7A3`), one isometric subject in the brand teal and deep teal, one small amber accent (`#F2A900`) to mark the point of interest.

**Set:**
| Sticker | Meaning | Where it appears |
|---|---|---|
| Report pin with tick | Report a problem | How it works, step 1 |
| Pothole on isometric road | Road damage | Problem cards and report form tile |
| Leaking pipe and drop | Water leak | Report form tile |
| Two neighbours | Me too, neighbours join | How it works, step 2 |
| Verified seal | Verified and fixed | Status section and report timeline |

**Rules.**
- One sticker per idea. Never decorate a card that has no idea to show.
- Never put text inside a sticker. Text is always real HTML so it is searchable and translatable later.
- Max one accent colour per sticker.
- No gradients on backgrounds (landing rule). Stickers may use flat tints.
- Keep stickers at 56 to 120px on screen. Never larger than the heading.

## 4. Prompt for the graphic designer or image model

> Design a sticker set for Thambi, a civic complaint platform in Tamil Nadu. Each sticker is a flat, isometric scene inside a pastel circle, 200 by 200 units, no text. Palette: brand teal #0E7C7B and deep teal #0B5C5B for the subject, pastel teal #BFE7E4 or pastel amber #FCE7A3 for the disc, amber #F2A900 for one accent. Subjects: a map pin with a tick (report), an isometric road with a pothole and a warning cone (road damage), a leaking pipe with a water drop (water), two neighbours with a plus sign (Me too), a rosette seal with a tick (verified). Rounded corners, no outlines, no gradients, no shadows beyond one soft ground ellipse at 18% opacity. Also produce a seamless isometric grid tile in teal at 10% opacity. Output SVG only, valid XML, with role="img" and an aria-label. Deliver a contact sheet and the raw files.

## 5. Acceptance

- Each sticker reads at 48px.
- Each sticker has a single idea and passes the "say it in three words" test.
- Stickers sit beside the text they illustrate, never over it.
- Grid texture stays under 12% opacity everywhere.
- Checked at 375px and 1440px, and with reduced motion on.
