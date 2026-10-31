import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { fakeCli, cacMock, actionHolder, loggerError } = vi.hoisted(() => {
  const hoistedActionHolder: {
    callback?: (...args: any[]) => unknown;
  } = {};

  const hoistedFakeCli: any = {
    help: vi.fn(),
    version: vi.fn(),
    command: vi.fn(),
    option: vi.fn(),
    action: vi.fn(),
    parse: vi.fn(),
    runMatchedCommand: vi.fn(),
  };

  hoistedFakeCli.help.mockReturnValue(hoistedFakeCli);
  hoistedFakeCli.version.mockReturnValue(hoistedFakeCli);
  hoistedFakeCli.command.mockReturnValue(hoistedFakeCli);
  hoistedFakeCli.option.mockReturnValue(hoistedFakeCli);

  hoistedFakeCli.action.mockImplementation((callback: (...args: any[]) => unknown) => {
    hoistedActionHolder.callback = callback;
    return hoistedFakeCli;
  });

  const hoistedCacMock = vi.fn(() => hoistedFakeCli);
  const hoistedLoggerError = vi.fn();

  return {
    fakeCli: hoistedFakeCli,
    cacMock: hoistedCacMock,
    actionHolder: hoistedActionHolder,
    loggerError: hoistedLoggerError,
  };
});

vi.mock("cac", () => ({ default: cacMock }));
vi.mock("../src/headify.ts", () => ({ headify: vi.fn() }));
vi.mock("../src/reporter.ts", () => ({ reportResult: vi.fn() }));
vi.mock("../src/logger.ts", () => ({
  logger: { error: loggerError },
}));

describe("CLI", () => {
  const originalArgv = process.argv;
  const originalExitCode = process.exitCode;

  beforeEach(async () => {
    vi.resetModules();

    process.argv = ["node", "headify", "src/**/*.ts"];
    process.exitCode = undefined;

    // exactOptionalPropertyTypes: true 下，使用 delete 清除可选属性。
    delete actionHolder.callback;

    vi.clearAllMocks();

    fakeCli.help.mockReturnValue(fakeCli);
    fakeCli.version.mockReturnValue(fakeCli);
    fakeCli.command.mockReturnValue(fakeCli);
    fakeCli.option.mockReturnValue(fakeCli);

    fakeCli.action.mockImplementation((callback: (...args: any[]) => unknown) => {
      actionHolder.callback = callback;
      return fakeCli;
    });

    await import("../src/cli.js");

    vi.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("解析命令行参数并执行匹配的命令", async () => {
    const { runCli } = await import("../src/cli.js");

    await runCli(["node", "headify", "src/index.ts"]);

    expect(fakeCli.parse).toHaveBeenCalledWith(["node", "headify", "src/index.ts"], { run: false });
    expect(fakeCli.runMatchedCommand).toHaveBeenCalledTimes(1);
    expect(process.exitCode).not.toBe(1);
  });

  it("解析或执行发生错误时记录错误并将退出码设为 1", async () => {
    const { runCli } = await import("../src/cli.js");
    const error = new Error("invalid arguments");

    fakeCli.runMatchedCommand.mockRejectedValueOnce(error);

    await runCli(["node", "headify", "--invalid"]);

    expect(loggerError).toHaveBeenCalledWith(`Unexpected error: ${error.message}`);
    expect(process.exitCode).toBe(1);
  });

  it("执行已注册的 action 并报告处理结果", async () => {
    const { headify } = await import("../src/headify.ts");
    const { reportResult } = await import("../src/reporter.ts");
    const result = { total: 1 };

    vi.mocked(headify).mockResolvedValue(result as never);

    await actionHolder.callback?.(["src/index.ts"], { dryRun: true });

    expect(headify).toHaveBeenCalledWith(["src/index.ts"], { dryRun: true });
    expect(reportResult).toHaveBeenCalledWith(expect.any(String), result);
  });
});
