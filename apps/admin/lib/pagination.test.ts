import { describe, expect, it } from "vitest";
import {
  pageCount,
  parsePageSize,
  sizeParam,
  pageHref,
  pageSlice,
  parsePage,
  rangeFor,
  rangeLabel,
} from "./pagination";

describe("parsePage", () => {
  it("reads a page number and falls back to 1", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-4")).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });
});

describe("pageCount and rangeFor", () => {
  it("has at least one page", () => {
    expect(pageCount(0, 25)).toBe(1);
    expect(pageCount(25, 25)).toBe(1);
    expect(pageCount(26, 25)).toBe(2);
  });

  it("gives the inclusive row range for a query", () => {
    expect(rangeFor(1, 25)).toEqual([0, 24]);
    expect(rangeFor(3, 10)).toEqual([20, 29]);
  });
});

describe("pageSlice", () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1);

  it("returns the requested page", () => {
    const p = pageSlice(items, 2, 10);
    expect(p.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(p.pages).toBe(3);
    expect(p.total).toBe(23);
  });

  it("shows the last page when asked for one past the end", () => {
    const p = pageSlice(items, 9, 10);
    expect(p.page).toBe(3);
    expect(p.items).toEqual([21, 22, 23]);
  });

  it("copes with an empty list", () => {
    const p = pageSlice([], 1, 10);
    expect(p.items).toEqual([]);
    expect(p.pages).toBe(1);
  });
});

describe("pageHref", () => {
  it("omits page 1 and empty filters", () => {
    expect(pageHref("/assessments", { status: "" }, 1)).toBe("/assessments");
  });

  it("keeps the other filters", () => {
    expect(pageHref("/assessments", { status: "draft" }, 3)).toBe(
      "/assessments?status=draft&page=3"
    );
  });
});

describe("rangeLabel", () => {
  it("describes the rows on the page", () => {
    expect(rangeLabel(1, 5, 9)).toBe("1–5 of 9");
    expect(rangeLabel(2, 25, 61)).toBe("26–50 of 61");
    expect(rangeLabel(3, 25, 61)).toBe("51–61 of 61");
    expect(rangeLabel(1, 25, 0)).toBe("0 of 0");
  });
});

describe("page size", () => {
  it("accepts only the offered sizes", () => {
    expect(parsePageSize("50", 25)).toBe(50);
    expect(parsePageSize("5", 25)).toBe(5);
    expect(parsePageSize("7", 25)).toBe(25);
    expect(parsePageSize(undefined, 25)).toBe(25);
    expect(parsePageSize("abc", 10)).toBe(10);
  });

  it("leaves the default out of the URL", () => {
    expect(sizeParam(25, 25)).toBeUndefined();
    expect(sizeParam(50, 25)).toBe("50");
  });
});
