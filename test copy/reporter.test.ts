import { stripVTControlCharacters } from "node:util";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { logger } from "../src/logger.ts";

function plain(value: unknown): string {
  return typeof value === "string" ? stripVTControlCharacters(value) : String(value);
}

function joinedOutput(spy: ReturnType<typeof vi.spyOn>): string {
  return spy.mock.calls.map((c) => (c[0] === undefined ? "" : plain(c[0]))).join("\n");
}

describe("logger", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("log forwards its arguments", () => {
    logger.log("a", 1);
    expect(logSpy).toHaveBeenCalledWith("a", 1);
  });

  it("info renders with the info icon", () => {
    logger.info("hello");
    expect(plain(logSpy.mock.calls[0]![0])).toBe("ℹ hello");
  });

  it("success renders with the success icon", () => {
    logger.success("done");
    expect(plain(logSpy.mock.calls[0]![0])).toBe("✔ done");
  });

  it("info stringifies errors as their message", () => {
    logger.info(new Error("oops"));
    expect(plain(logSpy.mock.calls[0]![0])).toBe("ℹ oops");
  });

  it("info stringifies primitive values", () => {
    logger.info(42, true, null);
    expect(plain(logSpy.mock.calls[0]![0])).toBe("ℹ 42 true null");
  });

  it("info falls back for unprintable values", () => {
    const bad = {
      toString() {
        throw new Error("nope");
      },
    };
    logger.info(bad);
    expect(plain(logSpy.mock.calls[0]![0])).toBe("ℹ [Unprintable value]");
  });

  it("warn writes a spaced WARN badge", () => {
    logger.warn("test-message");
    const out = joinedOutput(warnSpy);
    expect(out).toContain("WARN");
    expect(out).toContain("test-message");
  });

  it("error writes plain messages", () => {
    logger.error("plain-error");
    const out = joinedOutput(errorSpy);
    expect(out).toContain("ERROR");
    expect(out).toContain("plain-error");
  });

  it("error handles multiple arguments", () => {
    logger.error("msg1", 123, new Error("err2"));
    const out = joinedOutput(errorSpy);
    expect(out).toContain("msg1");
    expect(out).toContain("123");
    expect(out).toContain("err2");
  });

  it("error formats stack frames in various shapes", () => {
    const err = new Error("with-stack");
    err.stack = [
      "Error: with-stack",
      "    at foo (file:///path/file.ts:1:2)",
      "    at async bar (file:///path/bar.ts:3:4)",
      "    at file:///path/baz.ts:5:6",
      "    at async file:///path/qux.ts:7:8",
      "    at unrecognized",
      "    plain text without at",
    ].join("\n");

    logger.error(err);
    const out = joinedOutput(errorSpy);

    expect(out).toContain("with-stack");
    expect(out).toContain("at foo");
    expect(out).toContain("/path/file.ts:1:2");
    expect(out).toContain("async bar");
    expect(out).toContain("at unrecognized");
    expect(out).toContain("plain text without at");
  });

  it("error handles an at-frame with empty content", () => {
    const err = new Error("empty");
    err.stack = "Error: empty\n    at  ";
    logger.error(err);
    const out = joinedOutput(errorSpy);
    expect(out).toContain("empty");
  });

  it("error handles errors without a stack", () => {
    const err = new Error("no-stack");
    err.stack = undefined;
    logger.error(err);
    const out = joinedOutput(errorSpy);
    expect(out).toContain("no-stack");
  });

  it("error renders causes with a Caused by label", () => {
    const inner = new Error("inner-error");
    inner.stack = "Error: inner-error\n    at inner (file:///inner.ts:1:1)";
    const outer = new Error("outer-error", { cause: inner });
    outer.stack = "Error: outer-error\n    at outer (file:///outer.ts:2:2)";

    logger.error(outer);
    const out = joinedOutput(errorSpy);
    expect(out).toContain("outer-error");
    expect(out).toContain("Caused by");
    expect(out).toContain("inner-error");
  });

  it("error renders causes even when outer has no stack", () => {
    const inner = new Error("inner2");
    inner.stack = "Error: inner2\n    at inner2 (file:///i.ts:1:1)";
    const outer = new Error("outer2", { cause: inner });
    outer.stack = undefined;

    logger.error(outer);
    const out = joinedOutput(errorSpy);
    expect(out).toContain("Caused by");
    expect(out).toContain("inner2");
  });
});
