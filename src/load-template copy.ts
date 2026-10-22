import { extname, resolve } from "node:path";

import { createJiti } from "jiti";

import type { HeadmarkContext } from "./types.js";

export type DefineTemplate = (ctx: HeadmarkContext) => string | Promise<string>;

const SUPPORTED_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts", ".mts", ".cts"]);

const jiti = createJiti(import.meta.url);

export default async function loadTemplate(templatePath: string): Promise<DefineTemplate> {
  const filePath = resolve(templatePath);

  console.log(filePath);

  const extension = extname(filePath).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(
      `Unsupported template extension "${extension}". ` +
        `Supported extensions: ${[...SUPPORTED_EXTENSIONS].join(", ")}`,
    );
  }

  const mod = await jiti.import(filePath);

  if (!mod || typeof mod !== "object" || !("default" in mod) || typeof mod.default !== "function") {
    throw new TypeError(
      `Invalid template "${filePath}". ` + `Expected a default-exported defineTemplate function.`,
    );
  }

  return mod.default as DefineTemplate;
}
