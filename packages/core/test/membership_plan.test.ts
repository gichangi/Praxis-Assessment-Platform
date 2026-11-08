import { describe, expect, it } from "vitest";
import { planMembershipChange } from "../../../supabase/functions/_shared/membership_plan";

const row = (id: string, location_id: string | null) => ({ id, location_id });

describe("planMembershipChange", () => {
  it("does nothing when nothing changed", () => {
    const plan = planMembershipChange({
      current: [row("m1", "bari"), row("m2", "garowe")],
      oldRole: "assessor",
      newRole: "assessor",
      desired: ["garowe", "bari"],
    });
    expect(plan.insert).toEqual([]);
    expect(plan.deleteIds).toEqual([]);
  });

  it("adds a location without touching the others", () => {
    const plan = planMembershipChange({
      current: [row("m1", "bari")],
      oldRole: "assessor",
      newRole: "assessor",
      desired: ["bari", "eyl"],
    });
    expect(plan.insert).toEqual(["eyl"]);
    expect(plan.deleteIds).toEqual([]);
  });

  it("removes a location that is no longer wanted", () => {
    const plan = planMembershipChange({
      current: [row("m1", "bari"), row("m2", "garowe")],
      oldRole: "assessor",
      newRole: "assessor",
      desired: ["bari"],
    });
    expect(plan.insert).toEqual([]);
    expect(plan.deleteIds).toEqual(["m2"]);
  });

  it("moves from all locations to specific ones", () => {
    const plan = planMembershipChange({
      current: [row("m1", null)],
      oldRole: "assessor",
      newRole: "assessor",
      desired: ["bari", "garowe"],
    });
    expect(plan.insert).toEqual(["bari", "garowe"]);
    expect(plan.deleteIds).toEqual(["m1"]);
  });

  it("moves from specific locations to all locations", () => {
    const plan = planMembershipChange({
      current: [row("m1", "bari"), row("m2", "garowe")],
      oldRole: "assessor",
      newRole: "assessor",
      desired: [null],
    });
    expect(plan.insert).toEqual([null]);
    expect(plan.deleteIds.sort()).toEqual(["m1", "m2"]);
  });

  it("replaces the whole group when the role changes, keeping the same locations", () => {
    const plan = planMembershipChange({
      current: [row("m1", "bari"), row("m2", "garowe")],
      oldRole: "assessor",
      newRole: "manager",
      desired: undefined,
    });
    expect(plan.insert).toEqual(["bari", "garowe"]);
    expect(plan.deleteIds.sort()).toEqual(["m1", "m2"]);
    expect(plan.insertFirst).toBe(true);
  });

  it("applies a role change and new locations together", () => {
    const plan = planMembershipChange({
      current: [row("m1", "bari")],
      oldRole: "assessor",
      newRole: "manager",
      desired: ["eyl"],
    });
    expect(plan.insert).toEqual(["eyl"]);
    expect(plan.deleteIds).toEqual(["m1"]);
  });

  it("ignores duplicate locations in the request", () => {
    const plan = planMembershipChange({
      current: [],
      oldRole: "assessor",
      newRole: "assessor",
      desired: ["bari", "bari", null, null],
    });
    expect(plan.insert).toEqual(["bari", null]);
  });

  it("always creates before it deletes", () => {
    expect(
      planMembershipChange({ current: [row("m1", "a")], oldRole: "x", newRole: "x", desired: ["b"] })
        .insertFirst
    ).toBe(true);
  });
});
