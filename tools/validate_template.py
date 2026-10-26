#!/usr/bin/env python3
"""
Validate a form definition JSON before it is published, and print scoring and
translation coverage. The same rules must exist in TypeScript
(packages/core/src/validate.ts) so the admin portal blocks bad publishes;
this script is the reference and the quick check during development.

Usage:
    python validate_template.py <definition.json> [--previous <published.json>]

Exit code 0 = publishable, 1 = errors found. Warnings never block.
"""
import json
import re
import sys

KEY_RE = re.compile(r"^[a-z][a-z0-9_]{1,62}$")
ITEM_TYPES = {"scale", "single_choice", "yes_no", "number", "text", "photo", "gps"}
SCORED_TYPES = {"scale", "single_choice", "yes_no"}
TEXT_FIELDS = ("title", "guidance", "prompt", "description", "label")


def walk_texts(node, path=""):
    """Yield (path, i18n_dict) for every translatable text in the definition."""
    if isinstance(node, dict):
        for k, v in node.items():
            p = f"{path}.{k}" if path else k
            if k in TEXT_FIELDS and isinstance(v, dict):
                yield p, v
            else:
                yield from walk_texts(v, p)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk_texts(v, f"{path}[{i}]")


def validate(d, previous=None):
    errors, warnings = [], []
    langs, default = d.get("languages", []), d.get("default_language")
    if default not in langs:
        errors.append(f"default_language '{default}' is not in languages {langs}")

    scales = {}
    for s in d.get("scales", []):
        if s["key"] in scales:
            errors.append(f"duplicate scale key '{s['key']}'")
        values = [lv["value"] for lv in s.get("levels", [])]
        if not values:
            errors.append(f"scale '{s['key']}' has no levels")
        elif sorted(values) != list(range(min(values), max(values) + 1)):
            errors.append(f"scale '{s['key']}' levels are not contiguous: {values}")
        scales[s["key"]] = s

    item_keys, report = set(), []
    for sec in d.get("sections", []):
        groups = {g["key"] for g in sec.get("groups", [])}
        max_score, n_scored = 0, 0
        for it in sec.get("items", []):
            k = it.get("key", "")
            if not KEY_RE.match(k):
                errors.append(f"item key '{k}' must be lower_snake_case, 2-63 chars")
            if k in item_keys:
                errors.append(f"duplicate item key '{k}'")
            item_keys.add(k)
            if it.get("type") not in ITEM_TYPES:
                errors.append(f"item '{k}' has unknown type '{it.get('type')}'")
            if it.get("group") and it["group"] not in groups:
                errors.append(f"item '{k}' uses unknown group '{it['group']}'")
            if it.get("type") in ("scale", "single_choice"):
                sc = scales.get(it.get("scale"))
                if not sc:
                    errors.append(f"item '{k}' uses unknown scale '{it.get('scale')}'")
                elif it.get("include_in_total", True):
                    max_score += max(lv["value"] for lv in sc["levels"]) * it.get("weight", 1)
                    n_scored += 1
            elif it.get("type") == "yes_no" and it.get("include_in_total", True):
                max_score += it.get("weight", 1)
                n_scored += 1
            if not (it.get("title") or {}).get(default):
                errors.append(f"item '{k}' has no title in the default language")
        report.append(f"section '{sec['key']}': {len(sec.get('items', []))} items, "
                      f"{n_scored} scored, max score {max_score}")

    if previous:
        prev_keys = {it["key"] for s in previous.get("sections", []) for it in s.get("items", [])}
        removed = prev_keys - item_keys
        if removed:
            warnings.append("items removed since previous version (history kept, but they will not "
                            f"appear on new assessments): {sorted(removed)}")

    coverage = {}
    for lang in langs:
        total = done = 0
        for _p, t in walk_texts(d):
            if t.get(default):
                total += 1
                done += bool(t.get(lang))
        coverage[lang] = (done, total)
        if lang != default and done < total:
            warnings.append(f"'{lang}' translation {done}/{total}: missing text falls back to '{default}'")
    return errors, warnings, report, coverage


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    d = json.load(open(sys.argv[1], encoding="utf-8"))
    prev = None
    if "--previous" in sys.argv:
        prev = json.load(open(sys.argv[sys.argv.index("--previous") + 1], encoding="utf-8"))
    errors, warnings, report, coverage = validate(d, prev)
    print("\n".join(report))
    print("translations: " + ", ".join(f"{l} {a}/{b}" for l, (a, b) in coverage.items()))
    for w in warnings:
        print(f"WARNING: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    print("OK: publishable" if not errors else f"FAILED: {len(errors)} error(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
