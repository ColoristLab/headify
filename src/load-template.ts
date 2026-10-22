import { createRequire } from "node:module";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export type DefineTemplate<TContext = unknown> = (ctx: TContext) => string | Promise<string>;

const require = createRequire(import.meta.url);

const esmExtensions = new Set([".mjs", ".mts"]);
const cjsExtensions = new Set([".cjs", ".cts"]);

export default async function loadTemplate<TContext = unknown>(
  templatePath: string,
): Promise<DefineTemplate<TContext>> {
  const filePath = resolve(templatePath);
  const extension = extname(filePath).toLowerCase();

  let template: unknown;

  if (esmExtensions.has(extension)) {
    const mod = await import(pathToFileURL(filePath).href);
    template = mod.default;
  } else if (cjsExtensions.has(extension)) {
    template = require(filePath);
  } else if (extension === ".js" || extension === ".ts") {
    const mod = await import(pathToFileURL(filePath).href);
    template = mod.default;
  } else {
    throw new TypeError(`Unsupported template extension: ${extension}`);
  }

  if (typeof template !== "function") {
    throw new TypeError(`Template "${filePath}" must export a function as its default export.`);
  }

  return template as DefineTemplate<TContext>;
}
