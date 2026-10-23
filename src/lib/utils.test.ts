import { describe, expect, it } from "vitest";
import { cn, formatCompact, hashString, initials, isEmail, pluralise, slugify, truncate } from "@/lib/utils";

describe("formatCompact", () => {
  it("formats thousands and millions", () => {
    expect(formatCompact(940)).toBe("940");
    expect(formatCompact(1500)).toBe("1.5K");
    expect(formatCompact(24_000)).toBe("24K");
    expect(formatCompact(2_450_000)).toBe("2.5M");
  });

  it("never returns NaN for invalid input", () => {
    expect(formatCompact(Number.NaN)).toBe("0");
    expect(formatCompact(-10)).toBe("0");
  });
});

describe("slugify", () => {
  it("produces url-safe slugs", () => {
    expect(slugify("Golden Hour Dunes")).toBe("golden-hour-dunes");
    expect(slugify("  Concrete/Cathedral!! ")).toBe("concrete-cathedral");
  });
});

describe("hashString", () => {
  it("is deterministic and positive", () => {
    expect(hashString("pixora")).toBe(hashString("pixora"));
    expect(hashString("pixora")).not.toBe(hashString("pixora!"));
    expect(hashString("any")).toBeGreaterThanOrEqual(0);
  });
});

describe("initials", () => {
  it("derives up to two uppercase letters", () => {
    expect(initials("Marta Ruiz")).toBe("MR");
    expect(initials("pixora")).toBe("PI");
    expect(initials("")).toBe("P");
  });
});

describe("isEmail", () => {
  it("validates common address shapes", () => {
    expect(isEmail("hello@pixora.app")).toBe(true);
    expect(isEmail("hello+tag@pixora.co.uk")).toBe(true);
    expect(isEmail("hello@pixora")).toBe(false);
    expect(isEmail("nope")).toBe(false);
  });
});

describe("pluralise", () => {
  it("switches on count", () => {
    expect(pluralise(1, "board")).toBe("1 board");
    expect(pluralise(3, "board")).toBe("3 boards");
  });
});

const isHidden = false;

describe("cn", () => {
  it("merges conflicting tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
    expect(cn("px-2", isHidden && "hidden")).toBe("px-2");
  });
});

describe("truncate", () => {
  it("adds an ellipsis past the limit", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("a much longer sentence", 10)).toBe("a much lo…");
  });
});
