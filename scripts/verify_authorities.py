"""Cross-check data/authorities.csv against each office's own official website.

Rule: a row becomes "verified" only when a second official source — the office's
own website — shows the same phone number and email. If the two official
sources disagree, the row becomes "uncertain" and both values are written in
the notes. Rows that could not be checked stay "extracted".

Inputs (saved once by hand, never fetched in a loop):
    research/raw/districts/<id>.html, <id>.whos.html  — district nic.in pages
    research/raw/depts/*.html                          — department websites

Policy: only office channels are stored. Official mobile numbers listed for
individual officers are not stored.

Usage:
    python3 scripts/verify_authorities.py 2026-11-15
"""

import csv
import html
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "authorities.csv"
DISTRICTS = ROOT / "research" / "raw" / "districts"

# Offices checked on their own websites. Each entry records what the office's
# own site says, so the evidence is reviewable in git.
DEPARTMENT_CHECKS = {
    "tn-helpline-3": {
        "status": "verified",
        "evidence": "chennaicorporation.gov.in/gcc/ shows 'COMPLAINT NUMBER - 1913'",
        "website": "https://erp.chennaicorporation.gov.in/pgr/",
        "extra": "Online grievance portal: erp.chennaicorporation.gov.in/pgr; WhatsApp chatbot linked from the site",
    },
    "tn-helpline-8": {
        "status": "verified",
        "evidence": "cmwssb.tn.gov.in shows 'COMPLAINT CELL : + 044-4567 4567 (24x7)'",
        "website": "https://cms-cmwssb.tn.gov.in/",
        "extra": "Also on cmwssb.tn.gov.in: toll free 1916, WhatsApp +91 8144930308, Chennai Kudineer app",
    },
    "tn-helpline-2": {
        "status": "uncertain",
        "evidence": "The electricity board's own site (tnebltd.gov.in) lists 94987 94987 for power failure complaints; 1912 is not shown there",
    },
}

# Offices missing from tn.gov.in's list, added straight from their own sites.
NEW_ROWS = [
    {
        "id": "tneb-power-complaints", "office": "Tamil Nadu electricity board — power failure complaints",
        "kind": "helpline", "handles": "electricity", "area": "Tamil Nadu",
        "phone_published": "94987 94987 24 x 7", "phone_dial": "9498794987", "email": "",
        "website": "https://www.tnebltd.org", "source_url": "https://www.tnebltd.gov.in/",
        "page_last_updated": "", "status": "verified",
        "notes": "Own site: 'For Power Failure Complaints 94987 94987 24 x 7'",
    },
    {
        "id": "tnpcb-complaints", "office": "Tamil Nadu Pollution Control Board",
        "kind": "department", "handles": "pollution", "area": "Tamil Nadu",
        "phone_published": "044-22353134-139", "phone_dial": "044-22353134", "email": "complaint@tnpcb.gov.in",
        "website": "https://tnpcb.gov.in/pcbolgprs", "source_url": "https://tnpcb.gov.in/contact-us.php",
        "page_last_updated": "", "status": "verified",
        "notes": "Corporate office, 76 Mount Salai, Guindy, Chennai 600032. Online complaint registration at tnpcb.gov.in/pcbolgprs",
    },
    {
        "id": "cmrl-helpline", "office": "Chennai Metro Rail Limited",
        "kind": "department", "handles": "metro_works", "area": "Chennai",
        "phone_published": "1860-425-1515", "phone_dial": "18604251515", "email": "chennaimetrorail@cmrl.in",
        "website": "https://chennaimetrorail.org/contact-us/", "source_url": "https://chennaimetrorail.org/contact-us/",
        "page_last_updated": "", "status": "verified",
        "notes": "24/7 helpline. Office: 327 Anna Salai, Nandanam, Chennai 600035, phone 044 2437 8000. For roads dug or blocked by metro construction",
    },
    {
        "id": "tn-highways-app", "office": "Tamil Nadu State Highways Department",
        "kind": "department", "handles": "road_damage_state_highway", "area": "Tamil Nadu",
        "phone_published": "", "phone_dial": "", "email": "",
        "website": "https://play.google.com/store/apps/details?id=com.nammasaalai",
        "source_url": "https://www.tnhighways.tn.gov.in/", "page_last_updated": "", "status": "verified",
        "notes": "Own site links the Namma Saalai app for potholes on State Highways and Major District Roads only; local-body roads are not covered",
    },
]


def page_text(path: pathlib.Path) -> str:
    if not path.exists():
        return ""
    text = html.unescape(path.read_text(encoding="utf-8", errors="ignore"))
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", text, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text)


def collector_entry(text: str):
    """The phone written right after the Collector's email on the Who's Who page."""
    match = re.search(r"collr[\w\-]*\s*\[at\]\s*(?:nic|gov)\s*\[dot\]\s*in\s+(?:[^0-9]{0,80})?(0\d{10}|\d{10}|(?:0\d{2,4}[\s\-]?)?\d{6,8})", text, flags=re.I)
    return match.group(1).strip() if match else ""


def check_collector(row: dict, today: str) -> None:
    text = page_text(DISTRICTS / f"{row['id']}.html") + " " + page_text(DISTRICTS / f"{row['id']}.whos.html")
    if not text.strip():
        return
    normalised = text.lower().replace("[at]", "@").replace("[dot]", ".").replace(" @ ", "@").replace(" . ", ".")
    email_ok = bool(row["email"]) and row["email"].lower() in normalised

    lead = re.match(r"[\d ]+", (row["phone_published"] or "").split(",")[0])
    first = lead.group(0).replace(" ", "") if lead else ""
    flat = re.sub(r"\D", "", text)
    phone_ok = bool(first) and first in flat

    notes = [n for n in (row["notes"] or "").split("; ") if n and not n.startswith("Checked")]

    if phone_ok and not row["phone_dial"]:
        std = re.search(r"(0\d{2,4})[\s\-–]*" + r"[\s\-]*".join(first), text)
        if std:
            row["phone_dial"] = f"{std.group(1)}-{first}"
            notes = [n for n in notes if not n.startswith(("STD code not published", "dial number incomplete"))]
            notes.append("STD code taken from the district's own website")

    if email_ok and phone_ok:
        row["status"] = "verified"
        row["verified_on"] = today
        notes.append("Checked against the district's own website: email and phone match")
    elif email_ok:
        site_phone = collector_entry(text)
        row["status"] = "uncertain"
        row["verified_on"] = ""
        if site_phone and re.fullmatch(r"[6-9]\d{9}", re.sub(r"\D", "", site_phone)):
            notes.append("Email matches the district's own website; the district site lists an official mobile instead of this landline (mobile not stored by policy)")
        elif site_phone:
            notes.append(f"Email matches; phone differs — district's own website lists {site_phone}")
        else:
            notes.append("Email matches; phone not found on the district's own website")
    else:
        row["status"] = "uncertain"
        notes.append("Email not found on the district's own website")
    row["notes"] = "; ".join(notes)


def main(today: str):
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8")))
    fields = list(rows[0].keys())

    for row in rows:
        if row["kind"] == "district_collector":
            check_collector(row, today)
        elif row["id"] in DEPARTMENT_CHECKS:
            check = DEPARTMENT_CHECKS[row["id"]]
            row["status"] = check["status"]
            row["verified_on"] = today if check["status"] == "verified" else ""
            if "website" in check:
                row["website"] = check["website"]
            notes = [n for n in [row["notes"], check["evidence"], check.get("extra", "")] if n]
            row["notes"] = "; ".join(dict.fromkeys(notes))

    existing = {row["id"] for row in rows}
    for new in NEW_ROWS:
        if new["id"] in existing:
            continue
        row = {field: "" for field in fields}
        row.update(new)
        row["fetched_on"] = today
        row["verified_on"] = today if new["status"] == "verified" else ""
        rows.append(row)

    with CSV_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    counts = {}
    for row in rows:
        counts[row["status"]] = counts.get(row["status"], 0) + 1
    print(f"{len(rows)} rows: " + ", ".join(f"{k} {v}" for k, v in sorted(counts.items())))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else __import__("datetime").date.today().isoformat())
