#!/usr/bin/env python3
"""
Convert packages/i18n/catalogs/*.json into apps/mobile/lib/l10n/app_*.arb

Usage (from repo root):
    python tools/json_to_arb.py

For each language file packages/i18n/catalogs/{lang}.json, writes
apps/mobile/lib/l10n/app_{lang}.arb in ARB format:
  {"@@locale": "en", "key": "value", "@key": {"description": "..."}}

Keys are flattened with underscores: {"common": {"save": "Save"}} → "common_save".
Run this after changing any catalog file or adding a new language.
"""
import json
import sys
from pathlib import Path


def flatten(obj: dict, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    for k, v in obj.items():
        full = f"{prefix}_{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, full))
        elif isinstance(v, str):
            out[full] = v
        else:
            print(f"WARNING: skipping non-string value at '{full}': {v!r}", file=sys.stderr)
    return out


def to_arb(lang: str, catalog: dict) -> dict:
    flat = flatten(catalog)
    arb: dict = {"@@locale": lang}
    for key, value in flat.items():
        arb[key] = value
        arb[f"@{key}"] = {"description": key.replace("_", " ")}
    return arb


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    catalog_dir = repo_root / "packages" / "i18n" / "catalogs"
    arb_dir = repo_root / "apps" / "mobile" / "lib" / "l10n"

    if not catalog_dir.exists():
        sys.exit(f"Catalog directory not found: {catalog_dir}")

    arb_dir.mkdir(parents=True, exist_ok=True)
    written = 0

    for lang_file in sorted(catalog_dir.glob("*.json")):
        lang = lang_file.stem
        with lang_file.open(encoding="utf-8") as f:
            catalog = json.load(f)

        arb = to_arb(lang, catalog)
        out_path = arb_dir / f"app_{lang}.arb"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(arb, f, ensure_ascii=False, indent=2)
            f.write("\n")

        key_count = sum(1 for k in arb if not k.startswith("@"))
        print(f"  {out_path.relative_to(repo_root)}  ({key_count} keys)")
        written += 1

    print(f"Done. Wrote {written} ARB file(s).")


if __name__ == "__main__":
    main()
