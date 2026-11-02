import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/headify.ts", () => ({
  headify: vi.fn(),
}));

vi.mock("../src/reporter.ts", () => ({
  reportResult: vi.fn(),
}));

vi.mock("../src/logger.ts", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { runCli } from "../src/cli.js";
import { headify } from "../src/headify.ts";
import { logger } from "../src/logger.ts";
import { reportResult } from "../src/reporter.ts";

describe("CLI", () => {
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = undefined;
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
  });

  it("应该解析命令行参数并执行 headify", async () => {
    await runCli(["node", "headify", "src/index.ts"]);

    expect(headify).toHaveBeenCalledWith(["src/index.ts"], expect.any(Object));
  });

  it("应该支持 dry-run 参数", async () => {
    await runCli(["node", "headify", "src/index.ts", "--dry-run"]);

    expect(headify).toHaveBeenCalledWith(
      ["src/index.ts"],
      expect.objectContaining({
        dryRun: true,
      }),
    );
  });

  it("应该支持 start-year 参数", async () => {
    await runCli(["node", "headify", "src/index.ts", "--start-year", "2020"]);

    expect(headify).toHaveBeenCalledWith(
      ["src/index.ts"],
      expect.objectContaining({
        startYear: 2020,
      }),
    );
  });

  it("执行成功后应该报告处理结果", async () => {
    const result = { total: 1 };

    vi.mocked(headify).mockResolvedValue(result as never);

    await runCli(["node", "headify", "src/index.ts"]);

    expect(reportResult).toHaveBeenCalledWith(expect.any(String), result);
  });

  it("执行失败时应该记录错误并设置退出码", async () => {
    const error = new Error("Something went wrong.");

    vi.mocked(headify).mockRejectedValueOnce(error);

    await runCli(["node", "headify", "src/index.ts"]);

    expect(logger.error).toHaveBeenCalledWith(`Unexpected error: ${error.message}`);

    expect(process.exitCode).toBe(1);
  });
});
