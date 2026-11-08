import { describe, expect, it } from "vitest";
import { failureMessage } from "./function-proxy";

describe("failureMessage", () => {
  it("uses the function's own error", () => {
    expect(failureMessage(400, JSON.stringify({ error: "Email already used" }))).toBe("Email already used");
  });

  it("reads gateway-style message and msg fields", () => {
    expect(failureMessage(401, JSON.stringify({ code: 401, message: "Invalid JWT" }))).toBe("Invalid JWT");
    expect(failureMessage(401, JSON.stringify({ msg: "Missing authorization header" }))).toBe(
      "Missing authorization header",
    );
  });

  it("explains a missing function", () => {
    expect(failureMessage(404, "")).toMatch(/isn’t available/);
  });

  it("copes with a reply that isn't JSON", () => {
    expect(failureMessage(502, "<html>Bad gateway</html>")).toMatch(/\(502\)/);
    expect(failureMessage(418, "nope")).toBe("The request failed (418).");
  });

  it("ignores blank messages", () => {
    expect(failureMessage(500, JSON.stringify({ error: "  " }))).toMatch(/\(500\)/);
  });
});
