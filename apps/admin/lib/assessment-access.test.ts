import { describe, expect, it } from "vitest";
import { canEditAssessment } from "./assessment-access";

const base = { createdBy: "me", assessors: [] as string[], userId: "me" };

describe("canEditAssessment", () => {
  it("lets the owner edit a draft, a returned one and a submitted one", () => {
    for (const status of ["draft", "returned", "submitted"])
      expect(canEditAssessment({ ...base, status })).toBe(true);
  });

  it("never lets anyone edit an approved or rejected assessment", () => {
    expect(canEditAssessment({ ...base, status: "approved" })).toBe(false);
    expect(canEditAssessment({ ...base, status: "rejected" })).toBe(false);
  });

  it("does not let someone else edit it", () => {
    expect(canEditAssessment({ ...base, status: "submitted", userId: "other" })).toBe(false);
  });

  it("lets a co-assessor edit", () => {
    expect(
      canEditAssessment({ ...base, status: "draft", userId: "friend", assessors: ["friend"] })
    ).toBe(true);
  });

  it("does nothing for a signed-out visitor", () => {
    expect(canEditAssessment({ ...base, status: "draft", userId: null })).toBe(false);
  });
});
