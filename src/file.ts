import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { resolve } from "node:path";

import type { HeadmarkOptions } from "./types.js";

type FindFilesOptions = Required<Pick<HeadmarkOptions, "exclude" | "cwd">>;
/**
 * 查找目标文件。
 */
export async function findFiles(
  patterns: string | string[],
  options: FindFilesOptions,
): Promise<string[]> {
  const { cwd, exclude } = options;
  const files = new Set<string>();

  for await (const file of glob(patterns, {
    cwd,
    exclude,
  })) {
    files.add(resolve(cwd, file));
  }

  return [...files];
}

/**
 * 规范 banner 的尾部空白。
 */
function normalizeBanner(banner: string): string {
  return banner.trimEnd();
}

/**
 * 判断文件内容是否已经包含指定 banner。
 */
function hasBannerContent(content: string, banner: string): boolean {
  const normalizedBanner = normalizeBanner(banner);

  return (
    content.startsWith(normalizedBanner) &&
    (content.length === normalizedBanner.length ||
      content.startsWith(`${normalizedBanner}\n`) ||
      content.startsWith(`${normalizedBanner}\r\n`))
  );
}

/**
 * 检查文件是否已经包含当前 banner。
 */
export async function hasBanner(file: string, banner: string): Promise<boolean> {
  const content = await readFile(file, "utf8");

  return hasBannerContent(content, banner);
}

/**
 * 在文件开头插入 banner。
 *
 * 返回 false 表示文件已经存在相同的 banner。
 */
export async function prependBanner(file: string, banner: string): Promise<boolean> {
  const content = await readFile(file, "utf8");
  const normalizedBanner = normalizeBanner(banner);

  if (hasBannerContent(content, normalizedBanner)) {
    return false;
  }

  const separator = content.length > 0 ? "\n\n" : "\n";

  await writeFile(file, `${normalizedBanner}${separator}${content}`, "utf8");

  return true;
}
