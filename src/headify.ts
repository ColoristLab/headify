import { relative } from "node:path";

import { createContext } from "./context.js";
import { findFiles, hasBanner, loadPackage, prependBanner } from "./file.js";
import { renderBanner, resolveTemplate } from "./renderer.js";
import type { FileStatus, FileResult, HeadifyOptions, HeadifyResult } from "./types.js";

export const defaultOptions: Required<HeadifyOptions> = {
  cwd: process.cwd(),
  template: "",
  exclude: [],
  dryRun: false,
};

export async function headify(
  patterns: string[],
  options: HeadifyOptions = {},
): Promise<HeadifyResult> {
  const config = {
    ...defaultOptions,
    ...options,
  };

  validateOptions(patterns, config);

  const { cwd, template, exclude, dryRun } = config;
  const startedAt = Date.now();

  const files = await findFiles(patterns, { cwd, exclude });

  // 没有匹配文件时直接返回空结果，不读取 package.json。
  if (files.length === 0) {
    return {
      template,
      dryRun,
      total: 0,
      updated: 0,
      unchanged: 0,
      wouldUpdate: 0,
      elapsed: Date.now() - startedAt,
      files: [],
    };
  }

  const pkg = await loadPackage(cwd);

  // 整个任务只加载一次模板。
  const templateMethod = await resolveTemplate(template);

  const results: FileResult[] = [];

  let updated = 0;
  let unchanged = 0;
  let wouldUpdate = 0;

  for (const file of files) {
    const context = createContext(pkg, file, cwd);
    const path = relative(cwd, file).replaceAll("\\", "/");
    const banner = await renderBanner(templateMethod, context);

    let status: FileStatus;

    if (dryRun) {
      if (await hasBanner(file, banner)) {
        unchanged++;
        status = "unchanged";
      } else {
        wouldUpdate++;
        status = "wouldUpdate";
      }
    } else if (await prependBanner(file, banner)) {
      updated++;
      status = "updated";
    } else {
      unchanged++;
      status = "unchanged";
    }

    results.push({ path, status });
  }

  return {
    template,
    dryRun,
    total: results.length,
    updated,
    unchanged,
    wouldUpdate,
    elapsed: Date.now() - startedAt,
    files: results,
  };
}

/**
 * 验证 headify 参数。
 */
function validateOptions(patterns: unknown, options: Required<HeadifyOptions>): void {
  if (!Array.isArray(patterns) || !patterns.every((pattern) => typeof pattern === "string")) {
    throw new TypeError("Expected patterns to be an array of strings.");
  }

  if (typeof options.cwd !== "string") {
    throw new TypeError('Expected "cwd" to be a string.');
  }

  if (typeof options.template !== "string") {
    throw new TypeError('Expected "template" to be a string.');
  }

  if (
    !Array.isArray(options.exclude) ||
    !options.exclude.every((pattern) => typeof pattern === "string")
  ) {
    throw new TypeError('Expected "exclude" to be an array of strings.');
  }

  if (typeof options.dryRun !== "boolean") {
    throw new TypeError('Expected "dryRun" to be a boolean.');
  }
}
