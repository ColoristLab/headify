import { createContext } from "./context.js";
import { findFiles, hasBanner, prependBanner } from "./file.js";
import { renderBanner } from "./renderer.js";
import type { FileResult, HeadmarkOptions, HeadmarkResult } from "./types.js";

export type {
  FileAction,
  FileContext,
  FileResult,
  HeadmarkContext,
  HeadmarkOptions,
  HeadmarkResult,
} from "./types.js";

export async function headmark(
  patterns: string[],
  options: HeadmarkOptions = {},
): Promise<HeadmarkResult> {
  const { template, exclude = [], dryRun = false } = options;

  const files = await findFiles(patterns, { exclude });

  if (files.length === 0) {
    return {
      files: [],
      updated: 0,
      unchanged: 0,
      dryRun: 0,
    };
  }

  const packageMetadata = await resolvePackageMetadata();
  const results: FileResult[] = [];

  for (const file of files) {
    const context = createContext(packageMetadata, file);

    console.log(context);

    // const banner = await renderBanner({
    //   template,
    //   context,
    // });

    // if (await hasBanner(file, banner)) {
    //   results.push({
    //     file,
    //     action: "unchanged",
    //   });

    //   continue;
    // }

    // if (dryRun) {
    //   results.push({
    //     file,
    //     action: "dry-run",
    //   });

    //   continue;
    // }

    // await prependBanner(file, banner);

    // results.push({
    //   file,
    //   action: "updated",
    // });
  }

  return {
    files: results,
    updated: results.filter((item) => item.action === "updated").length,
    unchanged: results.filter((item) => item.action === "unchanged").length,
    dryRun: results.filter((item) => item.action === "dry-run").length,
  };
}
