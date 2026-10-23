import { readPackageJSON } from "pkg-types";

import { createContext } from "./context.js";
import { findFiles } from "./file.js";
import { logger } from "./logger.ts";
import { renderBanner } from "./renderer.ts";
import type { HeadmarkOptions } from "./types.js";

export const defaultOptions: Required<HeadmarkOptions> = {
  cwd: process.cwd(),
  template: "",
  exclude: [],
  dryRun: false,
};

export async function headmark(patterns: string[], options: HeadmarkOptions = {}): Promise<void> {
  const { template, exclude, dryRun, cwd } = {
    ...defaultOptions,
    ...options,
  };

  const files = await findFiles(patterns, { cwd, exclude });

  if (files.length === 0) {
    logger.warn("No files matched the specified patterns.");
    return;
  }

  const packageMetadata = await readPackageJSON(process.cwd());

  for (const file of files) {
    const context = createContext(packageMetadata, file, cwd);

    const banner = await renderBanner({ template, context });

    console.log(banner);

    // if (await hasBanner(file, banner)) {
    //   logger.info(`Unchanged: ${file}`);
    //   continue;
    // }

    // if (dryRun) {
    //   logger.info(`Would update: ${file}`);

    //   continue;
    // }

    // await prependBanner(file, banner);

    // logger.success(`Updated: ${file}`);
  }
}
