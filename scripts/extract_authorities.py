"""Extract official contact rows from saved Government of Tamil Nadu pages.

Reads pages saved once by hand into research/raw/ (never fetched in a loop),
parses them with plain code (no AI, so nothing can be invented), and writes
data/authorities.csv.

Usage:
    python3 scripts/extract_authorities.py research/raw

Every row keeps its source URL, the date the page was saved, and the page's own
"last updated" date. Rows start with status "extracted": copied from an official
page but not yet cross-checked. Only rows marked "verified" by a person are used
for routing.
"""

import csv
import html
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "authorities.csv"
FIELDS = [
    "id", "office", "kind", "handles", "area",
    "phone_published", "phone_dial", "email", "website",
    "source_url", "page_last_updated", "fetched_on",
    "status", "verified_on", "notes",
]

# What each official helpline handles, in Thambi's categories. Written by hand
# from the "Remarks" column of the official table.
HELPLINE_HANDLES = {
    "Chennai Corporation": "road_damage;streetlight;garbage;stormwater_drain",
    "Chennai MetroWater": "water_leak;sewage",
    "TANGEDCO": "electricity",
    "Disaster Management Help Line (District Helpline)": "disaster",
    "Disaster Management Help Line (State Helpline)": "disaster",
    "Crime Reporting": "police",
    "Chief Minister in your Constituency": "escalation",
    "Ambulance": "medical_emergency",
}


def text(fragment: str) -> str:
    """Strip tags and collapse whitespace."""
    fragment = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    fragment = html.unescape(fragment)
    return re.sub(r"[ \t\r\f\v]+", " ", fragment).strip()


def deobfuscate_email(value: str) -> str:
    return value.replace("[at]", "@").replace("[dot]", ".").strip(" '\"")


def saved_date(path: pathlib.Path) -> str:
    match = re.search(r"(\d{4}-\d{2}-\d{2})", path.name)
    return match.group(1) if match else ""


def last_updated(page: str) -> str:
    match = re.search(r"Last Updated\s*:\s*([A-Za-z]+\s+\d{1,2}\s*,\s*\d{4})", page)
    return re.sub(r"\s+", " ", match.group(1)).replace(" ,", ",") if match else ""


def handles_for(facility: str) -> str:
    for key, value in HELPLINE_HANDLES.items():
        if key.lower() in facility.lower():
            return value
    return ""


def parse_help_desk(path: pathlib.Path):
    page = path.read_text(encoding="utf-8", errors="ignore")
    rows = []
    for tr in re.findall(r"<tr\s+class='table-border'>(.*?)</tr>", page, flags=re.S):
        cells = re.findall(r"<td>(.*?)</td>", tr, flags=re.S)
        if len(cells) != 4:
            continue
        number, facility_cell, contact, remarks = cells
        links = re.findall(r"href='([^']+)'", facility_cell)
        facility = text(facility_cell).split("\n")[0].strip()
        contact_text = text(contact)
        dial = re.match(r"\d[\d\-]*", contact_text)
        rows.append({
            "id": f"tn-helpline-{text(number)}",
            "office": facility,
            "kind": "helpline",
            "handles": handles_for(facility) or handles_for(text(remarks)),
            "area": "Chennai" if "chennai" in facility.lower() else "Tamil Nadu",
            "phone_published": contact_text,
            "phone_dial": dial.group(0).strip() if dial else "",
            "email": "",
            "website": links[0] if links else "",
            "source_url": "https://www.tn.gov.in/help_desk.php",
            "page_last_updated": last_updated(page),
            "fetched_on": saved_date(path),
            "status": "extracted",
            "verified_on": "",
            "notes": text(remarks) if text(remarks) != "-" else "",
        })
    return rows


def parse_collectors(path: pathlib.Path):
    page = path.read_text(encoding="utf-8", errors="ignore")
    rows = []
    blocks = re.findall(r"<table\s+class='table table-bordered place_table'>(.*?)</table>", page, flags=re.S)
    for block in blocks:
        district = re.search(r"class='district_name_value'>(.*?)</th>", block, flags=re.S)
        phone_cell = re.search(r"class='phone'>(.*?)</td>", block, flags=re.S)
        more = re.search(r"href='(https?://[^']+)'", block)
        if not district or not phone_cell:
            continue
        district_name = text(district.group(1))
        cell = phone_cell.group(1)
        phone = re.search(r"Phone\s*:\s*([^<]*)", cell)
        fax = re.search(r"FAX\s*:\s*([^<]*)", cell)
        email = re.search(r">([^<]*\[at\][^<]*)<", cell)
        phone_published = phone.group(1).strip() if phone else ""
        notes = []

        # The page often lists the local number without its STD code, and the
        # fax with it. Borrow the STD code from the fax only when it is there,
        # and say so in the notes.
        phone_dial = ""
        std = re.match(r"\s*(0\d{2,4})-", fax.group(1)) if fax else None
        first = re.match(r"\s*(\d{6,8})\b", phone_published)
        if first and std:
            phone_dial = f"{std.group(1)}-{first.group(1)}"
            notes.append("STD code taken from the fax number on the same page")
        elif first:
            notes.append("STD code not published; dial number incomplete")

        name = re.search(r"<label class='name'><b>(.*?)</b>", block, flags=re.S)
        if name:
            notes.append("Collector named on page: " + re.sub(r"\s+", " ", text(name.group(1))))

        rows.append({
            "id": "tn-collector-" + re.sub(r"[^a-z]+", "-", district_name.lower()).strip("-"),
            "office": f"District Collector, {district_name}",
            "kind": "district_collector",
            "handles": "escalation",
            "area": district_name,
            "phone_published": phone_published,
            "phone_dial": phone_dial,
            "email": deobfuscate_email(email.group(1)) if email else "",
            "website": more.group(1) if more else "",
            "source_url": "https://www.tn.gov.in/district_collector.php",
            "page_last_updated": last_updated(page),
            "fetched_on": saved_date(path),
            "status": "extracted",
            "verified_on": "",
            "notes": "; ".join(notes),
        })
    return rows


def main(raw_dir: str):
    raw = pathlib.Path(raw_dir)
    help_desk = sorted(raw.glob("help_desk_*.html"))
    collectors = sorted(raw.glob("district_collector_*.html"))
    if not help_desk or not collectors:
        sys.exit("Saved pages not found in " + raw_dir)
    rows = parse_help_desk(help_desk[-1]) + parse_collectors(collectors[-1])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"{len(rows)} rows written to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "research" / "raw"))
