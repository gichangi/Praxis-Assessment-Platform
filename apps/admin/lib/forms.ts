export type Tone = "success" | "warning" | "neutral";

export type Readiness = {
  tone: Tone;
  /** Short label for a list row. */
  label: string;
  /** One sentence saying where the form stands and what to do next. */
  detail: string;
};

/**
 * Where a form stands, in words a form manager can act on.
 * "Live" means phones can actually use it: there is an active version and someone is assigned.
 */
export function formReadiness(input: {
  activeVersion?: string;
  draftVersion?: string;
  assignmentCount: number;
  /** False when the form has been switched off. */
  enabled?: boolean;
}): Readiness {
  const { activeVersion, draftVersion, assignmentCount, enabled = true } = input;

  if (!enabled) {
    return {
      tone: "neutral",
      label: "Disabled",
      detail:
        "This form is switched off, so nobody can start new assessments with it. Existing assessments are kept.",
    };
  }

  if (activeVersion && assignmentCount > 0) {
    return {
      tone: "success",
      label: "Live",
      detail: `Version ${activeVersion} is active. Phones receive it on their next sync.`,
    };
  }
  if (activeVersion) {
    return {
      tone: "warning",
      label: "Not assigned",
      detail: `Version ${activeVersion} is active, but nobody can use it yet. Assign it to a location and people below.`,
    };
  }
  if (draftVersion) {
    return {
      tone: "neutral",
      label: "Draft only",
      detail: `Version ${draftVersion} is still a draft. Finish it and publish it to make the form available.`,
    };
  }
  return {
    tone: "neutral",
    label: "Nothing active",
    detail: "No version is active. Start a new version and publish it.",
  };
}

/** Short wording for how many assignments a form has. */
export function assignmentSummary(count: number): string {
  if (count === 0) return "Not assigned";
  return count === 1 ? "1 assignment" : `${count} assignments`;
}

/** The languages a form title can be written in, default language first. */
export const TITLE_LANGUAGES = ["en", "so", "ar"] as const;

export function defaultTitleLanguage(title: Record<string, string>): string {
  if (title.en?.trim()) return "en";
  return Object.keys(title).find((k) => title[k]?.trim()) ?? "en";
}

/** The title to store: trimmed, with blank translations dropped. */
export function cleanTitle(values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [lang, text] of Object.entries(values)) {
    const trimmed = text.trim();
    if (trimmed) out[lang] = trimmed;
  }
  return out;
}

/** Why a title can't be saved, or null. The default language is required. */
export function titleProblem(values: Record<string, string>, defaultLang: string): string | null {
  return values[defaultLang]?.trim() ? null : "Give the form a name.";
}
