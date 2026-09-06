#!/usr/bin/env python3
import json
import os
from pathlib import Path

DATA_FILE = Path("src/data/publications.json")


def required(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required value: {name}")
    return value


def main() -> None:
    title = required("PUB_TITLE")
    authors = required("PUB_AUTHORS")
    venue = required("PUB_VENUE")
    url = required("PUB_URL")
    year_text = required("PUB_YEAR")

    try:
        year = int(year_text)
    except ValueError as exc:
        raise SystemExit("PUB_YEAR must be an integer, e.g. 2026") from exc

    publications = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    new_item = {
        "year": year,
        "authors": authors,
        "title": title,
        "venue": venue,
        "url": url,
    }

    match_index = next(
        (
            i
            for i, item in enumerate(publications)
            if item.get("url", "").strip() == url
            or item.get("title", "").strip().casefold() == title.casefold()
        ),
        None,
    )

    if match_index is None:
        publications.append(new_item)
        action = "Added"
    else:
        publications[match_index] = new_item
        action = "Updated"

    publications.sort(
        key=lambda item: (-int(item.get("year") or 0), item.get("title", "").casefold())
    )
    DATA_FILE.write_text(
        json.dumps(publications, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"{action}: {title}")


if __name__ == "__main__":
    main()
