/** Plain-language names for the stored version statuses. */
export function versionStatusLabel(status: string): string {
  switch (status) {
    case "published":
      return "Active";
    case "archived":
      return "Superseded";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

/** The next minor version after the highest of `versions` (1.0.0, 1.4.0 → 1.5.0). */
export function nextVersion(versions: string[]): string {
  let best: [number, number, number] = [1, -1, 0];
  for (const v of versions) {
    const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
    if (!m) continue;
    const parts: [number, number, number] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (
      parts[0] > best[0] ||
      (parts[0] === best[0] && (parts[1] > best[1] || (parts[1] === best[1] && parts[2] > best[2])))
    ) {
      best = parts;
    }
  }
  return `${best[0]}.${best[1] + 1}.0`;
}
