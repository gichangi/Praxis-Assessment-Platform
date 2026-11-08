import { describe, expect, it } from "vitest";
import {
  assignmentSummary,
  cleanTitle,
  defaultTitleLanguage,
  formReadiness,
  titleProblem,
} from "./forms";
import { nextVersion, versionStatusLabel } from "./versions";

describe("formReadiness", () => {
  it("is live only when a version is active and someone is assigned", () => {
    const r = formReadiness({ activeVersion: "1.2.0", assignmentCount: 2 });
    expect(r.tone).toBe("success");
    expect(r.label).toBe("Live");
    expect(r.detail).toContain("1.2.0");
  });

  it("warns when an active form has nobody assigned", () => {
    const r = formReadiness({ activeVersion: "1.0.0", assignmentCount: 0 });
    expect(r.tone).toBe("warning");
    expect(r.label).toBe("Not assigned");
  });

  it("treats an open draft with no active version as not yet available", () => {
    const r = formReadiness({ draftVersion: "1.0.0", assignmentCount: 0 });
    expect(r.tone).toBe("neutral");
    expect(r.label).toBe("Draft only");
  });

  it("keeps an active form live while a newer draft is being prepared", () => {
    const r = formReadiness({ activeVersion: "1.0.0", draftVersion: "1.1.0", assignmentCount: 1 });
    expect(r.tone).toBe("success");
  });

  it("says so when nothing is active and there is no draft", () => {
    expect(formReadiness({ assignmentCount: 3 }).label).toBe("Nothing active");
  });
});

describe("assignmentSummary", () => {
  it("uses plain wording for 0, 1 and many", () => {
    expect(assignmentSummary(0)).toBe("Not assigned");
    expect(assignmentSummary(1)).toBe("1 assignment");
    expect(assignmentSummary(4)).toBe("4 assignments");
  });
});

describe("versions", () => {
  it("names statuses the way people see them", () => {
    expect(versionStatusLabel("published")).toBe("Active");
    expect(versionStatusLabel("archived")).toBe("Superseded");
    expect(versionStatusLabel("draft")).toBe("Draft");
  });

  it("suggests the next minor version after the highest, by number not text", () => {
    expect(nextVersion(["1.0.0"])).toBe("1.1.0");
    expect(nextVersion(["1.9.0", "1.10.0", "1.2.0"])).toBe("1.11.0");
    expect(nextVersion(["2.0.0", "1.5.0"])).toBe("2.1.0");
  });

  it("starts at 1.0.0 when there is nothing usable", () => {
    expect(nextVersion([])).toBe("1.0.0");
    expect(nextVersion(["draft", "x.y.z"])).toBe("1.0.0");
  });
});

describe("disabled forms", () => {
  it("are reported as disabled whatever else is true", () => {
    const r = formReadiness({ activeVersion: "1.0.0", assignmentCount: 3, enabled: false });
    expect(r.label).toBe("Disabled");
    expect(r.tone).toBe("neutral");
  });
});

describe("form titles", () => {
  it("uses English as the default language when it is there", () => {
    expect(defaultTitleLanguage({ so: "Foom", en: "Form" })).toBe("en");
  });

  it("falls back to the first language that has text", () => {
    expect(defaultTitleLanguage({ en: " ", so: "Foom" })).toBe("so");
    expect(defaultTitleLanguage({})).toBe("en");
  });

  it("trims titles and drops blank translations", () => {
    expect(cleanTitle({ en: "  Form ", so: "  ", ar: "نموذج" })).toEqual({
      en: "Form",
      ar: "نموذج",
    });
  });

  it("requires a name in the default language", () => {
    expect(titleProblem({ en: "  " }, "en")).toBe("Give the form a name.");
    expect(titleProblem({ en: "Form" }, "en")).toBeNull();
    expect(titleProblem({ so: "Foom" }, "en")).toBe("Give the form a name.");
  });
});
