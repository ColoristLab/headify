import { styleText } from "node:util";

import pkg from "../package.json" with { type: "json" };
import { logger, colors } from "./logger.js";
import type { FileStatus, HeadifyResult } from "./types.js";

/**
 * 输出单个文件的处理结果。
 */
function reportFile(path: string, status: FileStatus): void {
  const separator = path.lastIndexOf("/");
  const directory = separator === -1 ? "" : path.slice(0, separator + 1);
  const filename = path.slice(separator + 1);

  const suffix = {
    updated: "",
    unchanged: ` (Unchanged)`,
    wouldUpdate: ` ${styleText(colors.info, "(Would update)")}`,
  }[status];

  const isUnchanged = status === "unchanged";

  logger.info(
    `${styleText(colors.muted, directory)}${styleText(
      isUnchanged ? colors.muted : "reset",
      filename,
    )}${suffix}`,
  );
}

/**
 * 根据任务结果输出控制台报告。
 */
export function reportResult(cliVersion: string, result: HeadifyResult): void {
  if (result.total === 0) {
    logger.warn("No files matched the specified patterns.");
    return;
  }

  logger.info(styleText(colors.info, `${pkg.name} v${cliVersion}`));
  logger.info(`Matched ${result.total} files`);
  logger.info(`Template: ${styleText(colors.info, result.template || "default")}`);

  if (result.dryRun) {
    logger.info(styleText(colors.warn, "Dry run: no files will be modified"));
  }

  for (const file of result.files) {
    reportFile(file.path, file.status);
  }

  const summary = result.dryRun
    ? `Would update: ${result.wouldUpdate} Unchanged: ${result.unchanged}`
    : `Updated: ${result.updated} Unchanged: ${result.unchanged}`;

  logger.info(summary);
  logger.success(`Completed in ${styleText(colors.success, `${result.elapsed} ms`)}`);
}
