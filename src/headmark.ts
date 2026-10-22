import { readPackageJSON } from "pkg-types";

import { createContext } from "./context.js";
import { findFiles } from "./file.js";
import { logger } from "./logger.ts";
import type { HeadmarkOptions } from "./types.js";

export async function headmark(patterns: string[], options: HeadmarkOptions = {}): Promise<void> {
  const { template, exclude = [], dryRun = false } = options;

  const files = await findFiles(patterns, { exclude });

  if (files.length === 0) {
    logger.warn("No files matched the specified patterns.");
    return;
  }

  const packageMetadata = await readPackageJSON(process.cwd());

  for (const file of files) {
    const context = createContext(packageMetadata, file);

    console.log(context);

    // const banner = await renderBanner({ template, context });

    // if (await hasBanner(file, banner)) {
    //   logger.info(`Unchanged: ${file}`);
    //   continue;
    // }

    if (dryRun) {
      logger.info(`Would update: ${file}`);

      continue;
    }

    // await prependBanner(file, banner);

    logger.success(`Updated: ${file}`);
  }
}
