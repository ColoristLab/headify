import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

import type { PackageJson } from "pkg-types";

import { createContext } from "./context.js";
import { findFiles, hasBanner, prependBanner } from "./file.js";
import { renderBanner, resolveTemplate } from "./renderer.js";
import type { FileStatus, HeadmarkFileResult, HeadmarkOptions, HeadmarkResult } from "./types.js";

export const defaultOptions: Required<HeadmarkOptions> = {
  cwd: process.cwd(),
  template: "",
  exclude: [],
  dryRun: false,
};

export async function headmark(
  patterns: string[],
  options: HeadmarkOptions = {},
): Promise<HeadmarkResult> {
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

  const packagePath = resolve(cwd, "package.json");
  const packageMetadata = JSON.parse(await readFile(packagePath, "utf8")) as PackageJson;

  // 整个任务只加载一次模板。
  const templateMethod = await resolveTemplate(template);

  const results: HeadmarkFileResult[] = [];

  let updated = 0;
  let unchanged = 0;
  let wouldUpdate = 0;

  for (const file of files) {
    const context = createContext(packageMetadata, file, cwd);
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
 * 验证 headmark 参数。
 */
function validateOptions(patterns: unknown, options: Required<HeadmarkOptions>): void {
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
