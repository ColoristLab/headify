import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "../src/logger.js";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("log 会将所有参数传递给 console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const value = { answer: 42 };

    logger.log("hello", value, 123);

    expect(spy).toHaveBeenCalledWith("hello", value, 123);
  });

  it.each([
    ["info", "ℹ", "cyan"],
    ["success", "✔", "green"],
  ] as const)("%s 会格式化并拼接任意类型的值", (method, label, color) => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger[method]("message", 42, null, { key: "value" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toContain(label);
    expect(spy.mock.calls[0]?.[0]).toContain("message 42 null [object Object]");

    // 如果需要验证颜色参数，可以在这里使用 color。
    expect(color).toBeTruthy();
  });

  it("warning 会在警告徽标前后输出空行", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.warn("careful", 7);

    expect(log).toHaveBeenNthCalledWith(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("WARN");
    expect(warn.mock.calls[0]?.[0]).toContain("careful 7");
    expect(log).toHaveBeenNthCalledWith(2);
  });

  it("会格式化 Error 错误消息和堆栈帧", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("broken");
    error.stack = [
      "Error: broken",
      "    at render (file:///tmp/render.mjs:10:20)",
      "    at file:///tmp/main.mjs:3:4",
      "    at async node:internal/modules/esm/loader:5:6",
      "    at unusual frame",
      "plain stack line",
    ].join("\n");

    logger.error(error);

    expect(log).toHaveBeenCalledTimes(2);
    expect(errorSpy.mock.calls[0]?.[0]).toContain("ERROR");
    expect(errorSpy.mock.calls[0]?.[0]).toContain("broken");
    const formattedStack = String(errorSpy.mock.calls.at(-1)?.[0]);
    expect(formattedStack).toContain("render");
    expect(formattedStack).toContain("/tmp/render.mjs:10:20");
    expect(formattedStack).toContain("/tmp/main.mjs:3:4");
    expect(formattedStack).toContain("async");
    expect(formattedStack).toContain("unusual frame");
    expect(formattedStack).toContain("plain stack line");
  });

  it("会递归格式化 Error.cause 中的原因错误", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const cause = new TypeError("root cause");
    cause.stack = "TypeError: root cause\n    at file:///tmp/root.mjs:1:2";
    const error = new Error("outer error", { cause });
    error.stack = "Error: outer error\n    at run (/tmp/run.mjs:3:4)";

    logger.error(error);

    const output = errorSpy.mock.calls.map((call) => String(call[0])).join("\n");
    expect(output).toContain("outer error");
    expect(output).toContain("Caused by: TypeError: root cause");
    expect(output).toContain("/tmp/root.mjs:1:2");
  });

  it("会为没有堆栈信息的 Error 输出错误消息", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("stackless");

    delete error.stack;

    logger.error(error);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("stackless"));
  });

  it("会将非 Error 值转换为字符串，并处理无法转换的值", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const unprintable = {
      [Symbol.toPrimitive]() {
        throw new Error("cannot stringify");
      },
    };

    logger.error("plain error", 99, unprintable);

    expect(errorSpy).toHaveBeenCalledTimes(3);
    expect(errorSpy.mock.calls[0]?.[0]).toContain("plain error");
    expect(errorSpy.mock.calls[1]?.[0]).toContain("99");
    expect(errorSpy.mock.calls[2]?.[0]).toContain("[Unprintable value]");
  });
});
