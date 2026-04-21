#!/usr/bin/env python3
"""Rebrand user-facing Master -> Fixfy. Preserves master_club, STRIPE_MASTER_*, Master-branco URLs."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next"}
EXT = {".jsx", ".js", ".ts", ".tsx", ".html", ".css", ".json", ".xml", ".txt", ".md"}

PHRASES: list[tuple[str, str]] = [
    ("MASTER SERVICES TRADES LTD", "FIXFY SERVICES TRADES LTD"),
    ("Master Services Trades Ltd", "Fixfy Services Trades Ltd"),
    ("Master Repairs Ltd", "Fixfy Repairs Ltd"),
    ("MASTER TRADES INC", "FIXFY TRADES INC"),
    ("Master Services", "Fixfy Services"),
    ("MASTER SERVICES", "FIXFY SERVICES"),
    ("Master Club", "Fixfy Club"),
    ("MASTER CLUB", "FIXFY CLUB"),
    ("Master Partner", "Fixfy Partner"),
    ("Master Team", "Fixfy Team"),
    ("Master-certified", "Fixfy-certified"),
    ("Master Certified", "Fixfy Certified"),
    ("Master AI", "Fixfy AI"),
    ("Master Gallery", "Fixfy Gallery"),
    ("Master Handyman", "Fixfy Handyman"),
    ("Master Carpentry", "Fixfy Carpentry"),
    ("Master Painting", "Fixfy Painting"),
    ("Master Cleaning Pro", "Fixfy Cleaning Pro"),
    ("Master Cleaning Booking", "Fixfy Cleaning Booking"),
    ("Why Choose Master", "Why Choose Fixfy"),
    ("Why homeowners and renters choose Master", "Why homeowners and renters choose Fixfy"),
    ("The Master brand", "The Fixfy brand"),
    ("Become a Master", "Become a Fixfy"),
    ("thank you for applying to become a Master Partner", "thank you for applying to become a Fixfy Partner"),
    ("Thank you for applying to become a Master Partner", "Thank you for applying to become a Fixfy Partner"),
    ("Insured & guaranteed by Master", "Insured & guaranteed by Fixfy"),
    ("Fully Covered by Master", "Fully Covered by Fixfy"),
    ("guaranteed by Master", "guaranteed by Fixfy"),
    ("managed by Master", "managed by Fixfy"),
    ("Master guarantees", "Fixfy guarantees"),
    ("Master sorted", "Fixfy sorted"),
    ("Master finds", "Fixfy finds"),
    ("Master handled", "Fixfy handled"),
    ("Master managed", "Fixfy managed"),
    ("Master does", "Fixfy does"),
    ("Master for Business", "Fixfy for Business"),
    ("Master exists", "Fixfy exists"),
    ("Master stays", "Fixfy stays"),
    ("How Master can", "How Fixfy can"),
    ("Master provides", "Fixfy provides"),
    ("Master connects", "Fixfy connects"),
    ("Master is an", "Fixfy is an"),
    ("Master has ", "Fixfy has "),
    ("Master has.", "Fixfy has."),
    ("Master has,", "Fixfy has,"),
    ("Master took", "Fixfy took"),
    ("Master's ", "Fixfy's "),
    ("Master's.", "Fixfy's."),
    ("Master's,", "Fixfy's,"),
    ("Master's", "Fixfy's"),
    ("About Master Services", "About Fixfy Services"),
    ("about Master Services", "about Fixfy Services"),
    ("Contact Master Services", "Contact Fixfy Services"),
    ("contact Master Services", "contact Fixfy Services"),
    ("Book a Service - Master Services", "Book a Service - Fixfy Services"),
    ("Learn about Master Services", "Learn about Fixfy Services"),
    ("Join hundreds of businesses who trust Master", "Join hundreds of businesses who trust Fixfy"),
    ("dozens of businesses already partner with Master", "dozens of businesses already partner with Fixfy"),
    ("Hear from people who've used Master", "Hear from people who've used Fixfy"),
    ("Trusted pros. Insured & guaranteed by Master", "Trusted pros. Insured & guaranteed by Fixfy"),
    ("Why Master Exists", "Why Fixfy Exists"),
    ("Footer Master", "Footer Fixfy"),
    ("Rodapé Master", "Rodapé Fixfy"),
    ("Master Logo", "Fixfy Logo"),
    ("from Master", "from Fixfy"),
    ("Thanks for choosing Master", "Thanks for choosing Fixfy"),
    ("Thank you for choosing Master", "Thank you for choosing Fixfy"),
    ("You're receiving this from Master", "You're receiving this from Fixfy"),
    ("You're receiving this email from Master", "You're receiving this email from Fixfy"),
    ("Thanks for trying Master", "Thanks for trying Fixfy"),
    ("Thanks for being part of the Master Team", "Thanks for being part of the Fixfy Team"),
    ("Welcome to Master Club", "Welcome to Fixfy Club"),
    ("Welcome to Fixfy Club — Master", "Welcome to Fixfy Club — Fixfy"),
    ("Your Master Club", "Your Fixfy Club"),
    ("cancel your Master Club", "cancel your Fixfy Club"),
    ("Add Master Club", "Add Fixfy Club"),
    ("Join Master Club", "Join Fixfy Club"),
    ("Master Club Subscription", "Fixfy Club Subscription"),
    ("Master Club membership", "Fixfy Club membership"),
    ("Master Club subscription", "Fixfy Club subscription"),
    ("Master Club add-on", "Fixfy Club add-on"),
    ("Master Club members", "Fixfy Club members"),
    ("Does Master offer", "Does Fixfy offer"),
    ("on the Master platform", "on the Fixfy platform"),
    ("professional, transparent and Master guarantees", "professional, transparent and Fixfy guarantees"),
    ("Booked a painter through Master", "Booked a painter through Fixfy"),
    ("With Master I", "With Fixfy I"),
    ("using Master", "using Fixfy"),
    ("through Master", "through Fixfy"),
    ("Ready to Master Your", "Ready to Fixfy Your"),
    ("Connect Master to", "Connect Fixfy to"),
    ("A Master-certified", "A Fixfy-certified"),
    ("Why Thousands Trust Master", "Why Thousands Trust Fixfy"),
    ("<!-- Why Master -->", "<!-- Why Fixfy -->"),
    ("Cleaning — Master", "Cleaning — Fixfy"),
    ("B2B Property Maintenance Services - Master Services", "B2B Property Maintenance Services - Fixfy Services"),
    ("Subscription cancelled — Master Club", "Subscription cancelled — Fixfy Club"),
    ("Cart abandoned (1h) — Master", "Cart abandoned (1h) — Fixfy"),
    ("Cart abandoned (24h) — Master", "Cart abandoned (24h) — Fixfy"),
    ("How did we do? — Master", "How did we do? — Fixfy"),
    ("Job completed — Master", "Job completed — Fixfy"),
    (" | Master</title>", " | Fixfy</title>"),
    ("Master | Professional", "Fixfy | Professional"),
    (" — Master</title>", " — Fixfy</title>"),
    ("<title>Master</title>", "<title>Fixfy</title>"),
    ("© Copyright by Master Services", "© Copyright by Fixfy Services"),
    ("© Copyright by Master Services –", "© Copyright by Fixfy Services –"),
]

RE_ALT_MASTER = re.compile(r"""alt=(["'])Master\1""")
RE_STANDALONE_MASTER_UPPER = re.compile(r"(?<![\w/\-])MASTER(?![\w\-])")
RE_WORD_MASTER = re.compile(r"\bMaster\b")


def should_skip(path: Path) -> bool:
    if not path.is_file():
        return True
    if set(path.parts) & SKIP_DIRS:
        return True
    if path.name == "package-lock.json":
        return True
    if path.suffix.lower() not in EXT:
        return True
    if path.name == "rebrand_master_to_fixfy.py":
        return True
    return False


def process_content(s: str) -> str:
    for old, new in PHRASES:
        if old != new:
            s = s.replace(old, new)

    s = RE_ALT_MASTER.sub(lambda m: f"alt={m.group(1)}Fixfy{m.group(1)}", s)

    # Uppercase MASTER (not part of MASTER_LOGO or STRIPE_MASTER)
    def upper_repl(m: re.Match[str]) -> str:
        start = m.start()
        pre = s[max(0, start - 20) : start]
        if pre.endswith("STRIPE_") or pre.endswith("MASTER_"):
            return m.group(0)
        return "FIXFY"

    s = RE_STANDALONE_MASTER_UPPER.sub(upper_repl, s)

    # Remaining word Master -> Fixfy
    def word_repl(m: re.Match[str]) -> str:
        start = m.start()
        ctx = s[max(0, start - 40) : start + 20]
        low = ctx.lower()
        if "master_club" in low or "master-branco" in ctx or "/master-" in ctx or "Master-branco" in ctx:
            return m.group(0)
        if "stripe_master" in low:
            return m.group(0)
        return "Fixfy"

    s = RE_WORD_MASTER.sub(word_repl, s)
    return s


def main() -> None:
    changed = 0
    for path in sorted(ROOT.rglob("*")):
        if should_skip(path):
            continue
        try:
            raw = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        new = process_content(raw)
        if new != raw:
            path.write_text(new, encoding="utf-8")
            print(path.relative_to(ROOT))
            changed += 1
    print(f"Updated {changed} files.", file=sys.stderr)


if __name__ == "__main__":
    main()
