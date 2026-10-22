import { readFile, writeFile } from "node:fs/promises";

import fg from "fast-glob";

import type { FileResult, HeadmarkOptions } from "./types.js";

/**
 * 查找目标文件。
 */
export async function findFiles(
  patterns: string[],
  options: Pick<HeadmarkOptions, "exclude"> = {},
): Promise<string[]> {
  return fg(patterns, {
    ignore: options.exclude ?? [],
    onlyFiles: true,
    unique: true,
    dot: true,
  });
}

/**
 * 规范 banner 的尾部空白。
 */
function normalizeBanner(banner: string): string {
  return banner.trimEnd();
}

/**
 * 检查文件是否已经包含当前 banner。
 */
export async function hasBanner(file: string, banner: string): Promise<boolean> {
  const content = await readFile(file, "utf8");
  const normalizedBanner = normalizeBanner(banner);

  return (
    content.startsWith(normalizedBanner) &&
    (content.length === normalizedBanner.length ||
      content.startsWith(normalizedBanner + "\n", 0) ||
      content.startsWith(normalizedBanner + "\r\n", 0))
  );
}

/**
 * 在文件开头插入 banner。
 *
 * 返回 false 表示文件已经存在相同的 banner。
 */
export async function prependBanner(file: string, banner: string): Promise<boolean> {
  const content = await readFile(file, "utf8");
  const normalizedBanner = normalizeBanner(banner);

  if (
    content.startsWith(normalizedBanner) &&
    (content.length === normalizedBanner.length ||
      content.startsWith(normalizedBanner + "\n") ||
      content.startsWith(normalizedBanner + "\r\n"))
  ) {
    return false;
  }

  const separator = content.length > 0 ? "\n\n" : "\n";

  await writeFile(file, `${normalizedBanner}${separator}${content}`, "utf8");

  return true;
}

/**
 * 仅检查文件，不修改内容。
 */
export async function inspectFile(file: string, banner: string): Promise<FileResult> {
  const exists = await hasBanner(file, banner);

  return {
    file,
    action: exists ? "unchanged" : "dry-run",
  };
}
