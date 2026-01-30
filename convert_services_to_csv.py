#!/usr/bin/env python3
"""
Convert services JSON to CSV with columns:
name, price, secondaryPrice, markupPercent, description, estimatedTimeHours

Usage:
  python3 convert_services_to_csv.py              # reads services.json
  python3 convert_services_to_csv.py path/to.json
  cat services.json | python3 convert_services_to_csv.py

Save your full JSON as services.json (overwrite the sample) to generate the full CSV.
"""
import json
import csv
import sys
from pathlib import Path

def main():
    json_path = Path(__file__).parent / "services.json"
    if len(sys.argv) > 1:
        json_path = Path(sys.argv[1])
    if json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    elif not sys.stdin.isatty():
        data = json.load(sys.stdin)
        json_path = Path(__file__).parent  # for out_path
    else:
        print(f"Usage: python3 convert_services_to_csv.py [path/to/services.json]", file=sys.stderr)
        print(f"   or: cat services.json | python3 convert_services_to_csv.py", file=sys.stderr)
        print(f"Expected JSON file at: {json_path}", file=sys.stderr)
        sys.exit(1)

    services = data.get("services", [])
    rows = []
    for service in services:
        variants = service.get("variants") or []
        for v in variants:
            rows.append({
                "name": (v.get("name") or "").replace('"', '""'),
                "price": v.get("price", ""),
                "secondaryPrice": v.get("secondaryPrice", ""),
                "markupPercent": v.get("markupPercent", ""),
                "description": (v.get("description") or "").replace('"', '""'),
                "estimatedTimeHours": v.get("estimatedTimeHours", ""),
            })

    out_path = Path(__file__).parent / "services.csv"
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["name", "price", "secondaryPrice", "markupPercent", "description", "estimatedTimeHours"])
        for r in rows:
            w.writerow([r["name"], r["price"], r["secondaryPrice"], r["markupPercent"], r["description"], r["estimatedTimeHours"]])

    print(f"Written {len(rows)} rows to {out_path}")

if __name__ == "__main__":
    main()
