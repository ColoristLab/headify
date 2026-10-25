import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- mocks ----
vi.mock("cac", () => {
  const commands: any[] = [];
  const mockCli: any = {};
  mockCli.help = vi.fn(() => mockCli);
  mockCli.version = vi.fn(() => mockCli);
  mockCli.parse = vi.fn();
  mockCli.runMatchedCommand = vi.fn();

  mockCli.command = vi.fn((name: string, desc: string, opts: any) => {
    const cmd: any = { _options: [] };
    cmd.option = vi.fn((flag: string, description: string, config?: any) => {
      cmd._options.push({ flag, description, config });
      return cmd;
    });
    cmd.action = vi.fn((fn: any) => {
      commands.push({ name, desc, opts, options: cmd._options, action: fn });
      return mockCli;
    });
    return cmd;
  });

  const cacFn = vi.fn(() => mockCli);
  (cacFn as any).__mockCli = mockCli;
  (cacFn as any).__commands = commands;
  return { default: cacFn };
});

vi.mock("../src/logger.ts", () => ({
  logger: {
    log: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../src/headmark.ts", () => ({
  headmark: vi.fn(),
}));

vi.mock("../src/reporter.ts", () => ({
  reportResult: vi.fn(),
}));

// ---- imports ----
import cac from "cac";

import { runCli } from "../src/cli.ts";
import { headmark } from "../src/headmark.ts";
import { logger } from "../src/logger.ts";
import { reportResult } from "../src/reporter.ts";

const mockCli = (cac as any).__mockCli;
const commands = (cac as any).__commands;

describe("cli", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.exitCode = 0;
  });

  it("registers the command and its options", () => {
    expect(commands).toHaveLength(1);
    const cmd = commands[0];

    expect(cmd.name).toBe("<...files>");
    expect(cmd.desc).toBe("Prepend banner headers to files.");
    expect(cmd.opts).toEqual({
      ignoreOptionDefaultValue: true,
      allowUnknownOptions: true,
    });

    expect(cmd.options).toEqual([
      {
        flag: "-t, --template <path>",
        description: "Path to Eta template file",
        config: undefined,
      },
      {
        flag: "-e, --exclude <...patterns>",
        description: "Exclude files or directories (supports glob)",
        config: { type: [] },
      },
      {
        flag: "--dry-run",
        description: "Preview changes without writing files",
        config: undefined,
      },
    ]);
  });

  it("parses and runs the matched command", async () => {
    await runCli(["node", "headmark", "src/**/*.ts"]);
    expect(mockCli.parse).toHaveBeenCalledWith(["node", "headmark", "src/**/*.ts"], { run: false });
    expect(mockCli.runMatchedCommand).toHaveBeenCalledTimes(1);
  });

  it("defaults to process.argv", async () => {
    await runCli();
    expect(mockCli.parse).toHaveBeenCalledWith(process.argv, { run: false });
  });

  it("reports errors and sets exit code", async () => {
    mockCli.parse.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    await runCli(["node", "headmark"]);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect((logger.error as any).mock.calls[0][0]).toBeInstanceOf(Error);
    expect(process.exitCode).toBe(1);
  });

  it("action invokes headmark and reportResult", async () => {
    const fakeResult = {
      template: "",
      dryRun: false,
      total: 0,
      updated: 0,
      unchanged: 0,
      wouldUpdate: 0,
      elapsed: 0,
      files: [],
    };
    (headmark as any).mockResolvedValue(fakeResult);

    const cmd = commands[0];
    await cmd.action(["src/**/*.ts"], { template: "x.ts", dryRun: true });

    expect(headmark).toHaveBeenCalledWith(["src/**/*.ts"], {
      template: "x.ts",
      dryRun: true,
    });
    expect(reportResult).toHaveBeenCalledTimes(1);
    // pkg.version is read from the real package.json
    expect(typeof (reportResult as any).mock.calls[0][0]).toBe("string");
    expect((reportResult as any).mock.calls[0][1]).toBe(fakeResult);
  });
});
