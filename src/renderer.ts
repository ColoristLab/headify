import loadTemplate from "./load-template.ts";
import { defaultTemplate } from "./template.js";
import type { HeadmarkContext } from "./types.js";

export interface RenderOptions {
  template?: string;
  context: HeadmarkContext;
}

/**
 * 渲染文件头部内容。
 */
export async function renderBanner({ template, context }: RenderOptions): Promise<string> {
  let templateMethod;

  if (template) {
    templateMethod = await loadTemplate(template);
  } else {
    templateMethod = defaultTemplate;
  }

  const output = templateMethod(context);

  if (typeof output !== "string") {
    throw new Error("Failed to render banner template.");
  }

  return output;
}
