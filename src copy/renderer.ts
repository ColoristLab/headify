import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Eta } from "eta";

import { defaultTemplate } from "./template.js";
import type { HeadnoteContext } from "./types.js";

const eta = new Eta({
  autoEscape: false,
});

export interface RenderOptions {
  template?: string;
  context: HeadnoteContext;
}

/**
 * 渲染文件头部内容。
 */
export async function renderBanner({ template, context }: RenderOptions): Promise<string> {
  const source = template ? await readFile(resolve(template), "utf8") : defaultTemplate;

  const output = eta.renderString(source, context);

  if (typeof output !== "string") {
    throw new Error("Failed to render banner template.");
  }

  return output;
}
