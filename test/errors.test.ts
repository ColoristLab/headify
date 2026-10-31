import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loggerError } = vi.hoisted(() => ({
  loggerError: vi.fn(),
}));

vi.mock("../src/logger.ts", () => ({
  logger: { error: loggerError },
}));

import { HeadifyError, handleError } from "../src/errors.ts";

describe("Errors", () => {
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    process.exitCode = undefined;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("HeadifyError 应输出具体错误信息", () => {
    const error = new HeadifyError("Cannot find package.json.", "PACKAGE_NOT_FOUND");

    handleError(error);

    expect(loggerError).toHaveBeenCalledWith(error.message);
    expect(process.exitCode).toBe(1);
  });

  it("普通 Error 应输出 Unexpected error", () => {
    const error = new Error("unexpected failure");

    handleError(error);

    expect(loggerError).toHaveBeenCalledWith(`Unexpected error: ${error.message}`);
    expect(process.exitCode).toBe(1);
  });

  it("非 Error 异常应输出未知错误信息", () => {
    handleError("unknown");

    expect(loggerError).toHaveBeenCalledWith("An unknown error occurred.");
    expect(process.exitCode).toBe(1);
  });
});
