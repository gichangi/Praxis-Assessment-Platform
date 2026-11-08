import { describe, expect, it } from "vitest";
import { initials, passwordProblem, roleLabel } from "./team";

describe("passwordProblem", () => {
  it("accepts a matching password of at least 8 characters", () => {
    expect(passwordProblem("correct-horse", "correct-horse")).toBeNull();
    expect(passwordProblem("12345678", "12345678")).toBeNull();
  });

  it("rejects a short password before comparing", () => {
    expect(passwordProblem("short", "short")).toMatch(/at least 8/);
    expect(passwordProblem("", "")).toMatch(/at least 8/);
  });

  it("rejects a confirmation that doesn’t match", () => {
    expect(passwordProblem("correct-horse", "correct-horsE")).toMatch(/don’t match/);
  });
});

describe("team helpers", () => {
  it("builds initials from the first two words and ignores placeholders", () => {
    expect(initials("Amina Yusuf Hassan")).toBe("AY");
    expect(initials("Unnamed (c9b034df)")).toBe("U");
    expect(initials("")).toBe("?");
  });

  it("labels roles", () => {
    expect(roleLabel("form_editor")).toBe("Form editor");
    expect(roleLabel("something_else")).toBe("something else");
  });
});
