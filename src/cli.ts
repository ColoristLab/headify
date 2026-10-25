#!/usr/bin/env node

import cac from "cac";

import pkg from "../package.json" with { type: "json" };
import { logger } from "./logger.ts";

const cli = cac(pkg.name);

cli.help().version(pkg.version);

cli
  .command("<...files>", "Prepend banner headers to files.", {
    ignoreOptionDefaultValue: true,
    allowUnknownOptions: true,
  })
  .option("-t, --template <path>", "Path to Eta template file")
  .option("-e, --exclude <...patterns>", "Exclude files or directories (supports glob)", {
    type: [],
  })
  .option("--dry-run", "Preview changes without writing files")
  .action(async (files: string[], options) => {
    const [{ headify }, { reportResult }] = await Promise.all([
      import("./headify.ts"),
      import("./reporter.ts"),
    ]);

    const result = await headify(files, options);

    reportResult(pkg.version, result);
  });

/**
 * 解析命令行参数并执行匹配的命令。
 */
export async function runCli(argv: string[] = process.argv): Promise<void> {
  try {
    cli.parse(argv, { run: false });

    await cli.runMatchedCommand();
  } catch (error: unknown) {
    logger.error(error);
    process.exitCode = 1;
  }
}

void runCli();
