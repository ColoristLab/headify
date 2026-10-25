import { createRequire } from "node:module";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { BannerTemplate } from "./types.ts";

const require = createRequire(import.meta.url);

const cjsExtensions = new Set([".cjs", ".cts"]);

export default async function loadTemplate(templatePath: string): Promise<BannerTemplate> {
  const filePath = resolve(templatePath);
  const extension = extname(filePath).toLowerCase();

  let template: unknown;

  if (cjsExtensions.has(extension)) {
    template = require(filePath);
  } else if ([".js", ".mjs", ".ts", ".mts"].includes(extension)) {
    const mod = await import(pathToFileURL(filePath).href);
    template = mod.default;
  } else {
    throw new TypeError(`Unsupported template extension: ${extension}`);
  }

  if (typeof template !== "function") {
    throw new TypeError(`Template "${filePath}" must export a function as its default export.`);
  }

  return template as BannerTemplate;
}
