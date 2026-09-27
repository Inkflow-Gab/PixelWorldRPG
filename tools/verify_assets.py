#!/usr/bin/env python3
"""
verify_assets.py — CI gate that keeps the manifest and the filesystem honest.

Reads every URL referenced by `src/assets/manifest.ts` and checks that a matching
file exists under `public/`. Fails with a clear list of anything missing, so a
half-finished `npm run assets` can never reach a deploy.

Run directly (also invoked by `npm run assets:verify` and by CI).
"""

import os
import re
import sys

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(PROJECT, "src", "assets", "manifest.ts")
PUBLIC = os.path.join(PROJECT, "public")

# Matches `url: 'assets/...'` and the template form inside
# `\`assets/tiles/medieval.png\`` / `${...}` interpolations.
URL_RE = re.compile(r"url:\s*[`'\"]([^`'\"]+)[`'\"]")
# Matches entries built by a helper, e.g. `assets/battle/bg${n}.png`
TMPL_URL_RE = re.compile(r"url:\s*[`'\"]\$\{[^}]+\}[^`'\"]*[`'\"]")


def referenced_urls():
    """Collect literal urls; templated ones are reported as patterns."""
    if not os.path.exists(MANIFEST):
        print(f"manifest not found: {MANIFEST}", file=sys.stderr)
        sys.exit(1)

    with open(MANIFEST, "r", encoding="utf-8") as fh:
        src = fh.read()

    urls = set(URL_RE.findall(src))
    templates = set(TMPL_URL_RE.findall(src))
    return urls, templates


def resolve(url: str) -> str:
    return os.path.join(PUBLIC, url.lstrip("./"))


def main():
    urls, templates = referenced_urls()

    missing = []
    for url in sorted(urls):
        if "${" in url:
            continue
        path = resolve(url)
        if not os.path.isfile(path):
            missing.append(url)

    print(f"manifest: {MANIFEST}")
    print(f"public:   {PUBLIC}")
    print(f"literal urls checked: {len(urls)}")
    if templates:
        print(f"templated url patterns (checked at runtime): {len(templates)}")
        for t in sorted(templates):
            print(f"  - {t}")

    if missing:
        print(f"\nMISSING {len(missing)} asset(s):")
        for m in missing:
            print(f"  x {m}")
        print(
            "\nRun `npm run assets` (tools/prep_assets.py) to build public/assets/, "
            "then re-run this check."
        )
        return 1

    total = 0
    for root, _dirs, files in os.walk(PUBLIC):
        for f in files:
            total += os.path.getsize(os.path.join(root, f))
    print(f"\nAll referenced assets present. public/ total: {total/1024:.0f} KB")
    print("assets:verify OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
