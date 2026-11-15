# Authority contacts — verification report

Last run: 15 November 2026 · Script: [`scripts/verify_authorities.py`](../scripts/verify_authorities.py) · Data: [`authorities.csv`](authorities.csv)

## The rule

A contact is **verified** only when a second official source — the office's own website — shows the same number and email as the first official source (`tn.gov.in`). If two official sources disagree, the contact is **uncertain** and both values are written in its notes. Contacts that could not be checked stay **extracted**. Only **verified** contacts are used for routing.

Only office channels are stored. Some district websites list an official mobile number for the Collector; those are not stored.

## Result

| Status | Count | Meaning |
|---|---|---|
| Verified | **31** | Matches the office's own website |
| Uncertain | **14** | Two official sources disagree, or the office's site lists only a mobile |
| Extracted | **5** | Could not be checked against a second source yet |
| **Total** | **50** | 46 from `tn.gov.in` + 4 added from department websites |

## What was checked

**38 District Collectors** — compared with each district's own `nic.in` Contact Directory and Who's Who pages.

- **Email:** 38 of 38 match.
- **Phone:** 24 match. Five of those were missing an STD code on `tn.gov.in`; the code was filled in from the district's own site (Chengalpattu, Cuddalore, Dindigul, Tenkasi, Tirupathur).
- **14 uncertain:**
  - 6 list a different landline on the district's own site: Dharmapuri, Kanniyakumari, Krishnagiri, Mayiladuthurai, Salem, Thoothukudi.
  - 8 list only an official mobile, which is not stored: Erode, Kallakurichi, Nagapattinam, Perambalur, Ranipet, Theni, Tiruppur — and Ranipet has no landline on either source.
- **Mayiladuthurai** confirmed wrong on `tn.gov.in`: the borrowed STD code 04329 belongs to Ariyalur; the district's own site lists 04364 290760.
- **Collector names are out of date** in places (for example Theni and Tiruppur). Names are stored only as extra notes, never used for routing.

**Helplines and departments** — compared with each department's own website.

| Office | Result |
|---|---|
| Greater Chennai Corporation — 1913 | Verified on chennaicorporation.gov.in. Online grievance portal added. |
| Chennai Metro Water — 044-4567 4567 | Verified on cmwssb.tn.gov.in. Toll-free 1916, official WhatsApp and the online portal noted. |
| Electricity — 1912 | Uncertain. The electricity board's own site lists **94987 94987** and does not show 1912. |
| Electricity — 94987 94987 | **Added**, verified on the board's own site. |
| Pollution Control Board | **Added**, verified: phone, complaint email and online complaint portal. |
| Chennai Metro Rail — 1860-425-1515 | **Added**, verified. For roads dug or blocked by metro work. |
| State Highways — Namma Saalai app | **Added**, verified. Covers State Highways and Major District Roads only. |
| Disaster lines 1077 / 1070, police 100, ambulance 108, CM constituency line | Extracted. Not civic routing targets; the disaster authority's site and the CM Helpline portal could not be read automatically. |

## How accurate this is

- **Copying:** every value was matched back against its source page — 0 copy errors.
- **Routing contacts for the Chennai demo** (Corporation, Metro Water, electricity, pollution, metro rail, highways): **all verified** against the office's own website.
- **Remaining risk:** official websites themselves can be out of date. Every contact shows its "verified on" date in Thambi, and anyone can report a wrong one using the *Wrong authority contact* issue template.
